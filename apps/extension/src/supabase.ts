import { createClient } from '@supabase/supabase-js'
import type { SupportedStorage } from '@supabase/supabase-js'
import { runtime } from './runtime'
import type { Category, Prompt } from './types'

function hasChromeStorage() {
  return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local)
}

function supabaseProjectRefFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname
    return host.split('.')[0] || 'default'
  } catch {
    return 'default'
  }
}

const projectRef = supabaseProjectRefFromUrl(runtime.supabaseUrl)
const authStorageKey = `sb-${projectRef}-auth-token`

function createChromeLocalStorage(): SupportedStorage {
  return {
    getItem: async (key: string) => {
      if (!hasChromeStorage()) return null
      const result = await chrome.storage.local.get(key)
      const value = result[key]
      return typeof value === 'string' ? value : null
    },
    setItem: async (key: string, value: string) => {
      if (!hasChromeStorage()) return
      await chrome.storage.local.set({ [key]: value })
    },
    removeItem: async (key: string) => {
      if (!hasChromeStorage()) return
      await chrome.storage.local.remove(key)
    },
  }
}

export const supabase = createClient(runtime.supabaseUrl, runtime.supabaseAnonKey, {
  auth: {
    storage: createChromeLocalStorage(),
    persistSession: true,
    autoRefreshToken: true,
    flowType: 'pkce',
    storageKey: authStorageKey,
  },
})

function launchWebAuthFlowPromise(url: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({ url, interactive: true }, (redirectUrl: string | undefined) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }
      resolve(redirectUrl)
    })
  })
}

/** 与 Web 端一致：Google OAuth；需在 Supabase 控制台将 `chrome.identity.getRedirectURL()` 写入 Redirect URLs */
export async function signInWithGoogleExtension(): Promise<{ error: Error | null }> {
  try {
    const redirectTo = chrome.identity.getRedirectURL()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    })
    if (error) return { error }
    if (!data.url) return { error: new Error('未获取到授权地址') }

    const redirectedTo = await launchWebAuthFlowPromise(data.url)
    if (!redirectedTo) return { error: new Error('授权已取消') }

    const callbackUrl = new URL(redirectedTo)
    const code = callbackUrl.searchParams.get('code')
    if (code) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      return { error: exchangeError }
    }

    const hash = callbackUrl.hash.replace(/^#/, '')
    if (hash) {
      const params = new URLSearchParams(hash)
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')
      if (access_token && refresh_token) {
        const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token })
        return { error: sessionError }
      }
    }

    return { error: new Error('无法解析登录回调') }
  } catch (e) {
    return { error: e instanceof Error ? e : new Error('Google 登录失败') }
  }
}

export async function optimizePromptWithAI(content: string): Promise<{ optimized: string | null; error: string | null }> {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return { optimized: null, error: runtime.hasSupabaseConfig ? '请先登录' : '服务未配置' }
    }

    const response = await fetch(runtime.optimizeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ content }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { optimized: null, error: data.error || '优化失败' }
    }

    return { optimized: data.optimized ?? null, error: null }
  } catch (error) {
    return { optimized: null, error: error instanceof Error ? error.message : '网络错误，请稍后重试' }
  }
}

export async function getSessionToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

export async function fetchRemotePrompts(userId: string): Promise<Prompt[]> {
  if (!runtime.hasSupabaseConfig) return []
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    categoryId: item.category_id ?? null,
    tags: item.tags ?? [],
    updatedAt: item.updated_at ?? item.created_at ?? new Date().toISOString(),
  }))
}

export async function fetchRemoteCategories(userId: string): Promise<Category[]> {
  if (!runtime.hasSupabaseConfig) return []
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    parentId: item.parent_id ?? null,
  }))
}

export async function createRemotePrompt(input: Omit<Prompt, 'id' | 'updatedAt'>) {
  if (!runtime.hasSupabaseConfig) throw new Error('服务未配置')
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('请先登录')

  const { data, error } = await supabase.from('prompts').insert({
    title: input.title,
    content: input.content,
    category_id: input.categoryId,
    tags: input.tags,
    user_id: session.user.id,
  }).select('*').single()

  if (error) throw error
  return {
    id: data.id,
    title: data.title,
    content: data.content,
    categoryId: data.category_id ?? null,
    tags: data.tags ?? [],
    updatedAt: data.updated_at ?? data.created_at ?? new Date().toISOString(),
  } satisfies Prompt
}

export async function updateRemotePrompt(id: string, patch: Partial<Prompt>) {
  if (!runtime.hasSupabaseConfig) throw new Error('服务未配置')
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('请先登录')

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (patch.title !== undefined) payload.title = patch.title
  if (patch.content !== undefined) payload.content = patch.content
  if (patch.categoryId !== undefined) payload.category_id = patch.categoryId
  if (patch.tags !== undefined) payload.tags = patch.tags

  const { data, error } = await supabase
    .from('prompts')
    .update(payload)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select('*')
    .single()
  if (error) throw error
  return {
    id: data.id,
    title: data.title,
    content: data.content,
    categoryId: data.category_id ?? null,
    tags: data.tags ?? [],
    updatedAt: data.updated_at ?? data.created_at ?? new Date().toISOString(),
  } satisfies Prompt
}

export async function deleteRemotePrompt(id: string) {
  if (!runtime.hasSupabaseConfig) return
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return
  const { error } = await supabase.from('prompts').delete().eq('id', id).eq('user_id', session.user.id)
  if (error) throw error
}

export async function createRemoteCategory(name: string) {
  if (!runtime.hasSupabaseConfig) throw new Error('服务未配置')
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('请先登录')

  const { data, error } = await supabase.from('categories').insert({
    name,
    parent_id: null,
    sort_order: 0,
    user_id: session.user.id,
  }).select('*').single()

  if (error) throw error
  return {
    id: data.id,
    name: data.name,
    parentId: data.parent_id ?? null,
  } satisfies Category
}

export async function updateRemoteCategory(id: string, patch: Partial<Category>) {
  if (!runtime.hasSupabaseConfig) throw new Error('服务未配置')
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('请先登录')

  const payload: Record<string, unknown> = {}
  if (patch.name !== undefined) payload.name = patch.name
  if (patch.parentId !== undefined) payload.parent_id = patch.parentId

  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select('*')
    .single()
  if (error) throw error
  return {
    id: data.id,
    name: data.name,
    parentId: data.parent_id ?? null,
  } satisfies Category
}

export async function deleteRemoteCategory(id: string) {
  if (!runtime.hasSupabaseConfig) return
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return
  const { error } = await supabase.from('categories').delete().eq('id', id).eq('user_id', session.user.id)
  if (error) throw error
}

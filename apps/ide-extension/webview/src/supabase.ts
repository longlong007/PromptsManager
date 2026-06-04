import { createClient } from '@supabase/supabase-js'
import type { SupportedStorage } from '@supabase/supabase-js'
import { runtime } from './runtime'
import type { Category, Prompt } from './types'

function supabaseProjectRefFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname
    return host.split('.')[0] || 'default'
  } catch {
    return 'default'
  }
}

const projectRef = supabaseProjectRefFromUrl(runtime.supabaseUrl)
export const authStorageKey = `sb-${projectRef}-auth-token`

export async function hasPersistedAuth(): Promise<boolean> {
  const value = localStorage.getItem(authStorageKey)
  if (typeof value === 'string') return value.length > 2
  return value != null
}

function createWebviewLocalStorage(): SupportedStorage {
  return {
    getItem: async (key: string) => localStorage.getItem(key),
    setItem: async (key: string, value: string) => {
      localStorage.setItem(key, value)
    },
    removeItem: async (key: string) => {
      localStorage.removeItem(key)
    },
  }
}

const QUERY_TIMEOUT_MS = 15000

function querySignal() {
  return AbortSignal.timeout(QUERY_TIMEOUT_MS)
}

export const supabase = createClient(runtime.supabaseUrl, runtime.supabaseAnonKey, {
  auth: {
    storage: createWebviewLocalStorage(),
    persistSession: true,
    autoRefreshToken: true,
    flowType: 'pkce',
    storageKey: authStorageKey,
  },
})

export async function signInWithGoogleIde(): Promise<{ error: Error | null }> {
  return {
    error: new Error('IDE 扩展暂不支持 Google 登录，请使用邮箱密码（与网页端同一账号）'),
  }
}

export async function optimizePromptWithAI(
  content: string,
): Promise<{ optimized: string | null; error: string | null }> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { optimized: null, error: runtime.hasSupabaseConfig ? '请先登录' : '服务未配置' }
    }

    const response = await fetch(runtime.optimizeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: runtime.supabaseAnonKey,
      },
      body: JSON.stringify({ content }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { optimized: null, error: data.error || '优化失败' }
    }

    return { optimized: data.optimized ?? null, error: null }
  } catch (error) {
    return {
      optimized: null,
      error: error instanceof Error ? error.message : '网络错误，请稍后重试',
    }
  }
}

export async function getSessionToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

export async function fetchRemotePrompts(userId: string): Promise<Prompt[]> {
  if (!runtime.hasSupabaseConfig) return []
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .abortSignal(querySignal())
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
    .abortSignal(querySignal())
  if (error) throw error
  return (data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    parentId: item.parent_id ?? null,
  }))
}

export async function createRemotePrompt(input: Omit<Prompt, 'id' | 'updatedAt'>) {
  if (!runtime.hasSupabaseConfig) throw new Error('服务未配置')
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new Error('请先登录')

  const { data, error } = await supabase
    .from('prompts')
    .insert({
      title: input.title,
      content: input.content,
      category_id: input.categoryId,
      tags: input.tags,
      user_id: session.user.id,
    })
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

export async function updateRemotePrompt(id: string, patch: Partial<Prompt>) {
  if (!runtime.hasSupabaseConfig) throw new Error('服务未配置')
  const {
    data: { session },
  } = await supabase.auth.getSession()
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
  if (!runtime.hasSupabaseConfig) throw new Error('服务未配置')
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new Error('请先登录')
  const { error } = await supabase.from('prompts').delete().eq('id', id).eq('user_id', session.user.id)
  if (error) throw error
}

export async function createRemoteCategory(name: string) {
  if (!runtime.hasSupabaseConfig) throw new Error('服务未配置')
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new Error('请先登录')

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name,
      parent_id: null,
      sort_order: 0,
      user_id: session.user.id,
    })
    .select('*')
    .single()

  if (error) throw error
  return {
    id: data.id,
    name: data.name,
    parentId: data.parent_id ?? null,
  } satisfies Category
}

export async function updateRemoteCategory(id: string, patch: Partial<Category>) {
  if (!runtime.hasSupabaseConfig) throw new Error('服务未配置')
  const {
    data: { session },
  } = await supabase.auth.getSession()
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
  if (!runtime.hasSupabaseConfig) throw new Error('服务未配置')
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new Error('请先登录')
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id)
  if (error) throw error
}

import { createClient } from '@supabase/supabase-js'
import { runtime } from './runtime'
import type { AuthState, Category, Prompt } from './types'

const fallbackClient = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    signInWithPassword: async () => ({ data: { session: null, user: null }, error: new Error('Supabase 未配置') }),
    signUp: async () => ({ data: { session: null, user: null }, error: new Error('Supabase 未配置') }),
    setSession: async () => ({ data: { session: null }, error: null }),
  },
  from: () => ({
    select: () => ({ order: async () => ({ data: [], error: null }) }),
    insert: () => ({ select: () => ({ single: async () => ({ data: null, error: new Error('Supabase 未配置') }) }) }),
    update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: new Error('Supabase 未配置') }) }) }) }),
    delete: () => ({ eq: async () => ({ error: new Error('Supabase 未配置') }) }),
  }),
}

export const supabase = runtime.hasSupabaseConfig
  ? createClient(runtime.supabaseUrl, runtime.supabaseAnonKey)
  : (fallbackClient as typeof fallbackClient & ReturnType<typeof createClient>)

export async function optimizePromptWithAI(content: string): Promise<{ optimized: string | null; error: string | null }> {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return { optimized: null, error: runtime.hasSupabaseConfig ? '请先登录 Supabase' : 'Supabase 未配置' }
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

export async function fetchRemotePrompts(): Promise<Prompt[]> {
  if (!runtime.hasSupabaseConfig) return []
  const { data, error } = await supabase.from('prompts').select('*').order('created_at', { ascending: false })
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

export async function fetchRemoteCategories(): Promise<Category[]> {
  if (!runtime.hasSupabaseConfig) return []
  const { data, error } = await supabase.from('categories').select('*').order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    parentId: item.parent_id ?? null,
  }))
}

export async function syncRemoteState(authState: AuthState) {
  if (authState.accessToken) {
    await supabase.auth.setSession({ access_token: authState.accessToken, refresh_token: '' })
  }
}

export async function createRemotePrompt(input: Omit<Prompt, 'id' | 'updatedAt'>) {
  if (!runtime.hasSupabaseConfig) throw new Error('Supabase 未配置')
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('请先登录 Supabase')

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
  if (!runtime.hasSupabaseConfig) throw new Error('Supabase 未配置')
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (patch.title !== undefined) payload.title = patch.title
  if (patch.content !== undefined) payload.content = patch.content
  if (patch.categoryId !== undefined) payload.category_id = patch.categoryId
  if (patch.tags !== undefined) payload.tags = patch.tags

  const { data, error } = await supabase.from('prompts').update(payload).eq('id', id).select('*').single()
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
  const { error } = await supabase.from('prompts').delete().eq('id', id)
  if (error) throw error
}

export async function createRemoteCategory(name: string) {
  if (!runtime.hasSupabaseConfig) throw new Error('Supabase 未配置')
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('请先登录 Supabase')

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
  if (!runtime.hasSupabaseConfig) throw new Error('Supabase 未配置')
  const payload: Record<string, unknown> = {}
  if (patch.name !== undefined) payload.name = patch.name
  if (patch.parentId !== undefined) payload.parent_id = patch.parentId

  const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select('*').single()
  if (error) throw error
  return {
    id: data.id,
    name: data.name,
    parentId: data.parent_id ?? null,
  } satisfies Category
}

export async function deleteRemoteCategory(id: string) {
  if (!runtime.hasSupabaseConfig) return
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_FUNCTION_URL } from '../config/config'
import type {
  Prompt,
  Category,
  Session,
  CreatePromptInput,
  UpdatePromptInput,
  CreateCategoryInput,
} from './types'
import { getSession, setSession } from './storage'

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  auth?: boolean
  prefer?: string
}

function baseUrl(): string {
  return SUPABASE_URL.replace(/\/$/, '')
}

function isConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!isConfigured()) {
    return Promise.reject(new Error('请先在 config/config.ts 配置 Supabase'))
  }

  const session = getSession()
  const headers: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
  }

  if (options.auth && session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`
  } else {
    headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`
  }

  if (options.prefer) {
    headers.Prefer = options.prefer
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${baseUrl()}${path}`,
      method: (options.method || 'GET') as WechatMiniprogram.RequestOption['method'],
      header: headers,
      data: options.body as WechatMiniprogram.IAnyObject | undefined,
      success(res) {
        const status = res.statusCode || 0
        if (status >= 200 && status < 300) {
          resolve(res.data as T)
          return
        }
        const data = res.data as { error?: string; msg?: string; message?: string }
        const msg =
          data?.error || data?.msg || data?.message || `请求失败 (${status})`
        reject(new Error(msg))
      },
      fail(err) {
        reject(new Error(err.errMsg || '网络错误'))
      },
    })
  })
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  try {
    const data = await request<{
      access_token: string
      refresh_token: string
      expires_at?: number
      user: { id: string; email?: string }
    }>('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: { email, password },
    })
    const session: Session = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      user: { id: data.user.id, email: data.user.email },
    }
    setSession(session)
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : '登录失败' }
  }
}

export async function signUp(
  email: string,
  password: string
): Promise<{ error: string | null; needsEmailConfirm?: boolean }> {
  try {
    await request('/auth/v1/signup', {
      method: 'POST',
      body: { email, password },
    })
    return { error: null, needsEmailConfirm: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : '注册失败' }
  }
}

export function signOut(): void {
  setSession(null)
}

export function getCurrentSession(): Session | null {
  return getSession()
}

export async function fetchPrompts(): Promise<Prompt[]> {
  const session = getSession()
  if (!session) return []
  const data = await request<Prompt[]>(
    `/rest/v1/prompts?user_id=eq.${session.user.id}&order=created_at.desc`,
    { auth: true }
  )
  return data || []
}

export async function fetchCategories(): Promise<Category[]> {
  const session = getSession()
  if (!session) return []
  const data = await request<Category[]>(
    `/rest/v1/categories?user_id=eq.${session.user.id}&order=sort_order.asc`,
    { auth: true }
  )
  return data || []
}

export async function createPrompt(
  input: CreatePromptInput
): Promise<{ error: string | null }> {
  const session = getSession()
  if (!session) return { error: '未登录' }
  try {
    await request('/rest/v1/prompts', {
      method: 'POST',
      auth: true,
      prefer: 'return=minimal',
      body: { ...input, user_id: session.user.id },
    })
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : '创建失败' }
  }
}

export async function updatePrompt(
  id: string,
  input: UpdatePromptInput
): Promise<{ error: string | null }> {
  try {
    await request(`/rest/v1/prompts?id=eq.${id}`, {
      method: 'PATCH',
      auth: true,
      prefer: 'return=minimal',
      body: { ...input, updated_at: new Date().toISOString() },
    })
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : '更新失败' }
  }
}

export async function deletePrompt(id: string): Promise<{ error: string | null }> {
  try {
    await request(`/rest/v1/prompts?id=eq.${id}`, {
      method: 'DELETE',
      auth: true,
    })
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : '删除失败' }
  }
}

export async function deletePrompts(ids: string[]): Promise<{ error: string | null }> {
  if (ids.length === 0) return { error: null }
  try {
    const inList = ids.join(',')
    await request(`/rest/v1/prompts?id=in.(${inList})`, {
      method: 'DELETE',
      auth: true,
    })
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : '批量删除失败' }
  }
}

export async function searchPrompts(
  query: string,
  categoryId?: string,
  tags?: string[]
): Promise<Prompt[]> {
  const session = getSession()
  if (!session) return []

  const params: string[] = [
    `user_id=eq.${session.user.id}`,
    'order=created_at.desc',
  ]

  if (query) {
    const q = encodeURIComponent(`%${query}%`)
    params.push(`or=(title.ilike.${q},content.ilike.${q})`)
  }
  if (categoryId) {
    params.push(`category_id=eq.${categoryId}`)
  }
  if (tags && tags.length > 0) {
    params.push(`tags=ov.{${tags.join(',')}}`)
  }

  const data = await request<Prompt[]>(`/rest/v1/prompts?${params.join('&')}`, {
    auth: true,
  })
  return data || []
}

export async function createCategory(
  input: CreateCategoryInput
): Promise<{ error: string | null }> {
  const session = getSession()
  if (!session) return { error: '未登录' }
  try {
    await request('/rest/v1/categories', {
      method: 'POST',
      auth: true,
      prefer: 'return=minimal',
      body: { ...input, user_id: session.user.id },
    })
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : '创建分类失败' }
  }
}

export async function updateCategory(
  id: string,
  input: Partial<CreateCategoryInput>
): Promise<{ error: string | null }> {
  try {
    await request(`/rest/v1/categories?id=eq.${id}`, {
      method: 'PATCH',
      auth: true,
      prefer: 'return=minimal',
      body: input,
    })
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : '更新分类失败' }
  }
}

export async function deleteCategory(id: string): Promise<{ error: string | null }> {
  try {
    await request(`/rest/v1/categories?id=eq.${id}`, {
      method: 'DELETE',
      auth: true,
    })
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : '删除分类失败' }
  }
}

export async function incrementUsageCount(id: string, current: number): Promise<void> {
  try {
    await request(`/rest/v1/prompts?id=eq.${id}`, {
      method: 'PATCH',
      auth: true,
      prefer: 'return=minimal',
      body: {
        usage_count: current + 1,
        updated_at: new Date().toISOString(),
      },
    })
  } catch {
    /* 统计失败不影响复制 */
  }
}

function optimizeUrl(): string {
  if (SUPABASE_FUNCTION_URL) return SUPABASE_FUNCTION_URL
  return baseUrl() ? `${baseUrl()}/functions/v1/optimize-prompt` : ''
}

export async function optimizePromptWithAI(
  content: string
): Promise<{ optimized: string | null; error: string | null }> {
  const session = getSession()
  const url = optimizeUrl()

  if (!url) {
    return { optimized: null, error: '未配置 Supabase 地址' }
  }
  if (!session) {
    return { optimized: null, error: '请先登录' }
  }

  return new Promise((resolve) => {
    wx.request({
      url,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      data: { content },
      success(res) {
        const data = res.data as { optimized?: string; error?: string }
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ optimized: data.optimized || null, error: null })
        } else {
          resolve({
            optimized: null,
            error: data.error || '优化失败',
          })
        }
      },
      fail() {
        resolve({ optimized: null, error: '网络错误，请稍后重试' })
      },
    })
  })
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const SUPABASE_EDGE_FUNCTION_URL = 'https://ohzaxwvqwvufjmymfunl.supabase.co/functions/v1/optimize-prompt'

export async function optimizePromptWithAI(content: string): Promise<{ optimized: string | null; error: string | null }> {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return { optimized: null, error: '请先登录' }
  }

  try {
    const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ content })
    })

    const data = await response.json()

    if (!response.ok) {
      return { optimized: null, error: data.error || '优化失败' }
    }

    return { optimized: data.optimized, error: null }
  } catch (err) {
    console.error('AI optimization error:', err)
    return { optimized: null, error: '网络错误，请稍后重试' }
  }
}

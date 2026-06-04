// AI Prompt 优化 — 服务端调用 DeepSeek，API Key 仅存于 Supabase Secrets

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

const DEFAULT_MODEL = 'deepseek-chat'
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

const SYSTEM_PROMPT = `你是一位专业的 AI Prompt 工程师。用户会提供一段待优化的 Prompt 原文。
请在不改变核心意图的前提下，优化其结构、清晰度、可执行性与约束说明。
要求：
- 直接输出优化后的 Prompt 正文，不要加前言、后记或 Markdown 代码块包裹
- 保留用户原有的语言（中文/英文等）
- 若原文含 {{变量}} 或占位符，必须保留
- 不要编造用户未提及的事实或能力`

interface OptimizeRequest {
  content?: string
  /** 用户自定义优化说明，如「更简洁」「面向代码生成」 */
  instruction?: string
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function callDeepSeek(
  content: string,
  instruction: string | undefined
): Promise<{ optimized: string } | { error: string; status: number }> {
  const apiKey = Deno.env.get('DEEPSEEK_API_KEY')
  if (!apiKey) {
    return {
      error: '服务端未配置 DEEPSEEK_API_KEY，请在 Supabase Secrets 中设置',
      status: 503,
    }
  }

  const model = Deno.env.get('DEEPSEEK_MODEL') || DEFAULT_MODEL
  let userMessage = `待优化的 Prompt：\n\n${content}`
  if (instruction?.trim()) {
    userMessage += `\n\n额外优化要求：${instruction.trim()}`
  }

  const response = await fetch(Deno.env.get('DEEPSEEK_API_URL') || DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.6,
      max_tokens: 4096,
      stream: false,
    }),
  })

  const data = await response.json().catch(() => ({})) as {
    choices?: Array<{ message?: { content?: string } }>
    error?: { message?: string }
    message?: string
  }

  if (!response.ok) {
    const msg =
      data?.error?.message || data?.message || `DeepSeek 请求失败 (${response.status})`
    return { error: msg, status: 502 }
  }

  const optimized = data.choices?.[0]?.message?.content?.trim()
  if (!optimized) {
    return { error: '模型未返回有效内容', status: 502 }
  }

  return { optimized }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return jsonResponse({ error: '请先登录' }, 401)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonResponse({ error: '服务端 Supabase 环境未配置' }, 503)
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return jsonResponse({ error: '登录已失效，请重新登录' }, 401)
  }

  let body: OptimizeRequest
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: '请求体格式错误' }, 400)
  }

  const content = body.content?.trim()
  if (!content) {
    return jsonResponse({ error: '请提供 Prompt 内容' }, 400)
  }

  if (content.length > 32000) {
    return jsonResponse({ error: '内容过长，请缩短后再优化' }, 400)
  }

  const result = await callDeepSeek(content, body.instruction)
  if ('error' in result) {
    return jsonResponse({ error: result.error }, result.status)
  }

  return jsonResponse({ optimized: result.optimized })
})

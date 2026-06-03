import { apmLog } from './debugLog'
import { loadPrompts, savePrompts } from './storage'
import { createRemotePrompt, supabase } from './supabase'

export const CLIP_TAG = '划词采集'

export function titleFromSelection(text: string): string {
  const line = text.trim().split(/\n/)[0]?.trim() ?? ''
  return line.slice(0, 40) || '网页摘录'
}

export async function saveSelectionAsPrompt(
  selectionText: string,
): Promise<{ ok: true; title: string } | { ok: false; error: string }> {
  const content = selectionText.trim()
  apmLog('bg', '保存划词为 Prompt', { chars: content.length })
  if (!content) return { ok: false, error: '选区为空' }

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return { ok: false, error: '请先登录扩展后再保存' }

  try {
    const title = titleFromSelection(content)
    const remote = await createRemotePrompt({
      title,
      content,
      categoryId: null,
      tags: [CLIP_TAG],
    })
    const prompts = await loadPrompts()
    await savePrompts([remote, ...prompts.filter((p) => p.id !== remote.id)])
    return { ok: true, title }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '保存失败' }
  }
}

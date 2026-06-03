import { apmLog } from './debugLog'
import { saveCategories, savePrompts } from './storage'
import { fetchRemoteCategories, fetchRemotePrompts, supabase } from './supabase'

export type SyncResult =
  | { ok: true; promptCount: number; categoryCount: number }
  | { ok: false; reason: 'not_logged_in' | 'network' | 'unknown'; message?: string }

/** 从 Supabase 拉取 Prompt/分类并写入 chrome.storage.local，供 UI 与 background 共用 */
export async function syncPromptsFromRemote(): Promise<SyncResult> {
  apmLog('sync', '拉取远程数据开始')
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) {
    apmLog('sync', '未登录，中止')
    return { ok: false, reason: 'not_logged_in' }
  }

  try {
    const [remotePrompts, remoteCategories] = await Promise.all([
      fetchRemotePrompts(session.user.id),
      fetchRemoteCategories(session.user.id),
    ])
    await savePrompts(remotePrompts)
    await saveCategories(remoteCategories)
    apmLog('sync', '拉取完成', {
      prompts: remotePrompts.length,
      categories: remoteCategories.length,
    })
    return {
      ok: true,
      promptCount: remotePrompts.length,
      categoryCount: remoteCategories.length,
    }
  } catch (e) {
    return {
      ok: false,
      reason: 'network',
      message: e instanceof Error ? e.message : '同步失败',
    }
  }
}

import { MSG } from './messaging'

function isRestrictedTabUrl(url?: string): boolean {
  if (!url) return true
  return (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('edge://') ||
    url.startsWith('about:') ||
    url.startsWith('devtools://')
  )
}

export async function ensureContentScript(tabId: number): Promise<void> {
  try {
    await chrome.tabs.sendMessage(tabId, { type: MSG.PING })
  } catch {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js'],
    })
  }
}

export async function insertPromptIntoTab(
  tabId: number,
  content: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const tab = await chrome.tabs.get(tabId)
    if (isRestrictedTabUrl(tab.url)) {
      return { ok: false, error: '此页面不支持插入（系统页或扩展页）' }
    }

    await ensureContentScript(tabId)
    const response = (await chrome.tabs.sendMessage(tabId, {
      type: MSG.INSERT_PROMPT,
      content,
    })) as { ok?: boolean; error?: string } | undefined

    if (response?.ok) return { ok: true }
    return { ok: false, error: response?.error ?? '未找到可编辑输入框' }
  } catch (e) {
    const msg = e instanceof Error ? e.message : '无法注入页面脚本'
    return { ok: false, error: msg }
  }
}

export async function showTabToast(tabId: number, message: string): Promise<void> {
  try {
    if (isRestrictedTabUrl((await chrome.tabs.get(tabId)).url)) return
    await ensureContentScript(tabId)
    await chrome.tabs.sendMessage(tabId, { type: MSG.SHOW_TOAST, message })
  } catch {
    /* 忽略 toast 失败 */
  }
}

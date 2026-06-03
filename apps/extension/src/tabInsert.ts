import { apmLog, apmWarn } from './debugLog'
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
    apmLog('bg', 'content script 已就绪', { tabId })
  } catch {
    apmLog('bg', '注入 content.js', { tabId })
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
    apmLog('bg', 'insertPromptIntoTab', { tabId, url: tab.url })
    if (isRestrictedTabUrl(tab.url)) {
      apmWarn('bg', '受限页面，无法插入', tab.url)
      return { ok: false, error: '此页面不支持插入（系统页或扩展页）' }
    }

    await ensureContentScript(tabId)
    const response = (await chrome.tabs.sendMessage(tabId, {
      type: MSG.INSERT_PROMPT,
      content,
    })) as { ok?: boolean; error?: string } | undefined

    if (response?.ok) return { ok: true }
    apmWarn('bg', 'content 返回插入失败', response)
    return { ok: false, error: response?.error ?? '未找到可编辑输入框' }
  } catch (e) {
    const msg = e instanceof Error ? e.message : '无法注入页面脚本'
    apmWarn('bg', 'insertPromptIntoTab 异常', msg)
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

import { apmLog, apmWarn } from './debugLog'
import { MSG, type InsertPromptTabRequest, type InsertPromptTabResponse } from './messaging'

export async function insertPromptToActiveTab(content: string): Promise<InsertPromptTabResponse> {
  apmLog('ui', '侧栏请求插入到当前标签页', { length: content.length })
  return new Promise((resolve) => {
    const payload: InsertPromptTabRequest = { type: MSG.INSERT_PROMPT_TAB, content }
    chrome.runtime.sendMessage(payload, (response: InsertPromptTabResponse | undefined) => {
      if (chrome.runtime.lastError) {
        apmWarn('ui', 'sendMessage 失败', chrome.runtime.lastError.message)
        resolve({ ok: false, error: chrome.runtime.lastError.message })
        return
      }
      apmLog('ui', '插入响应', response)
      resolve(response ?? { ok: false, error: '无响应' })
    })
  })
}

import { MSG, type InsertPromptTabRequest, type InsertPromptTabResponse } from './messaging'

export async function insertPromptToActiveTab(content: string): Promise<InsertPromptTabResponse> {
  return new Promise((resolve) => {
    const payload: InsertPromptTabRequest = { type: MSG.INSERT_PROMPT_TAB, content }
    chrome.runtime.sendMessage(payload, (response: InsertPromptTabResponse | undefined) => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: chrome.runtime.lastError.message })
        return
      }
      resolve(response ?? { ok: false, error: '无响应' })
    })
  })
}

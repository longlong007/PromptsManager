import type { Prompt } from './types'
import { getVsCodeApi } from './vscodeApi'

/** 供扩展宿主 Quick Pick 使用的轻量缓存 */
export function postPromptsCacheToExtension(prompts: Prompt[]) {
  const vscode = getVsCodeApi()
  if (!vscode) return
  vscode.postMessage({
    type: 'syncPromptsCache',
    prompts: prompts.map((p) => ({ id: p.id, title: p.title, content: p.content })),
  })
}

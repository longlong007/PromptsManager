import { apmLog } from './debugLog'
import { getVsCodeApi } from './vscodeApi'

const MSG = {
  INSERT_EDITOR: 'insertEditor',
  INSERT_EDITOR_RESULT: 'insertEditorResult',
} as const

export async function insertPromptToEditor(content: string): Promise<{ ok: boolean; error?: string }> {
  apmLog('ui', '请求插入到编辑器', { length: content.length })

  const vscode = getVsCodeApi()
  if (!vscode) {
    return { ok: false, error: '未在 VS Code / Cursor Webview 中运行' }
  }

  return new Promise((resolve) => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data
      if (data?.type === MSG.INSERT_EDITOR_RESULT) {
        window.removeEventListener('message', onMessage)
        resolve({ ok: Boolean(data.ok), error: data.error })
      }
    }
    window.addEventListener('message', onMessage)
    vscode.postMessage({ type: MSG.INSERT_EDITOR, content })

    window.setTimeout(() => {
      window.removeEventListener('message', onMessage)
      resolve({ ok: false, error: '插入超时' })
    }, 8000)
  })
}

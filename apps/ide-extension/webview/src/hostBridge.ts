import { getVsCodeApi } from './vscodeApi'

function postMessageAndWait<T extends Record<string, unknown>>(
  payload: Record<string, unknown>,
  resultType: string,
  timeoutMs = 5000,
): Promise<T | null> {
  const vscode = getVsCodeApi()
  if (!vscode) return Promise.resolve(null)

  return new Promise((resolve) => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data
      if (data?.type === resultType) {
        window.removeEventListener('message', onMessage)
        resolve(data as T)
      }
    }
    window.addEventListener('message', onMessage)
    vscode.postMessage(payload)
    window.setTimeout(() => {
      window.removeEventListener('message', onMessage)
      resolve(null)
    }, timeoutMs)
  })
}

/** Webview 内 navigator.clipboard 常不可用，改由扩展宿主写入剪贴板 */
export async function copyToClipboard(text: string): Promise<boolean> {
  const result = await postMessageAndWait<{ ok: boolean }>(
    { type: 'copyToClipboard', text },
    'copyToClipboardResult',
  )
  if (result?.ok) return true

  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

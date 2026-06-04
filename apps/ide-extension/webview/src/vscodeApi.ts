/** VS Code Webview API 只能 acquire 一次，须在模块级缓存 */
let vscodeApi: ReturnType<typeof acquireVsCodeApi> | null | undefined

export function getVsCodeApi() {
  if (vscodeApi !== undefined) {
    return vscodeApi
  }
  if (typeof acquireVsCodeApi === 'function') {
    try {
      vscodeApi = acquireVsCodeApi()
    } catch {
      vscodeApi = null
    }
  } else {
    vscodeApi = null
  }
  return vscodeApi
}

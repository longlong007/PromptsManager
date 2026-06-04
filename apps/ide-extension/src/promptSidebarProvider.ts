import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'

const MSG = {
  INSERT_EDITOR: 'insertEditor',
  INSERT_EDITOR_RESULT: 'insertEditorResult',
  COPY_CLIPBOARD: 'copyToClipboard',
  COPY_CLIPBOARD_RESULT: 'copyToClipboardResult',
  WEBVIEW_READY: 'webviewReady',
} as const

export class PromptSidebarProvider implements vscode.WebviewViewProvider {
  static readonly viewType = 'promptManager.sidebar'

  private view?: vscode.WebviewView
  private messageDisposable?: vscode.Disposable
  private htmlInitialized = false

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly context: vscode.ExtensionContext,
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void {
    this.view = webviewView
    this.attachWebview(webviewView)

    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible && !this.htmlInitialized) {
        this.ensureHtml(webviewView)
      }
    })
  }

  /** 打开侧栏：先显示容器，再聚焦 Webview 视图（减少需多次点击） */
  async reveal(): Promise<void> {
    await vscode.commands.executeCommand('workbench.view.extension.promptManager')
    try {
      await vscode.commands.executeCommand(`${PromptSidebarProvider.viewType}.focus`)
    } catch {
      /* 部分宿主无 focus 命令，忽略 */
    }
    if (this.view?.visible) {
      this.ensureHtml(this.view)
    }
  }

  async insertViaQuickPick(): Promise<void> {
    await this.reveal()

    const raw = this.context.globalState.get<string>('ai_prompt_manager_prompts_cache')
    let prompts: { id: string; title: string; content: string }[] = []
    try {
      if (raw) prompts = JSON.parse(raw)
    } catch {
      /* use empty */
    }

    if (prompts.length === 0) {
      void vscode.window.showInformationMessage(
        '请先在 Prompt Manager 侧栏登录并点「同步云端」，或选择 Prompt 后点「插入编辑器」。',
      )
      return
    }

    const picked = await vscode.window.showQuickPick(
      prompts.map((p) => ({
        label: p.title,
        description: p.content.slice(0, 80),
        prompt: p,
      })),
      { placeHolder: '选择要插入的 Prompt' },
    )
    if (!picked) return

    const result = await insertIntoActiveEditor(picked.prompt.content)
    if (result.ok) {
      void vscode.window.showInformationMessage('已插入到光标位置')
    } else {
      void vscode.window.showErrorMessage(result.error ?? '插入失败')
    }
  }

  private attachWebview(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview')],
    }

    this.ensureHtml(webviewView)

    this.messageDisposable?.dispose()
    this.messageDisposable = webviewView.webview.onDidReceiveMessage(
      async (message: { type?: string; content?: string; text?: string; prompts?: unknown }) => {
        if (message.type === MSG.INSERT_EDITOR && typeof message.content === 'string') {
          const result = await insertIntoActiveEditor(message.content)
          webviewView.webview.postMessage({
            type: MSG.INSERT_EDITOR_RESULT,
            ...result,
          })
          return
        }
        if (message.type === 'syncPromptsCache' && Array.isArray(message.prompts)) {
          await this.context.globalState.update(
            'ai_prompt_manager_prompts_cache',
            JSON.stringify(message.prompts),
          )
          return
        }
        if (message.type === MSG.COPY_CLIPBOARD && typeof message.text === 'string') {
          await vscode.env.clipboard.writeText(message.text)
          webviewView.webview.postMessage({ type: MSG.COPY_CLIPBOARD_RESULT, ok: true })
        }
      },
    )
  }

  private ensureHtml(webviewView: vscode.WebviewView) {
    if (this.htmlInitialized) return
    webviewView.webview.html = this.getWebviewHtml(webviewView.webview)
    this.htmlInitialized = true
  }

  private getWebviewHtml(webview: vscode.Webview): string {
    const distDir = path.join(this.extensionUri.fsPath, 'dist', 'webview')
    const indexPath = path.join(distDir, 'index.html')

    if (!fs.existsSync(indexPath)) {
      return `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:16px;color:#ccc;background:#0f172a">
        <p>Webview 未构建。请在 <code>apps/ide-extension</code> 运行：</p>
        <pre>pnpm run compile</pre>
      </body></html>`
    }

    let html = fs.readFileSync(indexPath, 'utf8')
    const distUri = vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview')

    html = html.replace(/(href|src)="([^"]+)"/g, (_match, attr: string, url: string) => {
      if (url.startsWith('http') || url.startsWith('data:')) return `${attr}="${url}"`
      const resourceUri = webview.asWebviewUri(vscode.Uri.joinPath(distUri, url.replace(/^\.\//, '')))
      return `${attr}="${resourceUri}"`
    })

    const csp = [
      "default-src 'none'",
      `style-src ${webview.cspSource} 'unsafe-inline'`,
      `font-src ${webview.cspSource}`,
      `script-src ${webview.cspSource}`,
      'connect-src https://*.supabase.co wss://*.supabase.co https://api.deepseek.com',
      `img-src ${webview.cspSource} https: data:`,
    ].join('; ')

    return html.replace(
      '<head>',
      `<head><meta http-equiv="Content-Security-Policy" content="${csp}">`,
    )
  }
}

async function insertIntoActiveEditor(content: string): Promise<{ ok: boolean; error?: string }> {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    return { ok: false, error: '没有打开的编辑器，请先打开一个文件' }
  }

  const ok = await editor.edit((edit) => {
    for (const selection of editor.selections) {
      edit.insert(selection.active, content)
    }
  })

  if (!ok) {
    return { ok: false, error: '无法写入编辑器' }
  }
  return { ok: true }
}

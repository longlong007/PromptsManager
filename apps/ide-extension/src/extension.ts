import * as vscode from 'vscode'
import { PromptSidebarProvider } from './promptSidebarProvider'

export function activate(context: vscode.ExtensionContext) {
  const sidebar = new PromptSidebarProvider(context.extensionUri, context)

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(PromptSidebarProvider.viewType, sidebar, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
    vscode.commands.registerCommand('promptManager.openSidebar', async () => {
      await sidebar.reveal()
    }),
    vscode.commands.registerCommand('promptManager.insertFromPicker', async () => {
      await sidebar.insertViaQuickPick()
    }),
  )
}

export function deactivate() {}

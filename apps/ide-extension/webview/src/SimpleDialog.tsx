import type { ReactNode } from 'react'

type Props = {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
  onConfirm: () => void
  confirmLabel?: string
  busy?: boolean
}

/** VS Code Webview 不支持 window.prompt，用内联对话框代替 */
export function SimpleDialog({
  open,
  title,
  children,
  onClose,
  onConfirm,
  confirmLabel = '确定',
  busy = false,
}: Props) {
  if (!open) return null

  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true">
      <div className="dialog-card">
        <h3 className="dialog-title">{title}</h3>
        <div className="dialog-body">{children}</div>
        <div className="dialog-actions">
          <button type="button" className="action-btn" onClick={onClose} disabled={busy}>
            取消
          </button>
          <button type="button" className="action-btn primary" onClick={onConfirm} disabled={busy}>
            {busy ? '处理中…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

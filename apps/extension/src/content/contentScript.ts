/**
 * Content script：在网页输入框插入 Prompt、显示轻提示。
 * 消息常量需与 messaging.ts 保持一致（此处独立打包，避免 chunk 依赖）。
 */
const MSG = {
  PING: 'APM_PING',
  INSERT_PROMPT: 'APM_INSERT_PROMPT',
  SHOW_TOAST: 'APM_SHOW_TOAST',
} as const

const CHAT_INPUT_SELECTORS = [
  '#prompt-textarea',
  '[data-testid="prompt-textarea"]',
  'textarea[placeholder*="Message" i]',
  'textarea[placeholder*="消息" i]',
  'textarea[placeholder*="Ask" i]',
  'div[contenteditable="true"][data-placeholder]',
  'div.ProseMirror[contenteditable="true"]',
  'div[contenteditable="true"].ProseMirror',
  'textarea',
  'input[type="text"]',
]

function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto =
    element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  if (setter) {
    setter.call(element, value)
  } else {
    element.value = value
  }
  element.dispatchEvent(new Event('input', { bubbles: true }))
  element.dispatchEvent(new Event('change', { bubbles: true }))
}

function insertIntoTextControl(el: HTMLInputElement | HTMLTextAreaElement, text: string): boolean {
  const start = el.selectionStart ?? el.value.length
  const end = el.selectionEnd ?? el.value.length
  const newValue = `${el.value.slice(0, start)}${text}${el.value.slice(end)}`
  setNativeValue(el, newValue)
  const cursor = start + text.length
  el.selectionStart = cursor
  el.selectionEnd = cursor
  el.focus()
  return true
}

function insertIntoContentEditable(el: HTMLElement, text: string): boolean {
  el.focus()
  const selection = window.getSelection()
  if (!selection) return false

  if (selection.rangeCount === 0) {
    const range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  const inserted = document.execCommand('insertText', false, text)
  if (!inserted && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(document.createTextNode(text))
    range.collapse(false)
  }

  el.dispatchEvent(
    new InputEvent('input', { bubbles: true, cancelable: true, inputType: 'insertText', data: text }),
  )
  return true
}

function insertIntoElement(el: HTMLElement, text: string): boolean {
  if (el instanceof HTMLTextAreaElement || (el instanceof HTMLInputElement && el.type === 'text')) {
    return insertIntoTextControl(el, text)
  }
  if (el.isContentEditable) {
    return insertIntoContentEditable(el, text)
  }
  return false
}

function isEditableInput(node: Element): node is HTMLElement {
  if (!(node instanceof HTMLElement)) return false
  if (node instanceof HTMLTextAreaElement) return true
  if (node instanceof HTMLInputElement) return node.type === 'text' || node.type === 'search' || !node.type
  return node.isContentEditable
}

function findChatInput(): HTMLElement | null {
  for (const selector of CHAT_INPUT_SELECTORS) {
    const node = document.querySelector(selector)
    if (node && isEditableInput(node)) return node
  }
  return null
}

function insertPromptText(text: string): boolean {
  const active = document.activeElement
  if (active instanceof HTMLElement && insertIntoElement(active, text)) {
    return true
  }

  const chatInput = findChatInput()
  if (chatInput) {
    return insertIntoElement(chatInput, text)
  }

  return false
}

function showToast(message: string) {
  const existing = document.getElementById('apm-toast')
  existing?.remove()

  const toast = document.createElement('div')
  toast.id = 'apm-toast'
  toast.textContent = message
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: '2147483647',
    maxWidth: '320px',
    padding: '12px 16px',
    borderRadius: '12px',
    background: 'rgba(15, 23, 42, 0.92)',
    color: '#e5eefb',
    fontSize: '14px',
    lineHeight: '1.5',
    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
    border: '1px solid rgba(148, 163, 184, 0.25)',
    fontFamily: 'system-ui, sans-serif',
    pointerEvents: 'none',
  })
  document.body.appendChild(toast)
  window.setTimeout(() => toast.remove(), 2800)
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === MSG.PING) {
    sendResponse({ ok: true })
    return true
  }

  if (message?.type === MSG.SHOW_TOAST && typeof message.message === 'string') {
    showToast(message.message)
    sendResponse({ ok: true })
    return true
  }

  if (message?.type === MSG.INSERT_PROMPT && typeof message.content === 'string') {
    const ok = insertPromptText(message.content)
    if (ok) showToast('Prompt 已插入')
    sendResponse({ ok, error: ok ? undefined : '未找到可编辑输入框' })
    return true
  }

  return false
})

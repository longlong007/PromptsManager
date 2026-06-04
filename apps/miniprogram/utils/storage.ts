import type { Session, CopyHistoryItem } from './types'

const SESSION_KEY = 'pm_session'
const COPY_HISTORY_KEY = 'pm_copy_history'
const MAX_COPY_HISTORY = 50

export function getSession(): Session | null {
  try {
    return wx.getStorageSync(SESSION_KEY) || null
  } catch {
    return null
  }
}

export function setSession(session: Session | null): void {
  if (session) {
    wx.setStorageSync(SESSION_KEY, session)
  } else {
    wx.removeStorageSync(SESSION_KEY)
  }
}

export function addCopyHistory(item: Omit<CopyHistoryItem, 'copiedAt'>): void {
  const history: CopyHistoryItem[] = wx.getStorageSync(COPY_HISTORY_KEY) || []
  const entry: CopyHistoryItem = { ...item, copiedAt: new Date().toISOString() }
  const filtered = history.filter((h) => h.promptId !== item.promptId)
  const next = [entry, ...filtered].slice(0, MAX_COPY_HISTORY)
  wx.setStorageSync(COPY_HISTORY_KEY, next)
}

export function getCopyHistory(): CopyHistoryItem[] {
  try {
    return wx.getStorageSync(COPY_HISTORY_KEY) || []
  } catch {
    return []
  }
}

export function clearCopyHistory(): void {
  wx.removeStorageSync(COPY_HISTORY_KEY)
}

import { loadPrompts, STORAGE_KEYS } from './storage'

export const MENU_SAVE_SELECTION = 'apm-save-selection'
export const MENU_INSERT_ROOT = 'apm-insert-root'
export const MENU_INSERT_PREFIX = 'apm-insert-'

const MAX_INSERT_MENU_ITEMS = 15

export async function rebuildContextMenus(): Promise<void> {
  await chrome.contextMenus.removeAll()

  chrome.contextMenus.create({
    id: MENU_SAVE_SELECTION,
    title: '保存为 Prompt（AI Prompt Manager）',
    contexts: ['selection'],
  })

  const prompts = await loadPrompts()
  if (prompts.length === 0) return

  chrome.contextMenus.create({
    id: MENU_INSERT_ROOT,
    title: '插入 Prompt（AI Prompt Manager）',
    contexts: ['editable'],
  })

  for (const prompt of prompts.slice(0, MAX_INSERT_MENU_ITEMS)) {
    const title = prompt.title.length > 45 ? `${prompt.title.slice(0, 42)}…` : prompt.title
    chrome.contextMenus.create({
      id: `${MENU_INSERT_PREFIX}${prompt.id}`,
      parentId: MENU_INSERT_ROOT,
      title,
      contexts: ['editable'],
    })
  }
}

export function watchPromptsForContextMenus(): void {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && STORAGE_KEYS.prompts in changes) {
      void rebuildContextMenus()
    }
  })
}

import {
  MENU_INSERT_PREFIX,
  MENU_SAVE_SELECTION,
  rebuildContextMenus,
  watchPromptsForContextMenus,
} from './contextMenus'
import { MSG, type InsertPromptTabRequest, type InsertPromptTabResponse } from './messaging'
import { saveSelectionAsPrompt } from './promptClipService'
import { syncPromptsFromRemote } from './syncService'
import { insertPromptIntoTab, showTabToast } from './tabInsert'
import { loadPrompts } from './storage'

const SYNC_ALARM_NAME = 'sync-prompts'
const SYNC_INTERVAL_MINUTES = 30

function setupSidePanel() {
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
}

async function setupSyncAlarm() {
  const existing = await chrome.alarms.get(SYNC_ALARM_NAME)
  if (!existing) {
    await chrome.alarms.create(SYNC_ALARM_NAME, { periodInMinutes: SYNC_INTERVAL_MINUTES })
  }
}

async function runBackgroundSync() {
  const result = await syncPromptsFromRemote()
  if (result.ok) {
    console.info(
      `[AI Prompt Manager] 后台同步完成：${result.promptCount} 条 Prompt，${result.categoryCount} 个分类`,
    )
    return
  }
  if (result.reason !== 'not_logged_in') {
    console.warn('[AI Prompt Manager] 后台同步失败:', result.message ?? result.reason)
  }
}

setupSidePanel()
void setupSyncAlarm()
watchPromptsForContextMenus()
void rebuildContextMenus()

chrome.runtime.onInstalled.addListener(() => {
  setupSidePanel()
  void setupSyncAlarm().then(() => runBackgroundSync())
  void rebuildContextMenus()
})

chrome.alarms.onAlarm.addListener((alarm: chrome.alarms.Alarm) => {
  if (alarm.name === SYNC_ALARM_NAME) {
    void runBackgroundSync()
  }
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  void (async () => {
    if (info.menuItemId === MENU_SAVE_SELECTION && info.selectionText) {
      const result = await saveSelectionAsPrompt(info.selectionText)
      if (tab?.id) {
        const message = result.ok ? `已保存：${result.title}` : result.error
        await showTabToast(tab.id, message)
      }
      if (result.ok) {
        void rebuildContextMenus()
      }
      return
    }

    const menuId = String(info.menuItemId)
    if (!menuId.startsWith(MENU_INSERT_PREFIX) || !tab?.id) return

    const promptId = menuId.slice(MENU_INSERT_PREFIX.length)
    const prompts = await loadPrompts()
    const prompt = prompts.find((p) => p.id === promptId)
    if (!prompt) {
      await showTabToast(tab.id, '未找到该 Prompt')
      return
    }

    const insertResult = await insertPromptIntoTab(tab.id, prompt.content)
    if (!insertResult.ok) {
      await showTabToast(tab.id, insertResult.error ?? '插入失败')
    }
  })()
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === MSG.INSERT_PROMPT_TAB) {
    void (async () => {
      const req = message as InsertPromptTabRequest
      let tabId = req.tabId
      if (!tabId) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        tabId = tab?.id
      }
      if (!tabId) {
        sendResponse({ ok: false, error: '未找到活动标签页' } satisfies InsertPromptTabResponse)
        return
      }
      const result = await insertPromptIntoTab(tabId, req.content)
      sendResponse(result satisfies InsertPromptTabResponse)
    })()
    return true
  }
  return false
})

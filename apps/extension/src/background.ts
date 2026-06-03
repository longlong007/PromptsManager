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
import { apmLog, apmWarn } from './debugLog'
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
  apmLog('bg', '开始后台同步')
  const result = await syncPromptsFromRemote()
  if (result.ok) {
    apmLog(
      'bg',
      `同步完成：${result.promptCount} 条 Prompt，${result.categoryCount} 个分类`,
    )
    return
  }
  if (result.reason !== 'not_logged_in') {
    apmWarn('bg', '同步失败:', result.message ?? result.reason)
  } else {
    apmLog('bg', '同步跳过：未登录')
  }
}

apmLog('bg', 'Service Worker 已加载')
setupSidePanel()
void setupSyncAlarm()
watchPromptsForContextMenus()
void rebuildContextMenus()

chrome.runtime.onInstalled.addListener((details) => {
  apmLog('bg', 'onInstalled', details.reason)
  setupSidePanel()
  void setupSyncAlarm().then(() => runBackgroundSync())
  void rebuildContextMenus()
})

chrome.alarms.onAlarm.addListener((alarm: chrome.alarms.Alarm) => {
  if (alarm.name === SYNC_ALARM_NAME) {
    apmLog('bg', '定时闹钟触发同步', alarm.name)
    void runBackgroundSync()
  }
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  apmLog('bg', '右键菜单点击', { menuItemId: info.menuItemId, tabId: tab?.id })
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
    apmLog('bg', '右键插入结果', { promptId, ok: insertResult.ok, error: insertResult.error })
    if (!insertResult.ok) {
      await showTabToast(tab.id, insertResult.error ?? '插入失败')
    }
  })()
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === MSG.INSERT_PROMPT_TAB) {
    apmLog('bg', '收到 INSERT_PROMPT_TAB', { from: sender.id, tabId: (message as InsertPromptTabRequest).tabId })
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
      apmLog('bg', 'INSERT_PROMPT_TAB 完成', { tabId, ok: result.ok, error: result.error })
      sendResponse(result satisfies InsertPromptTabResponse)
    })()
    return true
  }
  apmLog('bg', '忽略未知消息', message?.type)
  return false
})

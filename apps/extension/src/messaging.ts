/** 扩展各上下文（background / content / sidepanel）共用的消息类型 */
export const MSG = {
  PING: 'APM_PING',
  INSERT_PROMPT: 'APM_INSERT_PROMPT',
  SHOW_TOAST: 'APM_SHOW_TOAST',
  INSERT_PROMPT_TAB: 'APM_INSERT_PROMPT_TAB',
} as const

export type InsertPromptTabRequest = {
  type: typeof MSG.INSERT_PROMPT_TAB
  tabId?: number
  content: string
}

export type InsertPromptTabResponse = {
  ok: boolean
  error?: string
}

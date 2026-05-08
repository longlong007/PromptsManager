import type { AuthState, Category, Prompt } from './types'

const PROMPTS_KEY = 'ai_prompt_manager_prompts'
const CATEGORIES_KEY = 'ai_prompt_manager_categories'
const AUTH_KEY = 'ai_prompt_manager_auth'

function hasChromeStorage() {
  return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local)
}

export async function loadPrompts(): Promise<Prompt[]> {
  if (!hasChromeStorage()) return []
  const result = await chrome.storage.local.get(PROMPTS_KEY)
  return result[PROMPTS_KEY] ?? []
}

export async function savePrompts(prompts: Prompt[]) {
  if (!hasChromeStorage()) return
  await chrome.storage.local.set({ [PROMPTS_KEY]: prompts })
}

export async function loadCategories(): Promise<Category[]> {
  if (!hasChromeStorage()) return []
  const result = await chrome.storage.local.get(CATEGORIES_KEY)
  return result[CATEGORIES_KEY] ?? []
}

export async function saveCategories(categories: Category[]) {
  if (!hasChromeStorage()) return
  await chrome.storage.local.set({ [CATEGORIES_KEY]: categories })
}

export async function loadAuthState(): Promise<AuthState> {
  if (!hasChromeStorage()) return { accessToken: null, userEmail: null }
  const result = await chrome.storage.local.get(AUTH_KEY)
  return result[AUTH_KEY] ?? { accessToken: null, userEmail: null }
}

export async function saveAuthState(authState: AuthState) {
  if (!hasChromeStorage()) return
  await chrome.storage.local.set({ [AUTH_KEY]: authState })
}

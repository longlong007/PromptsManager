import type { Category, Prompt } from './types'

const PROMPTS_KEY = 'ai_prompt_manager_prompts'
const CATEGORIES_KEY = 'ai_prompt_manager_categories'

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

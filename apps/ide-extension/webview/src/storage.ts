import type { Category, Prompt } from './types'

export const STORAGE_KEYS = {
  prompts: 'ai_prompt_manager_prompts',
  categories: 'ai_prompt_manager_categories',
} as const

const PROMPTS_KEY = STORAGE_KEYS.prompts
const CATEGORIES_KEY = STORAGE_KEYS.categories

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export async function loadPrompts(): Promise<Prompt[]> {
  return readJson<Prompt[]>(PROMPTS_KEY, [])
}

export async function savePrompts(prompts: Prompt[]) {
  writeJson(PROMPTS_KEY, prompts)
}

export async function loadCategories(): Promise<Category[]> {
  return readJson<Category[]>(CATEGORIES_KEY, [])
}

export async function saveCategories(categories: Category[]) {
  writeJson(CATEGORIES_KEY, categories)
}

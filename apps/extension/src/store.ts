import { create } from 'zustand'
import type { Category, Prompt, PromptFilters } from './types'

interface ExtensionStore {
  prompts: Prompt[]
  categories: Category[]
  filters: PromptFilters
  selectedPromptId: string | null
  setPrompts: (prompts: Prompt[]) => void
  setCategories: (categories: Category[]) => void
  setFilters: (filters: Partial<PromptFilters>) => void
  selectPrompt: (id: string | null) => void
}

export const useExtensionStore = create<ExtensionStore>((set) => ({
  prompts: [],
  categories: [],
  filters: { query: '', categoryId: '', tag: '' },
  selectedPromptId: null,
  setPrompts: (prompts) => set({ prompts }),
  setCategories: (categories) => set({ categories }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  selectPrompt: (id) => set({ selectedPromptId: id }),
}))

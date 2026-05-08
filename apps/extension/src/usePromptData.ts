import { useEffect, useState } from 'react'
import { mockCategories, mockPrompts } from './mockData'
import { loadAuthState, loadCategories, loadPrompts, saveAuthState, saveCategories, savePrompts } from './storage'
import { createRemoteCategory, createRemotePrompt, deleteRemoteCategory, deleteRemotePrompt, fetchRemoteCategories, fetchRemotePrompts, syncRemoteState, updateRemoteCategory, updateRemotePrompt } from './supabase'
import type { AuthState, Category, Prompt } from './types'

export function usePromptData() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [authState, setAuthState] = useState<AuthState>({ accessToken: null, userEmail: null })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    async function bootstrap() {
      const storedPrompts = await loadPrompts()
      const storedCategories = await loadCategories()
      const storedAuth = await loadAuthState()

      if (!active) return

      const initialPrompts = storedPrompts.length ? storedPrompts : mockPrompts
      const initialCategories = storedCategories.length ? storedCategories : mockCategories

      setPrompts(initialPrompts)
      setCategories(initialCategories)
      setAuthState(storedAuth)
      await syncRemoteState(storedAuth)

      if (!storedPrompts.length) {
        await savePrompts(initialPrompts)
      }
      if (!storedCategories.length) {
        await saveCategories(initialCategories)
      }

      setReady(true)
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [])

  async function replacePrompts(next: Prompt[]) {
    setPrompts(next)
    await savePrompts(next)
  }

  async function addPrompt(input: Omit<Prompt, 'id' | 'updatedAt'>) {
    const remote = authState.accessToken ? await createRemotePrompt(input) : null
    const next: Prompt = remote ?? { ...input, id: crypto.randomUUID(), updatedAt: new Date().toISOString() }
    await replacePrompts([next, ...prompts])
    return next
  }

  async function updatePrompt(id: string, patch: Partial<Prompt>) {
    const remote = authState.accessToken ? await updateRemotePrompt(id, patch) : null
    const next = prompts.map((prompt) => prompt.id === id ? remote ?? { ...prompt, ...patch, updatedAt: new Date().toISOString() } : prompt)
    await replacePrompts(next)
  }

  async function deletePrompt(id: string) {
    if (authState.accessToken) {
      await deleteRemotePrompt(id)
    }
    const next = prompts.filter((prompt) => prompt.id !== id)
    await replacePrompts(next)
  }

  async function replaceCategories(next: Category[]) {
    setCategories(next)
    await saveCategories(next)
  }

  async function addCategory(name: string) {
    const remote = authState.accessToken ? await createRemoteCategory(name) : null
    const next: Category = remote ?? { id: crypto.randomUUID(), name, parentId: null }
    await replaceCategories([...categories, next])
    return next
  }

  async function updateCategory(id: string, patch: Partial<Category>) {
    const remote = authState.accessToken ? await updateRemoteCategory(id, patch) : null
    const next = categories.map((category) => category.id === id ? remote ?? { ...category, ...patch } : category)
    await replaceCategories(next)
  }

  async function deleteCategory(id: string) {
    if (authState.accessToken) {
      await deleteRemoteCategory(id)
    }
    const next = categories.filter((category) => category.id !== id)
    await replaceCategories(next)
  }

  async function saveAuth(next: AuthState) {
    setAuthState(next)
    await saveAuthState(next)
    await syncRemoteState(next)
  }

  async function syncFromRemote() {
    const [remotePrompts, remoteCategories] = await Promise.all([
      fetchRemotePrompts(),
      fetchRemoteCategories(),
    ])
    await replacePrompts(remotePrompts)
    await replaceCategories(remoteCategories)
  }

  return {
    prompts,
    categories,
    authState,
    ready,
    replacePrompts,
    replaceCategories,
    addPrompt,
    updatePrompt,
    deletePrompt,
    addCategory,
    updateCategory,
    deleteCategory,
    saveAuth,
    syncFromRemote,
  }
}

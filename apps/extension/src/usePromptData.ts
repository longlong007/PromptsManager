import type { Session, User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { loadCategories, loadPrompts, saveCategories, savePrompts } from './storage'
import {
  createRemoteCategory,
  createRemotePrompt,
  deleteRemoteCategory,
  deleteRemotePrompt,
  fetchRemoteCategories,
  fetchRemotePrompts,
  signInWithGoogleExtension,
  supabase,
  updateRemoteCategory,
  updateRemotePrompt,
} from './supabase'
import type { Category, Prompt } from './types'

export function usePromptData() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    async function hydrateFromRemote(userId: string) {
      const [remotePrompts, remoteCategories] = await Promise.all([
        fetchRemotePrompts(userId),
        fetchRemoteCategories(userId),
      ])
      if (!active) return
      setPrompts(remotePrompts)
      setCategories(remoteCategories)
      await savePrompts(remotePrompts)
      await saveCategories(remoteCategories)
    }

    async function clearLocalCaches() {
      setPrompts([])
      setCategories([])
      await savePrompts([])
      await saveCategories([])
    }

    async function boot() {
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      if (!active) return
      setSession(initialSession)
      setUser(initialSession?.user ?? null)
      if (initialSession?.user) {
        try {
          await hydrateFromRemote(initialSession.user.id)
        } catch {
          const [storedPrompts, storedCategories] = await Promise.all([loadPrompts(), loadCategories()])
          if (active) {
            setPrompts(storedPrompts)
            setCategories(storedCategories)
          }
        }
      }
      setAuthLoading(false)
      setReady(true)
    }

    void boot()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      setUser(nextSession?.user ?? null)

      if (!nextSession?.user) {
        await clearLocalCaches()
        return
      }

      if (event === 'TOKEN_REFRESHED') return

      try {
        await hydrateFromRemote(nextSession.user.id)
      } catch {
        /* 保持当前列表 */
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  async function replacePrompts(next: Prompt[]) {
    setPrompts(next)
    await savePrompts(next)
  }

  async function replaceCategories(next: Category[]) {
    setCategories(next)
    await saveCategories(next)
  }

  async function addPrompt(input: Omit<Prompt, 'id' | 'updatedAt'>) {
    const { data: { session: s } } = await supabase.auth.getSession()
    let remote: Prompt | null = null
    if (s) {
      try {
        remote = await createRemotePrompt(input)
      } catch {
        remote = null
      }
    }
    const next: Prompt = remote ?? { ...input, id: crypto.randomUUID(), updatedAt: new Date().toISOString() }
    await replacePrompts([next, ...prompts])
    return next
  }

  async function updatePrompt(id: string, patch: Partial<Prompt>) {
    const { data: { session: s } } = await supabase.auth.getSession()
    let remote: Prompt | null = null
    if (s) {
      try {
        remote = await updateRemotePrompt(id, patch)
      } catch {
        remote = null
      }
    }
    const next = prompts.map((prompt) =>
      prompt.id === id ? remote ?? { ...prompt, ...patch, updatedAt: new Date().toISOString() } : prompt,
    )
    await replacePrompts(next)
  }

  async function deletePrompt(id: string) {
    const { data: { session: s } } = await supabase.auth.getSession()
    if (s) {
      try {
        await deleteRemotePrompt(id)
      } catch {
        /* 仍尝试本地删除 */
      }
    }
    const next = prompts.filter((prompt) => prompt.id !== id)
    await replacePrompts(next)
  }

  async function addCategory(name: string) {
    const { data: { session: s } } = await supabase.auth.getSession()
    let remote: Category | null = null
    if (s) {
      try {
        remote = await createRemoteCategory(name)
      } catch {
        remote = null
      }
    }
    const next: Category = remote ?? { id: crypto.randomUUID(), name, parentId: null }
    await replaceCategories([...categories, next])
    return next
  }

  async function updateCategory(id: string, patch: Partial<Category>) {
    const { data: { session: s } } = await supabase.auth.getSession()
    let remote: Category | null = null
    if (s) {
      try {
        remote = await updateRemoteCategory(id, patch)
      } catch {
        remote = null
      }
    }
    const next = categories.map((category) =>
      category.id === id ? remote ?? { ...category, ...patch } : category,
    )
    await replaceCategories(next)
  }

  async function deleteCategory(id: string) {
    const { data: { session: s } } = await supabase.auth.getSession()
    if (s) {
      try {
        await deleteRemoteCategory(id)
      } catch {
        /* 仍尝试本地删除 */
      }
    }
    const next = categories.filter((category) => category.id !== id)
    await replaceCategories(next)
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function signInWithGoogle() {
    return signInWithGoogleExtension()
  }

  async function syncFromRemote() {
    const { data: { session: s } } = await supabase.auth.getSession()
    if (!s?.user) throw new Error('请先登录')
    const [remotePrompts, remoteCategories] = await Promise.all([
      fetchRemotePrompts(s.user.id),
      fetchRemoteCategories(s.user.id),
    ])
    await replacePrompts(remotePrompts)
    await replaceCategories(remoteCategories)
  }

  return {
    prompts,
    categories,
    session,
    user,
    authLoading,
    ready,
    replacePrompts,
    replaceCategories,
    addPrompt,
    updatePrompt,
    deletePrompt,
    addCategory,
    updateCategory,
    deleteCategory,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    syncFromRemote,
  }
}

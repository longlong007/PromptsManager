import type { Session, User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { loadCategories, loadPrompts, saveCategories, savePrompts, STORAGE_KEYS } from './storage'
import { syncPromptsFromRemote } from './syncService'
import {
  createRemoteCategory,
  createRemotePrompt,
  deleteRemoteCategory,
  deleteRemotePrompt,
  fetchRemoteCategories,
  fetchRemotePrompts,
  hasPersistedAuth,
  signInWithGoogleExtension,
  supabase,
  updateRemoteCategory,
  updateRemotePrompt,
} from './supabase'
import type { Category, Prompt } from './types'

const GET_SESSION_TIMEOUT_MS = 8000
const BOOT_READY_MAX_MS = 12000

type SessionProbe = { session: Session | null; timedOut: boolean }

async function getSessionWithTimeout(): Promise<SessionProbe> {
  const result = await Promise.race([
    supabase.auth.getSession().then((r) => ({ kind: 'ok' as const, session: r.data.session })),
    new Promise<{ kind: 'timeout' }>((resolve) => {
      setTimeout(() => resolve({ kind: 'timeout' }), GET_SESSION_TIMEOUT_MS)
    }),
  ])
  if (result.kind === 'timeout') {
    return { session: null, timedOut: true }
  }
  return { session: result.session, timedOut: false }
}

export function usePromptData() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    let bootstrapDone = false

    function endBootstrap() {
      if (!active || bootstrapDone) return
      bootstrapDone = true
      setAuthLoading(false)
      setReady(true)
    }

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

    async function hydrateAfterReady(userId: string) {
      try {
        await hydrateFromRemote(userId)
      } catch {
        const [storedPrompts, storedCategories] = await Promise.all([loadPrompts(), loadCategories()])
        if (active) {
          setPrompts(storedPrompts)
          setCategories(storedCategories)
        }
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      endBootstrap()

      if (!nextSession?.user) {
        if (event === 'SIGNED_OUT') {
          await clearLocalCaches()
        }
        return
      }

      if (event === 'TOKEN_REFRESHED') return

      try {
        await hydrateFromRemote(nextSession.user.id)
      } catch {
        /* 保持当前列表 */
      }
    })

    async function boot() {
      const persisted = await hasPersistedAuth()
      let hydrateUserId: string | null = null
      try {
        const { session: probed, timedOut } = await getSessionWithTimeout()
        if (!active) return
        if (!timedOut) {
          setSession(probed)
          setUser(probed?.user ?? null)
          if (probed?.user) {
            hydrateUserId = probed.user.id
          }
        } else if (!persisted) {
          setSession(null)
          setUser(null)
        }
        /* timedOut 且 persisted：不把 session 置空，等待 onAuthStateChange 恢复 */
      } catch {
        /* finally 仍会结束加载态 */
      } finally {
        if (!persisted) {
          endBootstrap()
        }
      }
      if (active && hydrateUserId) {
        void hydrateAfterReady(hydrateUserId)
      }
    }

    void boot()

    const safetyTimer = window.setTimeout(() => {
      endBootstrap()
    }, BOOT_READY_MAX_MS)

    return () => {
      active = false
      window.clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!ready || !session) return

    async function reloadFromStorage() {
      const [storedPrompts, storedCategories] = await Promise.all([loadPrompts(), loadCategories()])
      setPrompts(storedPrompts)
      setCategories(storedCategories)
    }

    function onStorageChanged(
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) {
      if (areaName !== 'local') return
      if (STORAGE_KEYS.prompts in changes || STORAGE_KEYS.categories in changes) {
        void reloadFromStorage()
      }
    }

    chrome.storage.onChanged.addListener(onStorageChanged)
    return () => chrome.storage.onChanged.removeListener(onStorageChanged)
  }, [ready, session])

  async function replacePrompts(next: Prompt[]) {
    setPrompts(next)
    await savePrompts(next)
  }

  async function replaceCategories(next: Category[]) {
    setCategories(next)
    await saveCategories(next)
  }

  /**
   * 强一致：必须有有效 session；远端写入成功后才更新本地缓存，失败则不修改列表。
   */
  async function addPrompt(input: Omit<Prompt, 'id' | 'updatedAt'>) {
    const { data: { session: s } } = await supabase.auth.getSession()
    if (!s) throw new Error('请先登录')
    const remote = await createRemotePrompt(input)
    await replacePrompts([remote, ...prompts])
    return remote
  }

  async function updatePrompt(id: string, patch: Partial<Prompt>) {
    const { data: { session: s } } = await supabase.auth.getSession()
    if (!s) throw new Error('请先登录')
    const remote = await updateRemotePrompt(id, patch)
    const next = prompts.map((prompt) => (prompt.id === id ? remote : prompt))
    await replacePrompts(next)
  }

  async function deletePrompt(id: string) {
    const { data: { session: s } } = await supabase.auth.getSession()
    if (!s) throw new Error('请先登录')
    await deleteRemotePrompt(id)
    const next = prompts.filter((prompt) => prompt.id !== id)
    await replacePrompts(next)
  }

  async function addCategory(name: string) {
    const { data: { session: s } } = await supabase.auth.getSession()
    if (!s) throw new Error('请先登录')
    const remote = await createRemoteCategory(name)
    await replaceCategories([...categories, remote])
    return remote
  }

  async function updateCategory(id: string, patch: Partial<Category>) {
    const { data: { session: s } } = await supabase.auth.getSession()
    if (!s) throw new Error('请先登录')
    const remote = await updateRemoteCategory(id, patch)
    const next = categories.map((category) => (category.id === id ? remote : category))
    await replaceCategories(next)
  }

  async function deleteCategory(id: string) {
    const { data: { session: s } } = await supabase.auth.getSession()
    if (!s) throw new Error('请先登录')
    await deleteRemoteCategory(id)
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
    const result = await syncPromptsFromRemote()
    if (!result.ok) {
      if (result.reason === 'not_logged_in') throw new Error('请先登录')
      throw new Error(result.message ?? '同步失败')
    }
    const [storedPrompts, storedCategories] = await Promise.all([loadPrompts(), loadCategories()])
    setPrompts(storedPrompts)
    setCategories(storedCategories)
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

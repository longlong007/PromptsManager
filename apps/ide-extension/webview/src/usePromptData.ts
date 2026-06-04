import type { Session, User } from '@supabase/supabase-js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { apmLog } from './debugLog'
import { withTimeout } from './fetchWithTimeout'
import { postPromptsCacheToExtension } from './promptCache'
import { loadCategories, loadPrompts, saveCategories, savePrompts } from './storage'
import { syncPromptsFromRemote } from './syncService'
import {
  createRemoteCategory,
  createRemotePrompt,
  deleteRemoteCategory,
  deleteRemotePrompt,
  fetchRemoteCategories,
  fetchRemotePrompts,
  signInWithGoogleIde,
  supabase,
  updateRemoteCategory,
  updateRemotePrompt,
} from './supabase'
import type { Category, Prompt } from './types'

const SESSION_TIMEOUT_MS = 5000
const UI_READY_MAX_MS = 2000

/** 在 onAuthStateChange 里 await 会死锁 getSession，必须延后到下一轮事件循环 */
function defer(fn: () => void) {
  queueMicrotask(fn)
}

export function usePromptData() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [bootStatus, setBootStatus] = useState('正在初始化…')
  const hydratingRef = useRef(false)

  const hydrateFromRemote = useCallback(async (userId: string) => {
    const [remotePrompts, remoteCategories] = await Promise.all([
      fetchRemotePrompts(userId),
      fetchRemoteCategories(userId),
    ])
    setPrompts(remotePrompts)
    setCategories(remoteCategories)
    await savePrompts(remotePrompts)
    await saveCategories(remoteCategories)
    apmLog('sync', '已加载', { prompts: remotePrompts.length, categories: remoteCategories.length })
  }, [])

  const hydrateWithFallback = useCallback(
    async (userId: string) => {
      if (hydratingRef.current) return
      hydratingRef.current = true
      setSyncing(true)
      setLoadError(null)
      setBootStatus('正在从云端同步…')
      try {
        await hydrateFromRemote(userId)
        setBootStatus('')
      } catch (e) {
        const msg = e instanceof Error ? e.message : '从云端加载失败'
        apmLog('sync', '远程失败', msg)
        setLoadError(msg)
        const [storedPrompts, storedCategories] = await Promise.all([loadPrompts(), loadCategories()])
        setPrompts(storedPrompts)
        setCategories(storedCategories)
        setBootStatus(
          storedPrompts.length > 0 ? '已显示本地缓存，云端同步失败' : '云端同步失败，请点「同步云端」重试',
        )
      } finally {
        setSyncing(false)
        hydratingRef.current = false
      }
    },
    [hydrateFromRemote],
  )

  const scheduleHydrate = useCallback(
    (userId: string) => {
      defer(() => {
        void hydrateWithFallback(userId)
      })
    },
    [hydrateWithFallback],
  )

  useEffect(() => {
    if (ready && session) {
      try {
        postPromptsCacheToExtension(prompts)
      } catch {
        /* ignore */
      }
    }
  }, [prompts, ready, session])

  useEffect(() => {
    let active = true

    function finishUiReady() {
      if (!active) return
      setAuthLoading(false)
      setReady(true)
    }

    const uiReadyTimer = window.setTimeout(finishUiReady, UI_READY_MAX_MS)

    async function clearLocalCaches() {
      setPrompts([])
      setCategories([])
      await savePrompts([])
      await saveCategories([])
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return
      apmLog('sync', 'auth 事件', event)
      setSession(nextSession)
      setUser(nextSession?.user ?? null)

      if (!nextSession?.user) {
        if (event === 'SIGNED_OUT') {
          defer(() => {
            void clearLocalCaches()
          })
        }
        setLoadError(null)
        return
      }

      if (event === 'TOKEN_REFRESHED') return

      scheduleHydrate(nextSession.user.id)
    })

    async function boot() {
      setBootStatus('正在读取登录状态…')
      try {
        const { data } = await withTimeout(
          supabase.auth.getSession(),
          SESSION_TIMEOUT_MS,
          '读取登录状态',
        )
        if (!active) return

        const s = data.session
        setSession(s)
        setUser(s?.user ?? null)

        if (s?.user) {
          setBootStatus('已登录，准备同步…')
          const [cachedPrompts, cachedCategories] = await Promise.all([loadPrompts(), loadCategories()])
          if (cachedPrompts.length > 0 && active) {
            setPrompts(cachedPrompts)
            setCategories(cachedCategories)
            setBootStatus('已显示本地缓存，后台同步云端…')
          }
          scheduleHydrate(s.user.id)
        } else {
          setBootStatus('')
        }
      } catch (e) {
        apmLog('sync', 'boot 失败', e)
        setLoadError(e instanceof Error ? e.message : '初始化失败')
        setBootStatus('初始化失败，可尝试重新打开侧栏')
      }
    }

    void boot()

    return () => {
      active = false
      window.clearTimeout(uiReadyTimer)
      subscription.unsubscribe()
    }
  }, [scheduleHydrate])

  async function replacePrompts(next: Prompt[]) {
    setPrompts(next)
    await savePrompts(next)
  }

  async function replaceCategories(next: Category[]) {
    setCategories(next)
    await saveCategories(next)
  }

  async function addPrompt(input: Omit<Prompt, 'id' | 'updatedAt'>) {
    const {
      data: { session: s },
    } = await supabase.auth.getSession()
    if (!s) throw new Error('请先登录')
    const remote = await createRemotePrompt(input)
    await replacePrompts([remote, ...prompts])
    return remote
  }

  async function updatePrompt(id: string, patch: Partial<Prompt>) {
    const {
      data: { session: s },
    } = await supabase.auth.getSession()
    if (!s) throw new Error('请先登录')
    const remote = await updateRemotePrompt(id, patch)
    const next = prompts.map((prompt) => (prompt.id === id ? remote : prompt))
    await replacePrompts(next)
  }

  async function deletePrompt(id: string) {
    const {
      data: { session: s },
    } = await supabase.auth.getSession()
    if (!s) throw new Error('请先登录')
    await deleteRemotePrompt(id)
    const next = prompts.filter((prompt) => prompt.id !== id)
    await replacePrompts(next)
  }

  async function addCategory(name: string) {
    const {
      data: { session: s },
    } = await supabase.auth.getSession()
    if (!s) throw new Error('请先登录')
    const remote = await createRemoteCategory(name)
    await replaceCategories([...categories, remote])
    return remote
  }

  async function updateCategory(id: string, patch: Partial<Category>) {
    const {
      data: { session: s },
    } = await supabase.auth.getSession()
    if (!s) throw new Error('请先登录')
    const remote = await updateRemoteCategory(id, patch)
    const next = categories.map((category) => (category.id === id ? remote : category))
    await replaceCategories(next)
  }

  async function deleteCategory(id: string) {
    const {
      data: { session: s },
    } = await supabase.auth.getSession()
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
    setLoadError(null)
    setBootStatus('')
  }

  async function signInWithGoogle() {
    return signInWithGoogleIde()
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
    setLoadError(null)
    setBootStatus('')
    return result
  }

  return {
    prompts,
    categories,
    session,
    user,
    authLoading,
    ready,
    syncing,
    loadError,
    bootStatus,
    addPrompt,
    updatePrompt,
    deletePrompt,
    addCategory,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    syncFromRemote,
  }
}

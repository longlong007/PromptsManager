import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { Prompt, Category, CreatePromptInput, UpdatePromptInput, CreateCategoryInput } from '../types'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

interface PromptContextType {
  prompts: Prompt[]
  categories: Category[]
  loading: boolean
  error: string | null
  fetchPrompts: () => Promise<void>
  fetchCategories: () => Promise<void>
  createPrompt: (input: CreatePromptInput) => Promise<{ error: Error | null }>
  updatePrompt: (id: string, input: UpdatePromptInput) => Promise<{ error: Error | null }>
  deletePrompt: (id: string) => Promise<{ error: Error | null }>
  createCategory: (input: CreateCategoryInput) => Promise<{ error: Error | null }>
  updateCategory: (id: string, input: Partial<CreateCategoryInput>) => Promise<{ error: Error | null }>
  deleteCategory: (id: string) => Promise<{ error: Error | null }>
  searchPrompts: (query: string, categoryId?: string, tags?: string[]) => Promise<void>
}

const PromptContext = createContext<PromptContextType | undefined>(undefined)

export function PromptProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPrompts = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setPrompts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prompts')
    } finally {
      setLoading(false)
    }
  }, [user])

  const fetchCategories = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true })
      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
    }
  }, [user])

  const createPrompt = async (input: CreatePromptInput) => {
    if (!user) return { error: new Error('Not authenticated') }
    const { error } = await supabase.from('prompts').insert({ ...input, user_id: user.id })
    if (!error) await fetchPrompts()
    return { error }
  }

  const updatePrompt = async (id: string, input: UpdatePromptInput) => {
    const { error } = await supabase
      .from('prompts')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) await fetchPrompts()
    return { error }
  }

  const deletePrompt = async (id: string) => {
    const { error } = await supabase.from('prompts').delete().eq('id', id)
    if (!error) await fetchPrompts()
    return { error }
  }

  const createCategory = async (input: CreateCategoryInput) => {
    if (!user) return { error: new Error('Not authenticated') }
    const { error } = await supabase.from('categories').insert({ ...input, user_id: user.id })
    if (!error) await fetchCategories()
    return { error }
  }

  const updateCategory = async (id: string, input: Partial<CreateCategoryInput>) => {
    const { error } = await supabase.from('categories').update(input).eq('id', id)
    if (!error) await fetchCategories()
    return { error }
  }

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) await fetchCategories()
    return { error }
  }

  const searchPrompts = async (query: string, categoryId?: string, tags?: string[]) => {
    if (!user) return
    setLoading(true)
    try {
      let queryBuilder = supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)

      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      }
      if (categoryId) {
        queryBuilder = queryBuilder.eq('category_id', categoryId)
      }
      if (tags && tags.length > 0) {
        queryBuilder = queryBuilder.overlaps('tags', tags)
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false })
      if (error) throw error
      setPrompts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchPrompts()
      fetchCategories()
    } else {
      setPrompts([])
      setCategories([])
    }
  }, [user, fetchPrompts, fetchCategories])

  return (
    <PromptContext.Provider value={{
      prompts, categories, loading, error,
      fetchPrompts, fetchCategories, createPrompt, updatePrompt, deletePrompt,
      createCategory, updateCategory, deleteCategory, searchPrompts
    }}>
      {children}
    </PromptContext.Provider>
  )
}

export function usePrompts() {
  const context = useContext(PromptContext)
  if (context === undefined) {
    throw new Error('usePrompts must be used within a PromptProvider')
  }
  return context
}

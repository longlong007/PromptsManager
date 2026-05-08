export interface Prompt {
  id: string
  title: string
  content: string
  categoryId: string | null
  tags: string[]
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  parentId: string | null
}

export interface PromptFilters {
  query: string
  categoryId: string
  tag: string
}

import type { Category, Prompt } from './types'

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function categoryName(
  categories: Category[],
  categoryId: string | null
): string {
  if (!categoryId) return '未分类'
  const cat = categories.find((c) => c.id === categoryId)
  return cat?.name || '未分类'
}

export function buildCategoryTree(categories: Category[]): {
  roots: Category[]
  childrenMap: Record<string, Category[]>
} {
  const childrenMap: Record<string, Category[]> = {}
  const roots: Category[] = []

  for (const cat of categories) {
    if (cat.parent_id) {
      if (!childrenMap[cat.parent_id]) childrenMap[cat.parent_id] = []
      childrenMap[cat.parent_id].push(cat)
    } else {
      roots.push(cat)
    }
  }

  roots.sort((a, b) => a.sort_order - b.sort_order)
  for (const key of Object.keys(childrenMap)) {
    childrenMap[key].sort((a, b) => a.sort_order - b.sort_order)
  }

  return { roots, childrenMap }
}

export function filterPromptsLocal(
  prompts: Prompt[],
  query: string,
  categoryId: string,
  tagFilter: string
): Prompt[] {
  let result = prompts
  const q = query.trim().toLowerCase()
  if (q) {
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    )
  }
  if (categoryId) {
    result = result.filter((p) => p.category_id === categoryId)
  }
  if (tagFilter.trim()) {
    const tag = tagFilter.trim().toLowerCase()
    result = result.filter((p) =>
      p.tags.some((t) => t.toLowerCase().includes(tag))
    )
  }
  return result
}

export function copyToClipboard(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    wx.setClipboardData({
      data: text,
      success: () => resolve(),
      fail: (err) => reject(new Error(err.errMsg || '复制失败')),
    })
  })
}

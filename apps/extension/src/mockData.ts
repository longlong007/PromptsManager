import type { Category, Prompt } from './types'

export const mockCategories: Category[] = [
  { id: 'cat-1', name: '写作', parentId: null },
  { id: 'cat-2', name: '产品', parentId: null },
  { id: 'cat-3', name: '营销', parentId: null },
]

export const mockPrompts: Prompt[] = [
  {
    id: 'prompt-1',
    title: '重写为更专业的表达',
    content: '请将以下内容优化为更专业、简洁、自然的表达方式，并保留原意。',
    categoryId: 'cat-1',
    tags: ['写作', '优化'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prompt-2',
    title: '产品需求总结',
    content: '根据以下会议记录，整理成清晰的产品需求文档，包含目标、范围、风险和待确认事项。',
    categoryId: 'cat-2',
    tags: ['PRD', '产品'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prompt-3',
    title: '生成营销文案',
    content: '请基于产品特点生成 3 版不同风格的营销文案，要求突出卖点、降低理解成本。',
    categoryId: 'cat-3',
    tags: ['营销', '文案'],
    updatedAt: new Date().toISOString(),
  },
]

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePrompts } from '../contexts/PromptContext'
import { useAuth } from '../contexts/AuthContext'
import { Prompt } from '../types'
import { Copy, Save, ArrowLeft, Plus, X, Sparkles } from 'lucide-react'

export default function PromptDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { prompts, categories, updatePrompt, createPrompt, createCategory } = usePrompts()
  const { user, loading } = useAuth()

  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState('')
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)

  const isNew = id === 'new'

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    setCreatingCategory(true)
    const { error } = await createCategory({
      name: newCategoryName.trim(),
      parent_id: null,
      sort_order: categories.length
    })
    setCreatingCategory(false)
    if (!error) {
      setNewCategoryName('')
      setShowNewCategory(false)
    }
  }

  useEffect(() => {
    if (!isNew && id) {
      const found = prompts.find(p => p.id === id)
      if (found) {
        setPrompt(found)
        setTitle(found.title)
        setContent(found.content)
        setCategoryId(found.category_id || '')
        setTags(found.tags.join(', '))
      }
    }
  }, [id, prompts, isNew])


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!user) {
    navigate('/login')
    return null
  }

  const handleSave = async () => {
    setSaving(true)
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)
    const promptData = {
      title,
      content,
      category_id: categoryId || null,
      tags: tagList,
      variables: []
    }

    if (isNew) {
      await createPrompt(promptData)
    } else if (prompt) {
      await updatePrompt(prompt.id, promptData)
    }
    setSaving(false)
    navigate('/prompts')
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/prompts')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                返回
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {isNew ? '新建 Prompt' : '编辑 Prompt'}
              </h1>
            </div>
            {!isNew && (
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Copy className="w-4 h-4" />
                {copied ? '已复制' : '复制'}
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="给 Prompt 起个名字"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">分类</label>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  新建分类
                </button>
              </div>

              {showNewCategory && (
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="新分类名称"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                  />
                  <button
                    onClick={handleCreateCategory}
                    disabled={creatingCategory || !newCategoryName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    添加
                  </button>
                  <button
                    onClick={() => { setShowNewCategory(false); setNewCategoryName('') }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              )}

              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">未分类</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">标签（用逗号分隔）</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="写作, 翻译, 代码..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Prompt 内容</label>
                <button
                  onClick={() => {}}
                  disabled
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed flex items-center gap-1"
                >
                  <Sparkles className="w-4 h-4" />
                  AI 优化已移除
                </button>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                placeholder="在这里输入你的 Prompt..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => navigate('/prompts')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !title || !content}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

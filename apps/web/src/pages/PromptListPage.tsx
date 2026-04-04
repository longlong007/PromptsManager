import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrompts } from '../contexts/PromptContext'
import { useAuth } from '../contexts/AuthContext'
import { Prompt } from '../types'
import { Copy, Search, Plus, Edit2, Trash2, FolderOpen } from 'lucide-react'

export default function PromptListPage() {
  const navigate = useNavigate()
  const { prompts, categories, loading, deletePrompt, searchPrompts } = usePrompts()
  const { user, loading: authLoading } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [authLoading, user, navigate])

  const filteredPrompts = useMemo(() => {
    let result = prompts
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.content.toLowerCase().includes(query) ||
        p.tags.some((t: string) => t.toLowerCase().includes(query))
      )
    }
    if (selectedCategory) {
      result = result.filter(p => p.category_id === selectedCategory)
    }
    return result
  }, [prompts, searchQuery, selectedCategory])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchPrompts(searchQuery, selectedCategory)
  }

  const handleCopy = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content)
      setCopiedId(prompt.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDelete = async (id: string) => {
    await deletePrompt(id)
    setShowDeleteConfirm(null)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">Prompt Manager</h1>
              <button 
                onClick={() => navigate('/')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                返回首页
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/prompts/new')}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新建 Prompt
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索 Prompt..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部分类</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button type="submit" className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
              搜索
            </button>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : filteredPrompts.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {prompts.length === 0 ? '还没有任何 Prompt' : '没有找到匹配的 Prompt'}
            </p>
            {prompts.length === 0 && (
              <button
                onClick={() => navigate('/prompts/new')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                创建第一个 Prompt
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPrompts.map((prompt) => (
              <div key={prompt.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1 cursor-pointer" onClick={() => navigate(`/prompts/${prompt.id}`)}>
                    <h3 className="text-lg font-semibold text-gray-900">{prompt.title}</h3>
                    <p className="text-gray-500 mt-1 line-clamp-2">{prompt.content}</p>
                    <div className="flex gap-2 mt-3">
                      {prompt.tags.map((tag: string) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleCopy(prompt)}
                      className={`p-2 rounded-lg transition-colors ${copiedId === prompt.id ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-600'}`}
                      title="复制"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/prompts/${prompt.id}`)}
                      className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg"
                      title="编辑"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(prompt.id)}
                      className="p-2 hover:bg-red-100 text-red-600 rounded-lg"
                      title="删除"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
                  <span>使用 {prompt.usage_count} 次</span>
                  <span>{new Date(prompt.created_at).toLocaleDateString()}</span>
                </div>

                {showDeleteConfirm === prompt.id && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <p className="text-red-600 mb-3">确定要删除这个 Prompt 吗？</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(prompt.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        确认删除
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

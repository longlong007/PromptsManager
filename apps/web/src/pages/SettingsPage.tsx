import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePrompts } from '../contexts/PromptContext'
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { categories, createCategory, updateCategory, deleteCategory } = usePrompts()

  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [authLoading, user, navigate])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!user) return null

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    await createCategory({ name: newCategoryName.trim(), parent_id: null, sort_order: categories.length })
    setNewCategoryName('')
  }

  const handleStartEdit = (id: string, name: string) => {
    setEditingCategory(id)
    setEditingName(name)
  }

  const handleSaveEdit = async () => {
    if (!editingCategory || !editingName.trim()) return
    await updateCategory(editingCategory, { name: editingName.trim() })
    setEditingCategory(null)
    setEditingName('')
  }

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id)
    setShowDeleteConfirm(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              返回
            </button>
            <h1 className="text-xl font-bold text-gray-900">设置</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">分类管理</h2>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="新分类名称"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
            />
            <button
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>

          {categories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">还没有分类</p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  {editingCategory === cat.id ? (
                    <div className="flex gap-2 flex-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium text-gray-900">{cat.name}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStartEdit(cat.id, cat.name)}
                          className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(cat.id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {showDeleteConfirm && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-red-600 mb-3">确定要删除这个分类吗？</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteCategory(showDeleteConfirm)}
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
      </main>
    </div>
  )
}

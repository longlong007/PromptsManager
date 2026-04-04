import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePrompts } from '../contexts/PromptContext'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const { prompts, categories } = usePrompts()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const recentPrompts = prompts.slice(0, 5)
  const totalUsage = prompts.reduce((sum, p) => sum + p.usage_count, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Prompt Manager</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button onClick={handleSignOut} className="text-sm text-red-600 hover:text-red-700">
                退出
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">欢迎回来</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500 mb-1">Prompt 总数</p>
              <p className="text-3xl font-bold text-gray-900">{prompts.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500 mb-1">分类总数</p>
              <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500 mb-1">总使用次数</p>
              <p className="text-3xl font-bold text-gray-900">{totalUsage}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">最近添加</h3>
              <button 
                onClick={() => navigate('/prompts')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                查看全部
              </button>
            </div>
            {recentPrompts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">还没有 Prompt，点击下方按钮创建</p>
            ) : (
              <div className="space-y-3">
                {recentPrompts.map((prompt) => (
                  <div 
                    key={prompt.id}
                    onClick={() => navigate(`/prompts/${prompt.id}`)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                  >
                    <h4 className="font-medium text-gray-900">{prompt.title}</h4>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{prompt.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/prompts')}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                创建新 Prompt
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                设置 API Key
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Copy, Sparkles, FolderOpen, Search, Plus, Settings2, RefreshCw, Trash2, PenSquare, LogIn, RotateCw } from 'lucide-react'
import { usePromptData } from './usePromptData'
import { getSessionToken, optimizePromptWithAI } from './supabase'
import type { Prompt } from './types'

function GoogleIcon() {
  return (
    <svg className="google-icon" width={18} height={18} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function App() {
  const {
    prompts,
    categories,
    session,
    user,
    authLoading,
    ready,
    addPrompt,
    addCategory,
    deletePrompt,
    updatePrompt,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    syncFromRemote,
  } = usePromptData()

  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tag, setTag] = useState('')
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null)
  const [actionState, setActionState] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [authFormLoading, setAuthFormLoading] = useState(false)

  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      const matchesQuery = !query || prompt.title.includes(query) || prompt.content.includes(query)
      const matchesCategory = !categoryId || prompt.categoryId === categoryId
      const matchesTag = !tag || prompt.tags.some((item) => item.includes(tag))
      return matchesQuery && matchesCategory && matchesTag
    })
  }, [prompts, query, categoryId, tag])

  const selectedPrompt = filteredPrompts.find((item) => item.id === selectedPromptId) ?? filteredPrompts[0]

  async function handleCopy(prompt?: Prompt) {
    if (!prompt) return
    await navigator.clipboard.writeText(prompt.content)
    setActionState('已复制到剪贴板')
  }

  async function handleOptimize(prompt?: Prompt) {
    if (!prompt) return
    setActionState('正在调用 AI 优化...')
    const result = await optimizePromptWithAI(prompt.content)
    if (result.optimized) {
      try {
        await updatePrompt(prompt.id, { content: result.optimized })
        setActionState('优化完成')
      } catch (e) {
        setActionState(e instanceof Error ? e.message : '保存失败')
      }
    } else {
      setActionState(result.error || '优化失败')
    }
  }

  async function handleQuickCreate() {
    const title = window.prompt('请输入 Prompt 标题')?.trim()
    if (!title) return
    const content = window.prompt('请输入 Prompt 内容')?.trim()
    if (!content) return
    try {
      const prompt = await addPrompt({ title, content, categoryId: categoryId || null, tags: tag ? [tag] : [] })
      setSelectedPromptId(prompt.id)
      setActionState('已创建 Prompt')
    } catch (e) {
      setActionState(e instanceof Error ? e.message : '创建失败')
    }
  }

  async function handleQuickCategory() {
    const name = window.prompt('请输入分类名称')?.trim()
    if (!name) return
    try {
      const category = await addCategory(name)
      setCategoryId(category.id)
      setActionState('已创建分类')
    } catch (e) {
      setActionState(e instanceof Error ? e.message : '创建分类失败')
    }
  }

  async function handleDelete(prompt?: Prompt) {
    if (!prompt) return
    try {
      await deletePrompt(prompt.id)
      setActionState('已删除 Prompt')
    } catch (e) {
      setActionState(e instanceof Error ? e.message : '删除失败')
    }
  }

  async function handleAccountAuth(e: React.FormEvent) {
    e.preventDefault()
    setAuthFormLoading(true)
    setActionState('')
    const result = isLogin ? await signIn(authEmail, authPassword) : await signUp(authEmail, authPassword)
    if (result.error) {
      setActionState(result.error.message)
    } else if (!isLogin) {
      setActionState('注册成功，请查收验证邮件')
    } else {
      setActionState('登录成功')
    }
    setAuthFormLoading(false)
  }

  async function handleGoogleAuth() {
    setAuthFormLoading(true)
    setActionState('正在打开 Google 授权...')
    const { error } = await signInWithGoogle()
    if (error) {
      setActionState(error.message)
    } else {
      setActionState('登录成功')
    }
    setAuthFormLoading(false)
  }

  async function handleRefreshRemote() {
    const accessToken = await getSessionToken()
    if (!accessToken) {
      setActionState('请先登录')
      return
    }

    try {
      await syncFromRemote()
      setActionState('已从云端同步')
    } catch (error) {
      setActionState(error instanceof Error ? error.message : '同步失败')
    }
  }

  async function handleSignOut() {
    await signOut()
    setActionState('已退出登录')
  }

  if (authLoading || !ready) {
    return (
      <div className="app-shell app-center">
        <p className="muted">正在加载...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="app-shell login-shell">
        <div className="login-card">
          <div className="brand">Prompt Manager</div>
          <p className="muted">登录后与网页端共用账号与云端数据</p>

          <form className="login-form" onSubmit={handleAccountAuth}>
            <div className="search-box">
              <LogIn size={16} />
              <input
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="邮箱"
                type="email"
                required
                autoComplete="email"
              />
            </div>
            <div className="search-box" style={{ marginTop: 12 }}>
              <LogIn size={16} />
              <input
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="密码"
                type="password"
                required
                minLength={6}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </div>
            <button type="submit" className="action-btn primary login-submit" disabled={authFormLoading}>
              {authFormLoading ? '处理中...' : isLogin ? '登录' : '注册'}
            </button>
          </form>

          <button type="button" className="action-btn google-btn" onClick={handleGoogleAuth} disabled={authFormLoading}>
            <GoogleIcon />
            使用 Google 登录
          </button>

          <p className="login-switch muted">
            {isLogin ? '还没有账号？' : '已有账号？'}
            <button type="button" className="link-btn" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? '立即注册' : '去登录'}
            </button>
          </p>

          {actionState ? <p className="login-status">{actionState}</p> : null}
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand">AI Prompt Manager</div>
          <p className="muted">浏览器插件侧边栏，数据与 Prompt Manager 网页端同步。</p>
          <div className="account-bar">
            <span className="account-email">{user?.email ?? ''}</span>
            <button type="button" className="link-btn" onClick={handleSignOut}>
              退出
            </button>
          </div>
        </div>

        <div className="toolbar">
          <button className="action-btn primary" onClick={handleQuickCreate}><Plus size={16} /> 新建</button>
          <button className="action-btn" onClick={handleQuickCategory}><Settings2 size={16} /> 分类</button>
          <button className="action-btn" onClick={() => window.location.reload()}><RefreshCw size={16} /> 刷新</button>
        </div>

        <div className="search-box">
          <Search size={16} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索 Prompt" />
        </div>

        <div className="filter-row">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">全部分类</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="标签筛选" />
        </div>

        <div className="list-meta">
          <FolderOpen size={16} />
          <span>{filteredPrompts.length} 条 Prompt</span>
        </div>

        <div className="prompt-list">
          {filteredPrompts.map((prompt) => (
            <button
              key={prompt.id}
              className={`prompt-card ${selectedPrompt?.id === prompt.id ? 'active' : ''}`}
              onClick={() => setSelectedPromptId(prompt.id)}
            >
              <strong>{prompt.title}</strong>
              <span>{prompt.content.slice(0, 42)}...</span>
              <small>{prompt.tags.join(' · ')}</small>
            </button>
          ))}
        </div>

        <div className="toolbar" style={{ marginTop: 12 }}>
          <button className="action-btn" onClick={handleRefreshRemote}><RotateCw size={16} /> 同步云端</button>
        </div>
      </aside>

      <main className="content-panel">
        <div className="content-header">
          <div>
            <h1>Prompt 详情</h1>
            <p>支持复制、AI 优化和 CRUD；数据保存在你的账号下。</p>
          </div>
          <div className="header-actions">
            <button className="action-btn" onClick={() => handleCopy(selectedPrompt)}><Copy size={16} /> 复制</button>
            <button className="action-btn primary" onClick={() => handleOptimize(selectedPrompt)}><Sparkles size={16} /> AI 优化</button>
          </div>
        </div>

        {selectedPrompt ? (
          <section className="detail-card">
            <h2>{selectedPrompt.title}</h2>
            <p>{selectedPrompt.content}</p>
            <div className="tag-row">
              {selectedPrompt.tags.map((item) => (
                <span key={item} className="tag">#{item}</span>
              ))}
            </div>
            <div className="detail-footer">
              <span>最近更新：{new Date(selectedPrompt.updatedAt).toLocaleString('zh-CN')}</span>
            </div>
            <div className="toolbar" style={{ marginTop: 16 }}>
              <button className="action-btn" onClick={() => handleCopy(selectedPrompt)}><Copy size={16} /> 复制内容</button>
              <button className="action-btn" onClick={() => handleOptimize(selectedPrompt)}><PenSquare size={16} /> 优化内容</button>
              <button className="action-btn" onClick={() => handleDelete(selectedPrompt)}><Trash2 size={16} /> 删除</button>
            </div>
          </section>
        ) : (
          <section className="empty-state">没有找到符合条件的 Prompt。</section>
        )}

        <section className="quick-actions">
          <button className="quick-card" onClick={handleQuickCategory}>新建分类</button>
          <button className="quick-card" onClick={handleQuickCreate}>导入/新建 Prompt</button>
          <button className="quick-card" onClick={handleRefreshRemote}>同步云端</button>
        </section>

        <section className="detail-card">
          <h2>状态</h2>
          <p>{actionState || '数据已就绪。'}</p>
        </section>
      </main>
    </div>
  )
}

export default App

import { useMemo, useState } from 'react'
import { Copy, Sparkles, FolderOpen, Search, Plus, Settings2, RefreshCw, Trash2, PenSquare, LogIn, RotateCw } from 'lucide-react'
import { usePromptData } from './usePromptData'
import { getSessionToken, optimizePromptWithAI, supabase } from './supabase'
import { runtime } from './runtime'
import type { Prompt } from './types'

function App() {
  const { prompts, categories, authState, ready, addPrompt, addCategory, deletePrompt, updatePrompt, saveAuth, syncFromRemote } = usePromptData()
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tag, setTag] = useState('')
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null)
  const [actionState, setActionState] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

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
      await updatePrompt(prompt.id, { content: result.optimized })
      setActionState('优化完成')
    } else {
      setActionState(result.error || '优化失败')
    }
  }

  async function handleQuickCreate() {
    const title = window.prompt('请输入 Prompt 标题')?.trim()
    if (!title) return
    const content = window.prompt('请输入 Prompt 内容')?.trim()
    if (!content) return
    const prompt = await addPrompt({ title, content, categoryId: categoryId || null, tags: tag ? [tag] : [] })
    setSelectedPromptId(prompt.id)
    setActionState('已创建 Prompt')
  }

  async function handleQuickCategory() {
    const name = window.prompt('请输入分类名称')?.trim()
    if (!name) return
    const category = await addCategory(name)
    setCategoryId(category.id)
    setActionState('已创建分类')
  }

  async function handleDelete(prompt?: Prompt) {
    if (!prompt) return
    await deletePrompt(prompt.id)
    setActionState('已删除 Prompt')
  }

  async function handleSupabaseAuth() {
    if (!runtime.hasSupabaseConfig) {
      setActionState('请先在环境变量中配置 Supabase')
      return
    }

    setActionState('正在处理 Supabase 登录...')
    const fn = authMode === 'signin' ? supabase.auth.signInWithPassword : supabase.auth.signUp
    const { data, error } = await fn({ email: authEmail, password: authPassword })

    if (error) {
      setActionState(error.message)
      return
    }

    await saveAuth({
      accessToken: data.session?.access_token ?? null,
      userEmail: data.user?.email ?? authEmail,
    })

    setActionState(authMode === 'signin' ? '登录成功' : '注册成功，请检查邮箱')
  }

  async function handleRefreshRemote() {
    const accessToken = await getSessionToken()
    if (!accessToken) {
      setActionState(runtime.hasSupabaseConfig ? '请先登录 Supabase' : 'Supabase 未配置')
      return
    }

    try {
      await syncFromRemote()
      setActionState('云端数据已同步')
    } catch (error) {
      setActionState(error instanceof Error ? error.message : '同步失败')
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand">AI Prompt Manager</div>
          <p className="muted">浏览器插件侧边栏，已接入本地数据与 Supabase 优化入口。</p>
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

        <section className="detail-card" style={{ marginTop: 16 }}>
          <h2>Supabase 登录</h2>
          <p>{authState.userEmail ? `当前账号：${authState.userEmail}` : '尚未登录'}</p>
          <div className="search-box" style={{ marginTop: 12 }}>
            <LogIn size={16} />
            <input value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="邮箱" />
          </div>
          <div className="search-box" style={{ marginTop: 12 }}>
            <LogIn size={16} />
            <input value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="密码" type="password" />
          </div>
          <div className="toolbar" style={{ marginTop: 12 }}>
            <button className="action-btn" onClick={() => setAuthMode('signin')}>切换登录</button>
            <button className="action-btn" onClick={() => setAuthMode('signup')}>切换注册</button>
            <button className="action-btn primary" onClick={handleSupabaseAuth}>提交</button>
          </div>
          <div className="toolbar" style={{ marginTop: 12 }}>
            <button className="action-btn" onClick={handleRefreshRemote}><RotateCw size={16} /> 同步远端</button>
          </div>
        </section>
      </aside>

      <main className="content-panel">
        <div className="content-header">
          <div>
            <h1>Prompt 详情</h1>
            <p>支持复制、AI 优化和后续的 CRUD 操作。</p>
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
          <p>{ready ? actionState || '数据已就绪，可以开始测试。' : '正在加载本地数据...'}</p>
        </section>
      </main>
    </div>
  )
}

export default App

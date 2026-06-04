import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Copy,
  Sparkles,
  FolderOpen,
  Search,
  Plus,
  Settings2,
  RefreshCw,
  Trash2,
  PenSquare,
  LogIn,
  RotateCw,
  Pencil,
  Save,
  Code,
} from 'lucide-react'
import { usePromptData } from './usePromptData'
import { getSessionToken, optimizePromptWithAI } from './supabase'
import { apmLog } from './debugLog'
import { copyToClipboard } from './hostBridge'
import { insertPromptToEditor } from './insertEditor'
import { SimpleDialog } from './SimpleDialog'
import type { Prompt } from './types'

function GoogleIcon() {
  return (
    <svg className="google-icon" width={18} height={18} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function App() {
  useEffect(() => {
    apmLog('ui', 'IDE 侧栏 UI 已挂载')
  }, [])

  const {
    prompts,
    categories,
    session,
    user,
    authLoading,
    ready,
    syncing,
    loadError,
    bootStatus,
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
  const [dialogMode, setDialogMode] = useState<'prompt' | 'category' | null>(null)
  const [dialogBusy, setDialogBusy] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')

  const [isEditingPrompt, setIsEditingPrompt] = useState(false)
  const [editTargetId, setEditTargetId] = useState<string | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editDraft, setEditDraft] = useState({
    title: '',
    content: '',
    categoryId: '',
    tagsInput: '',
  })

  const prevSelectedPromptIdRef = useRef<string | null>(selectedPromptId)

  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      const matchesQuery =
        !query || prompt.title.includes(query) || prompt.content.includes(query)
      const matchesCategory = !categoryId || prompt.categoryId === categoryId
      const matchesTag = !tag || prompt.tags.some((item) => item.includes(tag))
      return matchesQuery && matchesCategory && matchesTag
    })
  }, [prompts, query, categoryId, tag])

  const effectiveSelectedId = selectedPromptId ?? filteredPrompts[0]?.id ?? null
  const selectedPrompt = effectiveSelectedId
    ? (prompts.find((p) => p.id === effectiveSelectedId) ?? null)
    : null

  useEffect(() => {
    const prev = prevSelectedPromptIdRef.current
    prevSelectedPromptIdRef.current = selectedPromptId
    if (prev !== null && selectedPromptId !== null && prev !== selectedPromptId) {
      setIsEditingPrompt(false)
      setEditTargetId(null)
    }
  }, [selectedPromptId])

  function beginEditPrompt(prompt: Prompt) {
    setSelectedPromptId(prompt.id)
    setEditTargetId(prompt.id)
    setEditDraft({
      title: prompt.title,
      content: prompt.content,
      categoryId: prompt.categoryId ?? '',
      tagsInput: prompt.tags.join(', '),
    })
    setIsEditingPrompt(true)
  }

  function cancelEditPrompt() {
    setIsEditingPrompt(false)
    setEditTargetId(null)
  }

  function parseTagsInput(raw: string): string[] {
    return raw
      .split(/[,，]/)
      .map((s) => s.trim())
      .filter(Boolean)
  }

  async function saveEditPrompt() {
    if (!editTargetId) {
      setActionState('无法保存：请关闭后重新点「编辑」')
      return
    }
    const title = editDraft.title.trim()
    const content = editDraft.content.trim()
    if (!title || !content) {
      setActionState('标题和内容不能为空')
      return
    }
    setEditSaving(true)
    setActionState('正在保存…')
    try {
      await updatePrompt(editTargetId, {
        title,
        content,
        categoryId: editDraft.categoryId || null,
        tags: parseTagsInput(editDraft.tagsInput),
      })
      setIsEditingPrompt(false)
      setEditTargetId(null)
      setActionState('已保存修改')
    } catch (e) {
      setActionState(e instanceof Error ? e.message : '保存失败')
    } finally {
      setEditSaving(false)
    }
  }

  async function handleCopy(prompt?: Prompt) {
    if (!prompt) return
    const ok = await copyToClipboard(prompt.content)
    setActionState(ok ? '已复制到剪贴板' : '复制失败')
  }

  async function handleInsertToEditor(prompt?: Prompt) {
    if (!prompt) return
    setActionState('正在插入到编辑器…')
    const result = await insertPromptToEditor(prompt.content)
    setActionState(result.ok ? '已插入到光标位置' : (result.error ?? '插入失败'))
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

  function openCreatePromptDialog() {
    setNewTitle('')
    setNewContent('')
    setDialogMode('prompt')
  }

  function openCreateCategoryDialog() {
    setNewCategoryName('')
    setDialogMode('category')
  }

  async function submitCreatePrompt() {
    const title = newTitle.trim()
    const content = newContent.trim()
    if (!title || !content) {
      setActionState('标题和内容不能为空')
      return
    }
    setDialogBusy(true)
    setActionState('正在创建…')
    try {
      const prompt = await addPrompt({
        title,
        content,
        categoryId: categoryId || null,
        tags: tag ? [tag] : [],
      })
      setSelectedPromptId(prompt.id)
      setDialogMode(null)
      setActionState('已创建 Prompt')
    } catch (e) {
      setActionState(e instanceof Error ? e.message : '创建失败')
    } finally {
      setDialogBusy(false)
    }
  }

  async function submitCreateCategory() {
    const name = newCategoryName.trim()
    if (!name) {
      setActionState('分类名称不能为空')
      return
    }
    setDialogBusy(true)
    setActionState('正在创建分类…')
    try {
      const category = await addCategory(name)
      setCategoryId(category.id)
      setDialogMode(null)
      setActionState('已创建分类')
    } catch (e) {
      setActionState(e instanceof Error ? e.message : '创建分类失败')
    } finally {
      setDialogBusy(false)
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
    const result = isLogin
      ? await signIn(authEmail, authPassword)
      : await signUp(authEmail, authPassword)
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
    }
    setAuthFormLoading(false)
  }

  async function handleRefreshRemote() {
    const accessToken = await getSessionToken()
    if (!accessToken) {
      setActionState('请先登录')
      return
    }

    setActionState('正在同步云端…')
    try {
      const result = await syncFromRemote()
      setActionState(`已从云端同步（${result.promptCount} 条 Prompt）`)
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
        <p className="muted">{bootStatus || '正在加载…'}</p>
        <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
          若超过 5 秒仍停在此页，请关闭侧栏后重新打开 Prompts
        </p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="app-shell login-shell">
        <div className="login-card">
          <div className="brand">Prompt Manager</div>
          <p className="muted">VS Code / Cursor 侧栏 · 与网页端、浏览器扩展共用账号</p>

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
            <button
              type="submit"
              className="action-btn primary login-submit"
              disabled={authFormLoading}
            >
              {authFormLoading ? '处理中...' : isLogin ? '登录' : '注册'}
            </button>
          </form>

          <button
            type="button"
            className="action-btn google-btn"
            onClick={handleGoogleAuth}
            disabled={authFormLoading}
          >
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
      <SimpleDialog
        open={dialogMode === 'prompt'}
        title="新建 Prompt"
        onClose={() => setDialogMode(null)}
        onConfirm={() => void submitCreatePrompt()}
        busy={dialogBusy}
      >
        <label>
          标题
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} autoFocus />
        </label>
        <label>
          内容
          <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} rows={5} />
        </label>
      </SimpleDialog>

      <SimpleDialog
        open={dialogMode === 'category'}
        title="新建分类"
        onClose={() => setDialogMode(null)}
        onConfirm={() => void submitCreateCategory()}
        busy={dialogBusy}
      >
        <label>
          分类名称
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            autoFocus
          />
        </label>
      </SimpleDialog>

      <aside className="sidebar">
        <div>
          <div className="brand">AI Prompt Manager</div>
          <p className="muted">IDE 侧栏 · 与网页/浏览器扩展共用 Supabase 数据。</p>
          {bootStatus ? <p className="status-syncing">{bootStatus}</p> : null}
          {syncing ? <p className="status-syncing">正在从云端加载…</p> : null}
          {loadError ? <p className="status-error">加载异常：{loadError}（可点「同步云端」重试）</p> : null}
          <div className="account-bar">
            <span className="account-email">{user?.email ?? ''}</span>
            <button type="button" className="link-btn" onClick={handleSignOut}>
              退出
            </button>
          </div>
        </div>

        <div className="toolbar">
          <button type="button" className="action-btn primary" onClick={openCreatePromptDialog}>
            <Plus size={16} /> 新建
          </button>
          <button type="button" className="action-btn" onClick={openCreateCategoryDialog}>
            <Settings2 size={16} /> 分类
          </button>
          <button type="button" className="action-btn" onClick={() => void handleRefreshRemote()}>
            <RefreshCw size={16} /> 刷新
          </button>
        </div>

        <div className="search-box">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索 Prompt"
          />
        </div>

        <div className="filter-row">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">全部分类</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
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
          <button type="button" className="action-btn" onClick={() => void handleRefreshRemote()}>
            <RotateCw size={16} /> 同步云端
          </button>
        </div>
      </aside>

      <main className="content-panel">
        <div className="content-header">
          <div>
            <h1>Prompt 详情</h1>
            <p>复制、插入编辑器、AI 优化与 CRUD。</p>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="action-btn"
              onClick={() => handleCopy(selectedPrompt ?? undefined)}
              disabled={isEditingPrompt}
            >
              <Copy size={16} /> 复制
            </button>
            <button
              type="button"
              className="action-btn"
              onClick={() => handleInsertToEditor(selectedPrompt ?? undefined)}
              disabled={!selectedPrompt || isEditingPrompt}
            >
              <Code size={16} /> 插入编辑器
            </button>
            <button
              type="button"
              className="action-btn"
              onClick={() => selectedPrompt && beginEditPrompt(selectedPrompt)}
              disabled={!selectedPrompt || isEditingPrompt}
            >
              <Pencil size={16} /> 编辑
            </button>
            <button
              type="button"
              className="action-btn primary"
              onClick={() => handleOptimize(selectedPrompt ?? undefined)}
              disabled={isEditingPrompt}
            >
              <Sparkles size={16} /> AI 优化
            </button>
          </div>
        </div>

        {selectedPrompt ? (
          <section className="detail-card">
            {isEditingPrompt ? (
              <form
                className="prompt-edit-form"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault()
                  void saveEditPrompt()
                }}
              >
                <label className="edit-field">
                  <span>标题</span>
                  <input
                    value={editDraft.title}
                    onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                    autoComplete="off"
                  />
                </label>
                <label className="edit-field">
                  <span>内容</span>
                  <textarea
                    value={editDraft.content}
                    onChange={(e) => setEditDraft((d) => ({ ...d, content: e.target.value }))}
                    rows={10}
                  />
                </label>
                <label className="edit-field">
                  <span>分类</span>
                  <select
                    value={editDraft.categoryId}
                    onChange={(e) =>
                      setEditDraft((d) => ({ ...d, categoryId: e.target.value }))
                    }
                  >
                    <option value="">未分类</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="edit-field">
                  <span>标签（逗号分隔）</span>
                  <input
                    value={editDraft.tagsInput}
                    onChange={(e) =>
                      setEditDraft((d) => ({ ...d, tagsInput: e.target.value }))
                    }
                    placeholder="例如：写作, 代码"
                    autoComplete="off"
                  />
                </label>
                <div className="toolbar edit-actions">
                  <button type="submit" className="action-btn primary" disabled={editSaving}>
                    <Save size={16} />
                    {editSaving ? '保存中…' : '保存'}
                  </button>
                  <button
                    type="button"
                    className="action-btn"
                    onClick={cancelEditPrompt}
                    disabled={editSaving}
                  >
                    取消
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h2>{selectedPrompt.title}</h2>
                <p>{selectedPrompt.content}</p>
                <div className="tag-row">
                  {selectedPrompt.tags.map((item) => (
                    <span key={item} className="tag">
                      #{item}
                    </span>
                  ))}
                </div>
                <div className="detail-footer">
                  <span>
                    最近更新：{new Date(selectedPrompt.updatedAt).toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className="toolbar" style={{ marginTop: 16 }}>
                  <button type="button" className="action-btn" onClick={() => handleCopy(selectedPrompt)}>
                    <Copy size={16} /> 复制内容
                  </button>
                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => handleInsertToEditor(selectedPrompt)}
                  >
                    <Code size={16} /> 插入编辑器
                  </button>
                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => beginEditPrompt(selectedPrompt)}
                  >
                    <Pencil size={16} /> 编辑
                  </button>
                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => handleOptimize(selectedPrompt)}
                  >
                    <PenSquare size={16} /> 优化内容
                  </button>
                  <button type="button" className="action-btn" onClick={() => handleDelete(selectedPrompt)}>
                    <Trash2 size={16} /> 删除
                  </button>
                </div>
              </>
            )}
          </section>
        ) : (
          <section className="empty-state">没有找到符合条件的 Prompt。</section>
        )}

        <section className="quick-actions">
          <button type="button" className="quick-card" onClick={openCreateCategoryDialog}>
            新建分类
          </button>
          <button type="button" className="quick-card" onClick={openCreatePromptDialog}>
            新建 Prompt
          </button>
          <button type="button" className="quick-card" onClick={() => void handleRefreshRemote()}>
            同步云端
          </button>
        </section>

        <section className="detail-card">
          <h2>状态</h2>
          <p>
            {actionState ||
              (prompts.length > 0
                ? `共 ${prompts.length} 条 Prompt。命令面板可搜「Insert Prompt at Cursor」。`
                : '列表为空时请点「同步云端」；新建请用上方按钮（勿依赖浏览器弹窗）。')}
          </p>
        </section>
      </main>
    </div>
  )
}

export default App

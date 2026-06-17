import { useEffect } from 'react'
import {
  HeroIllustration,
  PainLostIllustration,
  PainOverloadIllustration,
  PainLeakIllustration,
  FeatureIllustration,
  GiftBoxIllustration,
  WorkflowIllustration,
} from '../components/illustration/Illustrations'
import { APP_LOGIN_URL } from '../lib/appUrl'

const painPoints = [
  {
    title: '找不到了',
    desc: '之前有一个很好用的 Prompt，现在却怎么也找不到。',
    Illustration: PainLostIllustration,
  },
  {
    title: '太多了',
    desc: 'Prompt 堆成山，内容又长又重复，根本审不过来。',
    Illustration: PainOverloadIllustration,
  },
  {
    title: '怕泄露',
    desc: 'API Key 和 Token 混在 Prompt 里，复制时容易泄露。',
    Illustration: PainLeakIllustration,
  },
]

const features = [
  { type: 'inbox', title: 'Prompt Inbox', desc: '扫描结果先进待整理区，卡片摘要代替全文。' },
  { type: 'triage', title: 'Prompt Triage', desc: '自动分诊：有没有用、和谁重复、有没有风险。' },
  { type: 'version', title: '版本管理', desc: 'Git 式版本历史、Diff 对比、随时回滚。' },
  { type: 'security', title: '安全检查', desc: '复制给 AI 之前，自动检测敏感信息。' },
  { type: 'template', title: '变量模板', desc: '{{变量}} 一键填充，Prompt 变成可复用模板。' },
]

const triageStats = [
  { value: 38, label: '建议保留', color: '#4FD1C5' },
  { value: 46, label: '建议合并', sub: '12 组', color: '#FF6B4A' },
  { value: 9, label: '存在风险', color: '#EF4444' },
  { value: 21, label: '今日待处理', color: '#9F7AEA', highlight: true },
]

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: '永久免费',
    features: ['50 条 Prompt', 'Markdown 编辑', '基础搜索', '基础敏感检测'],
    highlight: false,
  },
  {
    name: 'Personal Pro',
    price: '$29',
    period: '早鸟买断',
    features: ['无限 Prompt', '本地扫描 & Inbox', '版本历史 & Diff', '高级安全检查', '变量模板'],
    highlight: true,
  },
  {
    name: 'AI Pro',
    price: '$8',
    period: '/月',
    features: ['AI 自动整理', 'AI 合并重复', '云同步 & 备份', '自带 API Key'],
    highlight: false,
  },
]

const tools = ['Cursor', 'Claude Code', 'Codex', 'ChatGPT', 'Obsidian']

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('revealed')),
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

export default function LandingPage() {
  useReveal()
  const loginUrl = APP_LOGIN_URL()

  return (
    <div className="illo-page">
      {/* Nav */}
      <nav className="illo-nav">
        <a href="/" className="illo-logo">
          <span className="illo-logo-mark">P</span>
          PromptRepo
        </a>
        <div className="illo-nav-links">
          <a href="#features">功能</a>
          <a href="#pricing">定价</a>
          <a href={loginUrl} className="illo-nav-login">登录</a>
          <a href={loginUrl} className="illo-btn illo-btn-primary illo-btn-sm">免费开始</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="illo-hero">
        <div className="illo-container illo-hero-grid">
          <div className="illo-hero-text reveal">
            <span className="illo-badge">本地优先 · 数据在你硬盘上</span>
            <h1 className="illo-headline">
              别再让好用的 Prompt
              <br />
              <span className="illo-headline-accent">石沉大海</span>
            </h1>
            <p className="illo-subline">
              像整理书架一样，管理你的 AI 编程提示词。
              可搜索、可回滚、复制前可安全检查。
            </p>
            <div className="illo-hero-actions">
              <a href={loginUrl} className="illo-btn illo-btn-primary">免费开始</a>
              <a href="#features" className="illo-btn illo-btn-outline">了解更多</a>
            </div>
            <div className="illo-tool-tags">
              {tools.map((t) => (
                <span key={t} className="illo-tag">{t}</span>
              ))}
            </div>
          </div>
          <div className="illo-hero-visual reveal">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="illo-section illo-pain">
        <div className="illo-container">
          <h2 className="illo-section-title reveal">这些场景，是不是很熟悉？</h2>
          <div className="illo-pain-grid">
            {painPoints.map(({ title, desc, Illustration }) => (
              <article key={title} className="illo-card illo-pain-card reveal">
                <Illustration />
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="illo-section">
        <div className="illo-container">
          <h2 className="illo-section-title reveal">不只是收藏夹，是开发资产库</h2>
          <p className="illo-section-sub reveal">AI 编程时代的 Snippets + Git + Obsidian + Secret Scanner</p>
          <div className="illo-feature-grid">
            {features.map(({ type, title, desc }) => (
              <article key={type} className="illo-card illo-feature-card reveal">
                <FeatureIllustration type={type} />
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Triage */}
      <section className="illo-section illo-triage">
        <div className="illo-container">
          <div className="illo-triage-box reveal">
            <div className="illo-triage-text">
              <h2>320 条候选 → 今天只需处理 21 条</h2>
              <p>Prompt Triage 自动分诊，人不审核全文，只审核摘要、风险和建议。</p>
            </div>
            <div className="illo-triage-stats">
              {triageStats.map((s) => (
                <div key={s.label} className={`illo-stat ${s.highlight ? 'illo-stat-highlight' : ''}`}>
                  <span className="illo-stat-value" style={{ color: s.color }}>{s.value}</span>
                  {s.sub && <span className="illo-stat-sub">{s.sub}</span>}
                  <span className="illo-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="illo-section illo-workflow-section">
        <div className="illo-container">
          <h2 className="illo-section-title reveal">从混乱到有序，只需五步</h2>
          <div className="illo-workflow-wrap reveal">
            <WorkflowIllustration />
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="illo-section">
        <div className="illo-container illo-trust-grid">
          {[
            { emoji: '🔒', title: '默认本地存储', desc: 'Prompt 原文不上传云端' },
            { emoji: '📦', title: '数据可导出', desc: 'Markdown / JSON / YAML 随时带走' },
            { emoji: '🛡️', title: '复制前安全检查', desc: 'API Key、Token、私钥自动检测' },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="illo-card illo-trust-card reveal">
              <span className="illo-trust-emoji">{emoji}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="illo-section illo-pricing-section">
        <div className="illo-container">
          <h2 className="illo-section-title reveal">简单透明的定价</h2>
          <p className="illo-section-sub reveal">本地核心功能不强制订阅</p>
          <div className="illo-pricing-grid">
            {pricingPlans.map((plan) => (
              <article key={plan.name} className={`illo-card illo-pricing-card reveal ${plan.highlight ? 'illo-pricing-highlight' : ''}`}>
                <GiftBoxIllustration highlight={plan.highlight} />
                <p className="illo-pricing-name">{plan.name}</p>
                <div className="illo-pricing-price">
                  <span>{plan.price}</span>
                  <small>{plan.period}</small>
                </div>
                <ul>
                  {plan.features.map((f) => (
                    <li key={f}>✓ {f}</li>
                  ))}
                </ul>
                <a href={loginUrl} className={`illo-btn ${plan.highlight ? 'illo-btn-primary' : 'illo-btn-outline'} illo-btn-block`}>
                  {plan.highlight ? '立即购买' : '免费开始'}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="illo-cta-section">
        <div className="illo-container illo-cta-box reveal">
          <h2>把 Prompt 当成开发资产来管理</h2>
          <p>收集 → 整理 → 复用 → 安全检查 → 版本迭代</p>
          <a href={loginUrl} className="illo-btn illo-btn-primary illo-btn-lg">免费下载 PromptRepo</a>
        </div>
      </section>

      <footer className="illo-footer">
        <p>PromptRepo © 2026 · 本地优先 · 不上传原文 · 可导出全部数据</p>
      </footer>
    </div>
  )
}

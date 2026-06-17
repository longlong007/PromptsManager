import { useEffect, useState } from 'react'
import {
  Inbox,
  Filter,
  GitBranch,
  Shield,
  Variable,
  Download,
  Play,
  Scan,
  Search,
  Copy,
  Lock,
  HardDrive,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import AuroraBackground from '../components/AuroraBackground'
import ProductPreview from '../components/ProductPreview'
import { APP_LOGIN_URL } from '../lib/appUrl'

const features = [
  {
    icon: Inbox,
    title: 'Prompt Inbox',
    desc: '扫描结果先进待整理区，卡片摘要代替全文，降低信息过载。',
    color: 'from-violet-500/20 to-violet-600/5',
    iconColor: 'text-violet-400',
  },
  {
    icon: Filter,
    title: 'Prompt Triage',
    desc: '自动回答「有没有用、和谁重复、有没有风险、该怎么处理」。',
    color: 'from-cyan-500/20 to-cyan-600/5',
    iconColor: 'text-cyan-400',
  },
  {
    icon: GitBranch,
    title: '版本管理',
    desc: 'Git 式版本历史、Diff 对比、回滚与最佳版本标记。',
    color: 'from-emerald-500/20 to-emerald-600/5',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Shield,
    title: '安全检查',
    desc: '复制给 AI 之前检测 API Key、Token、私钥等敏感信息。',
    color: 'from-red-500/20 to-red-600/5',
    iconColor: 'text-red-400',
  },
  {
    icon: Variable,
    title: '变量模板',
    desc: '{{变量}} 高亮、自动补全、一键填充，Prompt 变成可复用模板。',
    color: 'from-amber-500/20 to-amber-600/5',
    iconColor: 'text-amber-400',
  },
]

const triageStats = [
  { label: '建议保留', value: 38, color: 'text-emerald-400' },
  { label: '建议合并', value: 46, sub: '12 组', color: 'text-cyan-400' },
  { label: '存在风险', value: 9, color: 'text-red-400' },
  { label: '建议归档', value: 187, color: 'text-white/40' },
  { label: '需人工确认', value: 40, color: 'text-amber-400' },
]

const workflow = [
  { icon: Scan, label: '收集', desc: '扫描本地目录' },
  { icon: Filter, label: '整理', desc: 'Inbox 分诊' },
  { icon: Search, label: '复用', desc: '搜索 & 模板' },
  { icon: Shield, label: '安全', desc: '复制前检查' },
  { icon: GitBranch, label: '迭代', desc: '版本回滚' },
]

const tools = ['Cursor', 'Claude Code', 'Codex', 'ChatGPT', 'Obsidian']

const revealDelays = ['', 'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3', 'reveal-delay-4', 'reveal-delay-5']

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: '永久免费',
    desc: '体验核心流程',
    features: ['50 条 Prompt', 'Markdown 编辑', '基础搜索', '基础敏感检测', '本地存储'],
    cta: '免费开始',
    highlight: false,
  },
  {
    name: 'Personal Pro',
    price: '$29',
    period: '早鸟买断价',
    desc: '一次购买，永久使用',
    features: [
      '无限 Prompt',
      '本地目录扫描',
      'Prompt Inbox & Triage',
      '版本历史 & Diff',
      '变量模板',
      '高级安全检查',
      '重复检测 & 导入导出',
    ],
    cta: '立即购买',
    highlight: true,
  },
  {
    name: 'AI Pro',
    price: '$8',
    period: '/月',
    desc: '云端 AI 增强',
    features: ['AI 自动整理', 'AI 合并重复', 'AI 生成工作流', '云同步 & 备份', '自带 API Key'],
    cta: '了解更多',
    highlight: false,
  },
]

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

const loginUrl = APP_LOGIN_URL()

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  useScrollReveal()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#0F172A] text-white antialiased">
      <AuroraBackground />

      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-nav-scrolled py-3' : 'py-5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white/90 tracking-tight">PromptRepo</span>
          </a>

          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#features" className="hover:text-white/90 transition-colors">功能</a>
            <a href="#triage" className="hover:text-white/90 transition-colors">分诊系统</a>
            <a href="#pricing" className="hover:text-white/90 transition-colors">定价</a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={loginUrl}
              className="hidden sm:block text-sm text-white/60 hover:text-white/90 transition-colors px-3 py-2"
            >
              登录
            </a>
            <a
              href={loginUrl}
              className="text-sm font-medium px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white hover:from-violet-400 hover:to-violet-500 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5"
            >
              免费下载
            </a>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="reveal-on-scroll">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-badge text-xs text-violet-300 mb-6">
                <HardDrive className="w-3.5 h-3.5" />
                本地优先 · 数据在你硬盘上
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-[1.15] tracking-tight">
                散落各处的 Prompt，
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  终于有个家了
                </span>
              </h1>

              <p className="mt-6 text-lg text-white/55 leading-relaxed max-w-lg">
                PromptRepo 帮你把 Cursor Rules、CLAUDE.md、ChatGPT 对话里的提示词，整理成可搜索、可回滚、复制前可安全检查的个人资产库。
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={loginUrl}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white font-medium hover:from-violet-400 hover:to-violet-500 transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5"
                >
                  <Download className="w-4 h-4" />
                  免费开始
                </a>
                <button type="button" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-button text-white/80 font-medium hover:text-white hover:bg-white/10 transition-all">
                  <Play className="w-4 h-4" />
                  观看演示
                </button>
              </div>

              <div className="mt-10 flex flex-wrap gap-2">
                {tools.map((tool) => (
                  <span
                    key={tool}
                    className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/45"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <div className="reveal-on-scroll reveal-delay-2 animate-float">
              <ProductPreview />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 reveal-on-scroll">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              不只是收藏夹，是开发资产库
            </h2>
            <p className="mt-4 text-white/50 max-w-2xl mx-auto">
              AI 编程时代的 Snippets + Git + Obsidian + Secret Scanner
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`glass-card p-6 rounded-2xl hover:border-white/20 transition-all duration-300 hover:-translate-y-1 reveal-on-scroll ${revealDelays[i + 1] ?? ''}`}
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 border border-white/10`}
                >
                  <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-white/90">{feature.title}</h3>
                <p className="mt-2 text-sm text-white/45 leading-relaxed">{feature.desc}</p>
              </div>
            ))}

            <div className="glass-card p-6 rounded-2xl sm:col-span-2 lg:col-span-1 flex flex-col justify-center reveal-on-scroll reveal-delay-5">
              <p className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                320 → 21
              </p>
              <p className="mt-2 text-sm text-white/50">
                320 条候选 Prompt，Triage 后今天只需处理 21 条高价值或高风险内容。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="triage" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="glass-panel rounded-3xl p-8 sm:p-10 reveal-on-scroll">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <p className="text-sm text-violet-400 font-medium mb-2">Prompt Triage 扫描报告</p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  人不审核全文，
                  <br className="hidden sm:block" />
                  只审核摘要、风险和建议
                </h2>
                <p className="mt-4 text-white/50 max-w-md">
                  系统自动回答：这是什么？有没有用？和谁重复？有没有风险？我该怎么处理？
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {triageStats.map((stat) => (
                  <div key={stat.label} className="glass-card rounded-xl p-4 text-center">
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    {stat.sub && <p className="text-[10px] text-white/30">{stat.sub}</p>}
                    <p className="text-xs text-white/40 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-white/40 font-mono">
                  $ promptrepo scan ~/projects → 320 candidates → triage complete
                </p>
                <a
                  href={loginUrl}
                  className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  开始第一次扫描
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto reveal-on-scroll">
          <h2 className="text-3xl font-bold text-center mb-12 tracking-tight">核心工作流</h2>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-2">
            {workflow.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2 sm:gap-4">
                <div className="glass-card px-5 py-4 rounded-xl text-center min-w-[100px] hover:border-white/20 transition-all">
                  <step.icon className="w-5 h-5 text-violet-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white/90">{step.label}</p>
                  <p className="text-[11px] text-white/35 mt-0.5">{step.desc}</p>
                </div>
                {i < workflow.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-white/20 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-5 reveal-on-scroll">
            {[
              { icon: Lock, title: '默认本地存储', desc: 'Prompt 原文不上传云端' },
              { icon: HardDrive, title: '数据可导出', desc: 'Markdown / JSON / YAML 随时带走' },
              { icon: Copy, title: '复制前安全检查', desc: 'API Key、Token、私钥自动检测' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card p-5 rounded-xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-white/90">{title}</p>
                  <p className="text-sm text-white/45 mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 reveal-on-scroll">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">简单透明的定价</h2>
            <p className="mt-4 text-white/50">本地核心功能不强制订阅</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, i) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 reveal-on-scroll ${revealDelays[i + 1] ?? ''} ${
                  plan.highlight
                    ? 'glass-panel-hero border-violet-400/30 shadow-xl shadow-violet-500/10'
                    : 'glass-card'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-medium">
                    推荐
                  </span>
                )}
                <p className="text-sm text-white/50">{plan.name}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-white/40">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-white/45">{plan.desc}</p>

                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/55">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={loginUrl}
                  className={`mt-8 block w-full text-center py-2.5 rounded-xl text-sm font-medium transition-all ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-violet-500 to-violet-600 text-white hover:from-violet-400 hover:to-violet-500 shadow-lg shadow-violet-500/25'
                      : 'glass-button text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center reveal-on-scroll">
          <div className="glass-panel rounded-3xl p-10 sm:p-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              把 Prompt 当成开发资产来管理
            </h2>
            <p className="mt-4 text-white/50">
              收集 → 自动整理 → 降噪审核 → 搜索复用 → 安全检查 → 版本迭代
            </p>
            <a
              href={loginUrl}
              className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-medium hover:from-violet-400 hover:to-cyan-400 transition-all shadow-lg shadow-violet-500/30 hover:-translate-y-0.5"
            >
              <Download className="w-4 h-4" />
              免费下载 PromptRepo
            </a>
          </div>
        </div>
      </section>

      <footer className="py-10 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-white/50">PromptRepo © 2026</span>
          </div>
          <p className="text-xs text-white/30">本地优先 · 不上传原文 · 可导出全部数据</p>
        </div>
      </footer>
    </div>
  )
}

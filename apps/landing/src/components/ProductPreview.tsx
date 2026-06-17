import {
  Inbox,
  Shield,
  GitBranch,
  Variable,
  Search,
  Copy,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'

const inboxItems = [
  {
    title: 'NestJS Bug 修复 Prompt',
    summary: '根据错误日志和相关代码定位后端接口报错原因',
    scene: 'Bug 修复 / 后端',
    status: '建议保留',
    statusColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    risk: null,
  },
  {
    title: 'Cursor Rules - React 项目',
    summary: 'React + TypeScript 项目编码规范与组件约定',
    scene: 'Cursor Rules',
    status: '疑似重复',
    statusColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    risk: null,
  },
  {
    title: '部署检查 Prompt',
    summary: '上线前环境变量、依赖版本、回滚方案检查清单',
    scene: '部署 / DevOps',
    status: '存在风险',
    statusColor: 'text-red-400 bg-red-400/10 border-red-400/20',
    risk: '疑似 API Key 1 处',
  },
]

export default function ProductPreview() {
  return (
    <div className="relative">
      <div className="glass-panel glass-panel-deep absolute -inset-4 rounded-3xl opacity-60 scale-95" />
      <div className="glass-panel absolute -inset-2 rounded-3xl opacity-80 scale-[0.98]" />

      <div className="glass-panel glass-panel-hero relative rounded-2xl overflow-hidden shadow-2xl shadow-violet-500/10">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.03]">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400/80" />
            <span className="w-3 h-3 rounded-full bg-amber-400/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
          </div>
          <span className="text-xs text-white/40 ml-2 font-mono">PromptRepo — Inbox</span>
        </div>

        <div className="flex min-h-[340px]">
          <aside className="w-44 shrink-0 border-r border-white/10 p-3 hidden sm:block">
            <nav className="space-y-1">
              {[
                { icon: Inbox, label: 'Inbox', count: 21, active: true },
                { icon: Search, label: 'Library', count: null, active: false },
                { icon: GitBranch, label: 'Versions', count: null, active: false },
                { icon: Shield, label: 'Security', count: 9, active: false },
                { icon: Variable, label: 'Templates', count: null, active: false },
              ].map(({ icon: Icon, label, count, active }) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                    active
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-400/20'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                  {count != null && (
                    <span className="ml-auto text-[10px] bg-violet-500/30 text-violet-200 px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          </aside>

          <main className="flex-1 p-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-sm font-medium text-white/90">Prompt Inbox</p>
                <p className="text-[11px] text-white/40">320 条候选 → 今天只需处理 21 条</p>
              </div>
              <button type="button" className="text-[11px] px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/20">
                扫描报告
              </button>
            </div>

            {inboxItems.map((item) => (
              <div
                key={item.title}
                className="glass-card p-3 rounded-xl hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5 cursor-default"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white/90 truncate">{item.title}</p>
                    <p className="text-[11px] text-white/45 mt-0.5 line-clamp-1">{item.summary}</p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border ${item.statusColor}`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-white/30">{item.scene}</span>
                  {item.risk && (
                    <span className="flex items-center gap-1 text-[10px] text-red-400/80">
                      <AlertTriangle className="w-3 h-3" />
                      {item.risk}
                    </span>
                  )}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-2 pt-1">
              <button type="button" className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-violet-500/30 text-violet-200 border border-violet-400/30 hover:bg-violet-500/40 transition-colors">
                <CheckCircle2 className="w-3 h-3" />
                批量保留
              </button>
              <button type="button" className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 transition-colors">
                <Copy className="w-3 h-3" />
                复制到 Cursor
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

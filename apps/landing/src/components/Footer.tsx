import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { POLICIES } from '../lib/policies'

export default function Footer() {
  return (
    <footer className="py-10 px-4 sm:px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-6">
        <nav className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-xs text-white/40">
          {POLICIES.map((policy, index) => (
            <span key={policy.slug} className="inline-flex items-center gap-2">
              {index > 0 && <span className="text-white/20 select-none">|</span>}
              <Link
                to={`/${policy.slug}`}
                className="hover:text-white/70 transition-colors whitespace-nowrap"
              >
                {policy.title}
              </Link>
            </span>
          ))}
        </nav>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-white/50">PromptRepo © 2026</span>
          </div>
          <p className="text-xs text-white/30 text-center sm:text-right">
            本地优先 · 不上传原文 · 可导出全部数据
          </p>
        </div>
      </div>
    </footer>
  )
}

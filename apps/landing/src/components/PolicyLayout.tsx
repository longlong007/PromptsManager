import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import AuroraBackground from './AuroraBackground'
import Footer from './Footer'

type PolicyLayoutProps = {
  title: string
  lastUpdated: string
  children: ReactNode
}

export default function PolicyLayout({ title, lastUpdated, children }: PolicyLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white antialiased flex flex-col">
      <AuroraBackground />

      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white/90 tracking-tight">PromptRepo</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 py-12 px-4 sm:px-6">
        <article className="max-w-3xl mx-auto glass-panel rounded-3xl p-8 sm:p-10">
          <p className="text-sm text-violet-400 font-medium">Legal</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm text-white/40">Last updated: {lastUpdated}</p>
          <div className="mt-8 space-y-8 text-white/60 leading-relaxed">{children}</div>
        </article>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  )
}

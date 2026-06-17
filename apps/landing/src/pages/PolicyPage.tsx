import { Link, Navigate, useParams } from 'react-router-dom'
import PolicyLayout from '../components/PolicyLayout'
import { POLICY_BY_SLUG, POLICIES } from '../lib/policies'

export default function PolicyPage() {
  const { slug } = useParams<{ slug: string }>()
  const policy = slug ? POLICY_BY_SLUG[slug] : undefined

  if (!policy) {
    return <Navigate to="/" replace />
  }

  return (
    <PolicyLayout title={policy.title} lastUpdated={policy.lastUpdated}>
      <p className="text-white/70">{policy.intro}</p>

      {policy.sections.map((section) => (
        <section key={section.heading}>
          <h2 className="text-xl font-semibold text-white/90">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-3">
              {paragraph}
            </p>
          ))}
          {section.bullets && (
            <ul className="mt-3 list-disc pl-5 space-y-2">
              {section.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="pt-4 border-t border-white/10">
        <p className="text-sm text-white/45">Related policies:</p>
        <div className="mt-3 flex flex-wrap gap-x-2 gap-y-2 text-sm">
          {POLICIES.filter((item) => item.slug !== policy.slug).map((item, index) => (
            <span key={item.slug} className="inline-flex items-center gap-2">
              {index > 0 && <span className="text-white/20">|</span>}
              <Link to={`/${item.slug}`} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                {item.title}
              </Link>
            </span>
          ))}
        </div>
      </section>
    </PolicyLayout>
  )
}

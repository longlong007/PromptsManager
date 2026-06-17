export function HeroIllustration() {
  return (
    <svg viewBox="0 0 480 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="illo-hero-svg" aria-hidden>
      {/* Background blobs */}
      <ellipse cx="240" cy="200" rx="180" ry="160" fill="#FFF0EC" />
      <ellipse cx="320" cy="120" rx="80" ry="70" fill="#E6FFFA" opacity="0.8" />
      <ellipse cx="120" cy="280" rx="60" ry="50" fill="#FEEBC8" opacity="0.6" />

      {/* Scattered prompt cards (chaos) */}
      {[
        { x: 60, y: 80, r: -12, c: '#FF6B4A' },
        { x: 130, y: 50, r: 8, c: '#4FD1C5' },
        { x: 200, y: 70, r: -5, c: '#9F7AEA' },
        { x: 280, y: 45, r: 15, c: '#F6AD55' },
        { x: 350, y: 90, r: -8, c: '#FF6B4A' },
        { x: 90, y: 160, r: 6, c: '#4FD1C5' },
        { x: 370, y: 150, r: -14, c: '#2D3748' },
        { x: 310, y: 180, r: 10, c: '#FF6B4A' },
      ].map((card, i) => (
        <g key={i} transform={`translate(${card.x}, ${card.y}) rotate(${card.r})`}>
          <rect x="0" y="0" width="56" height="36" rx="6" fill="white" stroke={card.c} strokeWidth="2" />
          <line x1="8" y1="10" x2="48" y2="10" stroke={card.c} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <line x1="8" y1="18" x2="40" y2="18" stroke={card.c} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
          <line x1="8" y1="26" x2="32" y2="26" stroke={card.c} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        </g>
      ))}

      {/* Organized shelf (right side) */}
      <rect x="300" y="220" width="120" height="8" rx="4" fill="#2D3748" />
      <rect x="310" y="180" width="48" height="32" rx="5" fill="white" stroke="#4FD1C5" strokeWidth="2" />
      <rect x="362" y="180" width="48" height="32" rx="5" fill="white" stroke="#4FD1C5" strokeWidth="2" />
      <rect x="310" y="140" width="48" height="32" rx="5" fill="white" stroke="#4FD1C5" strokeWidth="2" />
      <rect x="362" y="140" width="48" height="32" rx="5" fill="white" stroke="#4FD1C5" strokeWidth="2" />

      {/* Friendly robot helper */}
      <g transform="translate(330, 250)">
        <rect x="0" y="20" width="60" height="50" rx="12" fill="#4FD1C5" stroke="#2D3748" strokeWidth="2" />
        <rect x="10" y="0" width="40" height="28" rx="10" fill="#4FD1C5" stroke="#2D3748" strokeWidth="2" />
        <circle cx="22" cy="12" r="5" fill="white" stroke="#2D3748" strokeWidth="1.5" />
        <circle cx="38" cy="12" r="5" fill="white" stroke="#2D3748" strokeWidth="1.5" />
        <circle cx="22" cy="12" r="2" fill="#2D3748" />
        <circle cx="38" cy="12" r="2" fill="#2D3748" />
        <path d="M24 20 Q30 24 36 20" stroke="#2D3748" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="18" y="38" width="24" height="4" rx="2" fill="#2D3748" opacity="0.3" />
        {/* Arm holding card */}
        <line x1="60" y1="40" x2="80" y2="25" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
        <rect x="72" y="10" width="40" height="28" rx="5" fill="white" stroke="#FF6B4A" strokeWidth="2" transform="rotate(-10 92 24)" />
      </g>

      {/* Developer character */}
      <g transform="translate(140, 220)">
        {/* Body */}
        <ellipse cx="40" cy="95" rx="35" ry="10" fill="#2D3748" opacity="0.1" />
        <path d="M20 50 L60 50 L55 90 L25 90 Z" fill="#FF6B4A" stroke="#2D3748" strokeWidth="2" strokeLinejoin="round" />
        {/* Head */}
        <circle cx="40" cy="35" r="22" fill="#FEEBC8" stroke="#2D3748" strokeWidth="2" />
        {/* Hair */}
        <path d="M20 30 Q25 10 40 15 Q55 10 60 30" fill="#2D3748" stroke="#2D3748" strokeWidth="1.5" />
        {/* Face */}
        <circle cx="32" cy="35" r="2.5" fill="#2D3748" />
        <circle cx="48" cy="35" r="2.5" fill="#2D3748" />
        <path d="M34 44 Q40 48 46 44" stroke="#2D3748" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Confused arms */}
        <path d="M18 55 Q5 45 10 30" stroke="#2D3748" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M62 55 Q75 40 70 25" stroke="#2D3748" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Question mark */}
        <text x="72" y="20" fontSize="24" fontWeight="bold" fill="#F6AD55" fontFamily="Plus Jakarta Sans, sans-serif">?</text>
      </g>

      {/* Floating sparkles */}
      <circle cx="250" cy="300" r="4" fill="#F6AD55" opacity="0.7" />
      <circle cx="180" cy="130" r="3" fill="#4FD1C5" opacity="0.7" />
      <path d="M400 200 l4 8 l8 4 l-8 4 l-4 8 l-4-8 l-8-4 l8-4z" fill="#FF6B4A" opacity="0.5" />
    </svg>
  )
}

export function PainLostIllustration() {
  return (
    <svg viewBox="0 0 200 160" fill="none" className="illo-pain-svg" aria-hidden>
      <rect width="200" height="160" rx="12" fill="#FFF5F3" />
      <g transform="translate(30, 40)">
        <circle cx="30" cy="25" r="18" fill="#FEEBC8" stroke="#2D3748" strokeWidth="2" />
        <path d="M22 22 Q30 28 38 22" stroke="#2D3748" strokeWidth="1.5" fill="none" />
        <circle cx="24" cy="22" r="2" fill="#2D3748" />
        <circle cx="36" cy="22" r="2" fill="#2D3748" />
        {/* File pile */}
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={60 + i * 8} y={30 - i * 4} width="50" height="35" rx="4"
            fill="white" stroke="#FF6B4A" strokeWidth="1.5" opacity={1 - i * 0.15} />
        ))}
        <text x="80" y="90" fontSize="20" fill="#F6AD55" fontFamily="sans-serif">???</text>
      </g>
    </svg>
  )
}

export function PainOverloadIllustration() {
  return (
    <svg viewBox="0 0 200 160" fill="none" className="illo-pain-svg" aria-hidden>
      <rect width="200" height="160" rx="12" fill="#FFFAF0" />
      <g transform="translate(20, 20)">
        {/* Mountain of cards */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={40 + (i % 3) * 20} y={80 - i * 12} width="44" height="28" rx="4"
            fill="white" stroke="#F6AD55" strokeWidth="1.5" />
        ))}
        <circle cx="100" cy="30" r="16" fill="#FEEBC8" stroke="#2D3748" strokeWidth="2" />
        <text x="93" y="36" fontSize="18" fontWeight="bold" fill="#2D3748">!</text>
      </g>
    </svg>
  )
}

export function PainLeakIllustration() {
  return (
    <svg viewBox="0 0 200 160" fill="none" className="illo-pain-svg" aria-hidden>
      <rect width="200" height="160" rx="12" fill="#FFF5F5" />
      <g transform="translate(30, 30)">
        <rect x="40" y="20" width="80" height="55" rx="6" fill="white" stroke="#2D3748" strokeWidth="2" />
        <text x="52" y="45" fontSize="9" fill="#EF4444" fontFamily="monospace">sk-abc123...</text>
        <text x="52" y="58" fontSize="9" fill="#EF4444" fontFamily="monospace">API_KEY=xxx</text>
        {/* Shield */}
        <g transform="translate(10, 50)">
          <path d="M30 0 L55 10 L55 35 Q30 55 5 35 L5 10 Z" fill="#4FD1C5" stroke="#2D3748" strokeWidth="2" />
          <path d="M18 25 L26 33 L42 17" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {/* Leaking drops */}
        <circle cx="130" cy="70" r="4" fill="#EF4444" opacity="0.6" />
        <circle cx="140" cy="85" r="3" fill="#EF4444" opacity="0.4" />
      </g>
    </svg>
  )
}

export function FeatureIllustration({ type }: { type: string }) {
  const props = { viewBox: '0 0 80 80', fill: 'none', className: 'illo-feature-svg', 'aria-hidden': true as const }

  switch (type) {
    case 'inbox':
      return (
        <svg {...props}>
          <rect x="10" y="20" width="60" height="45" rx="8" fill="#FFF0EC" stroke="#FF6B4A" strokeWidth="2" />
          <path d="M10 28 L40 48 L70 28" stroke="#FF6B4A" strokeWidth="2" fill="none" />
          <circle cx="58" cy="24" r="10" fill="#FF6B4A" />
          <text x="53" y="28" fontSize="10" fill="white" fontWeight="bold">21</text>
        </svg>
      )
    case 'triage':
      return (
        <svg {...props}>
          <rect x="8" y="30" width="20" height="30" rx="4" fill="#4FD1C5" stroke="#2D3748" strokeWidth="1.5" />
          <rect x="30" y="22" width="20" height="38" rx="4" fill="#F6AD55" stroke="#2D3748" strokeWidth="1.5" />
          <rect x="52" y="35" width="20" height="25" rx="4" fill="#9F7AEA" stroke="#2D3748" strokeWidth="1.5" />
          <path d="M18 20 L40 12 L62 20" stroke="#2D3748" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
        </svg>
      )
    case 'version':
      return (
        <svg {...props}>
          <circle cx="40" cy="20" r="8" fill="#4FD1C5" stroke="#2D3748" strokeWidth="2" />
          <circle cx="20" cy="55" r="8" fill="#FF6B4A" stroke="#2D3748" strokeWidth="2" />
          <circle cx="60" cy="55" r="8" fill="#9F7AEA" stroke="#2D3748" strokeWidth="2" />
          <line x1="40" y1="28" x2="20" y2="47" stroke="#2D3748" strokeWidth="2" />
          <line x1="40" y1="28" x2="60" y2="47" stroke="#2D3748" strokeWidth="2" />
        </svg>
      )
    case 'security':
      return (
        <svg {...props}>
          <path d="M40 10 L65 22 L65 42 Q40 68 15 42 L15 22 Z" fill="#4FD1C5" stroke="#2D3748" strokeWidth="2" />
          <rect x="28" y="32" width="24" height="16" rx="3" fill="white" stroke="#2D3748" strokeWidth="1.5" />
          <circle cx="40" cy="40" r="4" fill="#2D3748" />
        </svg>
      )
    case 'template':
      return (
        <svg {...props}>
          <rect x="15" y="15" width="50" height="50" rx="8" fill="white" stroke="#FF6B4A" strokeWidth="2" />
          <text x="22" y="38" fontSize="11" fill="#FF6B4A" fontFamily="monospace">{'{{x}}'}</text>
          <text x="22" y="52" fontSize="11" fill="#4FD1C5" fontFamily="monospace">{'{{y}}'}</text>
          <rect x="48" y="48" width="20" height="20" rx="4" fill="#F6AD55" stroke="#2D3748" strokeWidth="1.5" />
        </svg>
      )
    default:
      return null
  }
}

export function GiftBoxIllustration({ highlight }: { highlight?: boolean }) {
  return (
    <svg viewBox="0 0 100 80" fill="none" className="illo-gift-svg" aria-hidden>
      <rect x="15" y="30" width="70" height="45" rx="6" fill={highlight ? '#FF6B4A' : 'white'} stroke="#2D3748" strokeWidth="2" />
      <rect x="10" y="22" width="80" height="14" rx="4" fill={highlight ? '#FF8A6B' : '#FFF0EC'} stroke="#2D3748" strokeWidth="2" />
      <line x1="50" y1="22" x2="50" y2="75" stroke="#2D3748" strokeWidth="2" />
      <line x1="15" y1="45" x2="85" y2="45" stroke="#2D3748" strokeWidth="1.5" opacity="0.3" />
      {highlight && (
        <path d="M50 5 L54 15 L65 15 L56 22 L60 33 L50 26 L40 33 L44 22 L35 15 L46 15 Z" fill="#F6AD55" stroke="#2D3748" strokeWidth="1" />
      )}
    </svg>
  )
}

export function WorkflowIllustration() {
  return (
    <svg viewBox="0 0 600 80" fill="none" className="illo-workflow-svg" aria-hidden>
      {['扫描', '分诊', '编辑', '检查', '复制'].map((label, i) => (
        <g key={label} transform={`translate(${i * 130}, 0)`}>
          <circle cx="40" cy="40" r="32" fill={['#FFF0EC', '#E6FFFA', '#FFFAF0', '#FFF5F5', '#F0FFF4'][i]} stroke="#2D3748" strokeWidth="2" />
          <text x="40" y="45" textAnchor="middle" fontSize="13" fill="#2D3748" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="600">{label}</text>
          {i < 4 && (
            <path d={`M78 40 L120 40`} stroke="#2D3748" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#arrow)" />
          )}
        </g>
      ))}
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="#2D3748" />
        </marker>
      </defs>
    </svg>
  )
}

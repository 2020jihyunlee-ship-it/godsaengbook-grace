import React from 'react'

interface PageCoverProps {
  eventName: string
  category: string
  authorName: string | null
  datesStart: string | null
  datesEnd: string | null
  participantName: string
  coverPhotoUrl: string | null
  compact?: boolean
}

type Season = 'spring' | 'summer' | 'autumn' | 'winter' | null

// ── 계절 감지 ─────────────────────────────────────────────────────
function detectSeason(datesStart: string | null, eventName: string): Season {
  // 1. 날짜 기준
  if (datesStart) {
    const month = new Date(datesStart).getMonth() + 1 // 1~12
    if (month >= 3 && month <= 5)  return 'spring'
    if (month >= 6 && month <= 8)  return 'summer'
    if (month >= 9 && month <= 11) return 'autumn'
    return 'winter'
  }
  // 2. 이름 키워드 기준
  if (/여름|summer/i.test(eventName)) return 'summer'
  if (/겨울|winter/i.test(eventName)) return 'winter'
  if (/봄|spring/i.test(eventName))   return 'spring'
  if (/가을|autumn|fall/i.test(eventName)) return 'autumn'
  return null
}

// ── 계절 장식 SVG ─────────────────────────────────────────────────
function Fireflies() {
  // 여름 밤 — 반딧불 (따뜻한 황금빛 점 + 글로우 링)
  const pts = Array.from({ length: 20 }, (_, i) => ({
    x: ((i * 137.5 + 17) % 100).toFixed(1),
    y: ((i * 93.7 + 31) % 100).toFixed(1),
    r: i % 4 === 0 ? 1.8 : i % 3 === 0 ? 1.2 : 0.8,
    glow: i % 3 === 0,
  }))
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
      {/* 하단 캠프파이어 글로우 */}
      <radialGradient id="fireGlow" cx="50%" cy="100%" r="40%">
        <stop offset="0%" stopColor="#FF8C20" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#FF8C20" stopOpacity="0" />
      </radialGradient>
      <rect x="0" y="0" width="100" height="100" fill="url(#fireGlow)" />
      {/* 반딧불 */}
      {pts.map((p, i) => (
        <g key={i}>
          {p.glow && <circle cx={p.x} cy={p.y} r={Number(p.r) * 3.5} fill="#FFD060" opacity="0.08" />}
          <circle cx={p.x} cy={p.y} r={p.r} fill="#FFD060" opacity={p.glow ? 0.9 : 0.55} />
        </g>
      ))}
    </svg>
  )
}

function WinterStars() {
  // 겨울 — 차가운 흰 별 + 큰 별 2개
  const pts = Array.from({ length: 28 }, (_, i) => ({
    x: ((i * 137.5 + 17) % 100).toFixed(1),
    y: ((i * 93.7 + 31) % 100).toFixed(1),
    r: i % 4 === 0 ? 1.4 : i % 3 === 0 ? 1.0 : 0.7,
    op: i % 5 === 0 ? 0.85 : i % 3 === 0 ? 0.55 : 0.35,
  }))
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="white" opacity={p.op} />
      ))}
      <polygon points="20,12 21.5,16.5 26,16.5 22.5,19.5 24,24 20,21 16,24 17.5,19.5 14,16.5 18.5,16.5"
        fill="white" opacity="0.55" transform="scale(0.3) translate(40,22)" />
      <polygon points="80,8 81.2,12 85,12 82,14.5 83.2,18.5 80,16 76.8,18.5 78,14.5 75,12 78.8,12"
        fill="white" opacity="0.4" transform="scale(0.28) translate(208,10)" />
    </svg>
  )
}

function Petals() {
  // 봄 — 흩날리는 꽃잎
  const petals = Array.from({ length: 16 }, (_, i) => ({
    x: ((i * 137.5 + 17) % 100).toFixed(1),
    y: ((i * 93.7 + 31) % 100).toFixed(1),
    rot: (i * 47) % 360,
    rx: i % 3 === 0 ? 3.5 : 2.5,
    ry: i % 3 === 0 ? 1.8 : 1.2,
    op: i % 4 === 0 ? 0.7 : 0.45,
  }))
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none', opacity: 0.55 }}>
      {petals.map((p, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx={p.rx} ry={p.ry}
          fill="#FFBAD0" opacity={p.op}
          transform={`rotate(${p.rot} ${p.x} ${p.y})`} />
      ))}
    </svg>
  )
}

function AutumnLeaves() {
  // 가을 — 낙엽 (작은 단풍 모양)
  const leaves = Array.from({ length: 14 }, (_, i) => ({
    x: Number(((i * 137.5 + 17) % 100).toFixed(1)),
    y: Number(((i * 93.7 + 31) % 100).toFixed(1)),
    rot: (i * 53) % 360,
    s: i % 3 === 0 ? 1.4 : 1.0,
    op: i % 4 === 0 ? 0.75 : 0.45,
    col: i % 3 === 0 ? '#E8652A' : i % 3 === 1 ? '#D4A020' : '#C84818',
  }))
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none', opacity: 0.5 }}>
      {leaves.map((p, i) => (
        <g key={i} transform={`translate(${p.x},${p.y}) rotate(${p.rot}) scale(${p.s})`}>
          {/* 단순화된 잎 모양 */}
          <path d="M0,-4 C2,-2 4,0 0,4 C-4,0 -2,-2 0,-4 Z"
            fill={p.col} opacity={p.op} />
          <line x1="0" y1="-3" x2="0" y2="3" stroke={p.col} strokeWidth="0.4" opacity={p.op * 0.6} />
        </g>
      ))}
    </svg>
  )
}

// ── 기존 카테고리별 장식 ──────────────────────────────────────────
function CrossGlobe() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none', opacity: 0.13 }}>
      <circle cx="78" cy="22" r="28" fill="none" stroke="#E08C3C" strokeWidth="0.8" />
      <ellipse cx="78" cy="22" rx="14" ry="28" fill="none" stroke="#E08C3C" strokeWidth="0.6" />
      <line x1="50" y1="22" x2="106" y2="22" stroke="#E08C3C" strokeWidth="0.6" />
      <line x1="18" y1="62" x2="18" y2="88" stroke="#E08C3C" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="10" y1="70" x2="26" y2="70" stroke="#E08C3C" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function Leaves() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none', opacity: 0.18 }}>
      <line x1="50" y1="110" x2="50" y2="40" stroke="#7AB648" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="50" y1="75" x2="25" y2="55" stroke="#7AB648" strokeWidth="0.9" strokeLinecap="round" />
      <line x1="50" y1="62" x2="72" y2="45" stroke="#7AB648" strokeWidth="0.9" strokeLinecap="round" />
      <line x1="50" y1="50" x2="32" y2="36" stroke="#7AB648" strokeWidth="0.7" strokeLinecap="round" />
      <ellipse cx="22" cy="52" rx="8" ry="5" fill="#7AB648" opacity="0.7" transform="rotate(-30 22 52)" />
      <ellipse cx="74" cy="42" rx="8" ry="5" fill="#7AB648" opacity="0.6" transform="rotate(20 74 42)" />
      <ellipse cx="30" cy="33" rx="6" ry="4" fill="#7AB648" opacity="0.5" transform="rotate(-40 30 33)" />
      <circle cx="85" cy="70" r="1.2" fill="#7AB648" opacity="0.4" />
      <circle cx="10" cy="80" r="1.5" fill="#7AB648" opacity="0.3" />
    </svg>
  )
}

function LightRays() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none', opacity: 0.12 }}>
      {[0, 20, 40, 60, 80, 100, 120, 140, 160].map((deg, i) => (
        <line key={i} x1="50" y1="-10"
          x2={50 + Math.sin((deg * Math.PI) / 180) * 120}
          y2={-10 + Math.cos((deg * Math.PI) / 180) * 120}
          stroke="#C9A84C" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
      ))}
      <line x1="50" y1="30" x2="50" y2="60" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <line x1="40" y1="40" x2="60" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

function ConnectionDots() {
  const nodes = [
    { cx: 50, cy: 30 }, { cx: 25, cy: 55 }, { cx: 75, cy: 55 },
    { cx: 35, cy: 80 }, { cx: 65, cy: 80 }, { cx: 50, cy: 75 },
    { cx: 18, cy: 35 }, { cx: 82, cy: 35 },
  ]
  const edges = [[0,1],[0,2],[1,3],[2,4],[1,5],[2,5],[0,6],[0,7],[5,3],[5,4]]
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none', opacity: 0.15 }}>
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a].cx} y1={nodes[a].cy}
          x2={nodes[b].cx} y2={nodes[b].cy}
          stroke="#D4882C" strokeWidth="0.7" opacity="0.8" />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.cx} cy={n.cy} r={i === 0 ? 2.5 : 1.8}
          fill="#D4882C" opacity={i === 0 ? 0.9 : 0.65} />
      ))}
    </svg>
  )
}

function InkLines() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none', opacity: 0.12 }}>
      {[30, 42, 54, 66, 78].map((y, i) => (
        <line key={i} x1="14" y1={y} x2="86" y2={y}
          stroke="#8892C8" strokeWidth="0.7" opacity="0.6" />
      ))}
      <line x1="22" y1="24" x2="22" y2="92" stroke="#C9A84C" strokeWidth="0.8" opacity="0.5" />
      <path d="M70 18 L80 10 L84 14 L74 24 Z" fill="#8892C8" opacity="0.5" />
      <line x1="70" y1="18" x2="66" y2="28" stroke="#8892C8" strokeWidth="0.8" opacity="0.5" />
    </svg>
  )
}

// ── 테마 정의 ─────────────────────────────────────────────────────
interface CategoryTheme {
  bg: string
  accent: string
  accentSolid: string
  decoration: React.ReactNode
}

function getCategoryTheme(category: string, season: Season): CategoryTheme {
  // 수련회 — 계절별 분기
  if (category === '수련회') {
    if (season === 'summer') return {
      bg: 'linear-gradient(160deg, #040E08 0%, #071A10 50%, #040E08 100%)',
      accent: 'rgba(255,208,80,0.85)',
      accentSolid: 'rgba(255,208,80,0.45)',
      decoration: <Fireflies />,
    }
    if (season === 'spring') return {
      bg: 'linear-gradient(160deg, #140A18 0%, #241030 50%, #140A18 100%)',
      accent: 'rgba(255,180,210,0.85)',
      accentSolid: 'rgba(255,180,210,0.45)',
      decoration: <Petals />,
    }
    if (season === 'autumn') return {
      bg: 'linear-gradient(160deg, #120600 0%, #261000 50%, #120600 100%)',
      accent: 'rgba(220,130,40,0.9)',
      accentSolid: 'rgba(220,130,40,0.5)',
      decoration: <AutumnLeaves />,
    }
    // 겨울 or null → 기본 (차가운 별밤)
    return {
      bg: 'linear-gradient(160deg, #06101E 0%, #0C1B3A 50%, #06101E 100%)',
      accent: 'rgba(180,210,255,0.75)',
      accentSolid: 'rgba(180,210,255,0.4)',
      decoration: <WinterStars />,
    }
  }

  // 캠프 — 계절별 분기
  if (category === '캠프') {
    if (season === 'summer') return {
      bg: 'linear-gradient(160deg, #041008 0%, #082010 50%, #041008 100%)',
      accent: 'rgba(130,220,90,0.85)',
      accentSolid: 'rgba(130,220,90,0.4)',
      decoration: <Fireflies />,
    }
    if (season === 'spring') return {
      bg: 'linear-gradient(160deg, #071408 0%, #122A14 50%, #071408 100%)',
      accent: 'rgba(160,230,120,0.85)',
      accentSolid: 'rgba(160,230,120,0.4)',
      decoration: <Petals />,
    }
    if (season === 'autumn') return {
      bg: 'linear-gradient(160deg, #100800 0%, #221400 50%, #100800 100%)',
      accent: 'rgba(200,140,40,0.85)',
      accentSolid: 'rgba(200,140,40,0.4)',
      decoration: <AutumnLeaves />,
    }
    // 겨울 or null
    return {
      bg: 'linear-gradient(160deg, #071408 0%, #122A14 50%, #071408 100%)',
      accent: 'rgba(130,196,88,0.8)',
      accentSolid: 'rgba(130,196,88,0.4)',
      decoration: <Leaves />,
    }
  }

  // 나머지 카테고리는 계절 무관
  if (category === '선교') return {
    bg: 'linear-gradient(160deg, #1A0800 0%, #3D1600 50%, #1A0800 100%)',
    accent: 'rgba(224,140,60,0.8)',
    accentSolid: 'rgba(224,140,60,0.45)',
    decoration: <CrossGlobe />,
  }
  if (category === '예배') return {
    bg: 'linear-gradient(160deg, #0E0618 0%, #1E0A30 50%, #0E0618 100%)',
    accent: 'rgba(210,180,255,0.8)',
    accentSolid: 'rgba(210,180,255,0.4)',
    decoration: <LightRays />,
  }
  if (category === '모임') return {
    bg: 'linear-gradient(160deg, #140A02 0%, #2E1608 50%, #140A02 100%)',
    accent: 'rgba(212,136,44,0.8)',
    accentSolid: 'rgba(212,136,44,0.4)',
    decoration: <ConnectionDots />,
  }
  // 개인
  return {
    bg: 'linear-gradient(160deg, #060A18 0%, #0E1530 50%, #060A18 100%)',
    accent: 'rgba(160,175,230,0.75)',
    accentSolid: 'rgba(160,175,230,0.4)',
    decoration: <InkLines />,
  }
}

const CATEGORY_ICON: Record<string, string> = {
  '수련회': '⛺', '선교': '✈️', '캠프': '🌿',
  '예배': '🕊️', '모임': '🤝', '개인': '📖',
}

const PageCover = React.forwardRef<HTMLDivElement, PageCoverProps>(
  ({ eventName, category, authorName, datesStart, datesEnd, participantName, coverPhotoUrl, compact }, ref) => {
    const dateStr = datesStart
      ? datesEnd && datesEnd !== datesStart
        ? `${datesStart} — ${datesEnd}`
        : datesStart
      : null

    const season = detectSeason(datesStart, eventName)
    const theme = getCategoryTheme(category, season)
    const icon = CATEGORY_ICON[category] ?? '📌'

    return (
      <div ref={ref} className="relative w-full h-full overflow-hidden select-none">

        {/* 배경 */}
        {coverPhotoUrl ? (
          <>
            <img src={coverPhotoUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.72) 100%)' }} />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: theme.bg }} />
        )}

        {/* 카테고리+계절 장식 (사진 없을 때만) */}
        {!coverPhotoUrl && theme.decoration}

        {/* 콘텐츠 */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center"
          style={{ padding: compact ? '28px 24px' : '40px 36px' }}>

          {/* 카테고리 아이콘 */}
          <div style={{
            fontSize: compact ? '22px' : '28px',
            marginBottom: compact ? '10px' : '14px',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
          }}>
            {icon}
          </div>

          {/* 로고 */}
          <p style={{
            fontSize: compact ? '7px' : '8.5px',
            color: theme.accent,
            letterSpacing: '0.2em',
            marginBottom: compact ? '12px' : '18px',
            textTransform: 'uppercase',
          }}>
            God-Saeng Book
          </p>

          {/* 세로 구분선 */}
          <div style={{
            width: '1px',
            height: compact ? '18px' : '26px',
            backgroundColor: theme.accentSolid,
            marginBottom: compact ? '12px' : '18px',
          }} />

          {/* 이벤트 이름 */}
          <h1 style={{
            fontFamily: "'Noto Serif KR', serif",
            fontSize: compact ? '17px' : '23px',
            fontWeight: 500,
            color: '#fff',
            lineHeight: 1.35,
            textAlign: 'center',
            marginBottom: compact ? '5px' : '7px',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}>
            {eventName}
          </h1>

          {/* 참여자 이름 */}
          <p style={{
            fontFamily: "'Noto Serif KR', serif",
            fontSize: compact ? '11px' : '11.5px',
            color: 'rgba(255,255,255,0.62)',
            textAlign: 'center',
            lineHeight: 1.6,
            marginBottom: compact ? '12px' : '18px',
          }}>
            {participantName}
          </p>

          {/* 가로 구분선 */}
          <div style={{
            width: compact ? '28px' : '36px',
            height: '0.5px',
            backgroundColor: theme.accentSolid,
            marginBottom: compact ? '10px' : '14px',
          }} />

          {/* 날짜 + 단체명 + 카테고리 */}
          <div style={{
            fontSize: compact ? '9px' : '10px',
            color: 'rgba(255,255,255,0.38)',
            textAlign: 'center',
            letterSpacing: '0.06em',
            lineHeight: 1.8,
          }}>
            {dateStr && <p>{dateStr}</p>}
            {authorName && <p>{authorName}</p>}
            {category && <p>{category}</p>}
          </div>

          {/* 워터마크 */}
          <p style={{
            position: 'absolute',
            bottom: compact ? '12px' : '16px',
            fontSize: compact ? '7px' : '8px',
            color: 'rgba(255,255,255,0.12)',
            letterSpacing: '0.1em',
          }}>
            MEMORY BOOK
          </p>
        </div>
      </div>
    )
  }
)
PageCover.displayName = 'PageCover'
export default PageCover

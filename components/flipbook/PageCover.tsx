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

// ── 카테고리별 테마 정의 ──────────────────────────────────────────
interface CategoryTheme {
  bg: string          // 배경 그라디언트
  accent: string      // 포인트 색상 (rgba)
  accentSolid: string // 구분선용 (약간 연하게)
  decoration: React.ReactNode  // SVG 장식
}

function Stars({ n = 28 }: { n?: number }) {
  // 별밤: 작은 점들을 랜덤 위치에 (deterministic)
  const pts = Array.from({ length: n }, (_, i) => {
    const x = ((i * 137.5 + 17) % 100).toFixed(1)
    const y = ((i * 93.7 + 31) % 100).toFixed(1)
    const r = i % 4 === 0 ? 1.4 : i % 3 === 0 ? 1.0 : 0.7
    const op = i % 5 === 0 ? 0.85 : i % 3 === 0 ? 0.55 : 0.35
    return { x, y, r, op }
  })
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="white" opacity={p.op} />
      ))}
      {/* 큰 별 2개 */}
      <polygon points="20,12 21.5,16.5 26,16.5 22.5,19.5 24,24 20,21 16,24 17.5,19.5 14,16.5 18.5,16.5"
        fill="white" opacity="0.55" transform="scale(0.3) translate(40,22)" />
      <polygon points="80,8 81.2,12 85,12 82,14.5 83.2,18.5 80,16 76.8,18.5 78,14.5 75,12 78.8,12"
        fill="white" opacity="0.4" transform="scale(0.28) translate(208,10)" />
    </svg>
  )
}

function CrossGlobe() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none', opacity: 0.13 }}>
      {/* 지구 원 */}
      <circle cx="78" cy="22" r="28" fill="none" stroke="#E08C3C" strokeWidth="0.8" />
      <ellipse cx="78" cy="22" rx="14" ry="28" fill="none" stroke="#E08C3C" strokeWidth="0.6" />
      <line x1="50" y1="22" x2="106" y2="22" stroke="#E08C3C" strokeWidth="0.6" />
      {/* 십자가 */}
      <line x1="18" y1="62" x2="18" y2="88" stroke="#E08C3C" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="10" y1="70" x2="26" y2="70" stroke="#E08C3C" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function Leaves() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none', opacity: 0.18 }}>
      {/* 나뭇가지 */}
      <line x1="50" y1="110" x2="50" y2="40" stroke="#7AB648" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="50" y1="75" x2="25" y2="55" stroke="#7AB648" strokeWidth="0.9" strokeLinecap="round" />
      <line x1="50" y1="62" x2="72" y2="45" stroke="#7AB648" strokeWidth="0.9" strokeLinecap="round" />
      <line x1="50" y1="50" x2="32" y2="36" stroke="#7AB648" strokeWidth="0.7" strokeLinecap="round" />
      {/* 잎 */}
      <ellipse cx="22" cy="52" rx="8" ry="5" fill="#7AB648" opacity="0.7" transform="rotate(-30 22 52)" />
      <ellipse cx="74" cy="42" rx="8" ry="5" fill="#7AB648" opacity="0.6" transform="rotate(20 74 42)" />
      <ellipse cx="30" cy="33" rx="6" ry="4" fill="#7AB648" opacity="0.5" transform="rotate(-40 30 33)" />
      {/* 작은 점 이슬 */}
      <circle cx="85" cy="70" r="1.2" fill="#7AB648" opacity="0.4" />
      <circle cx="10" cy="80" r="1.5" fill="#7AB648" opacity="0.3" />
      <circle cx="92" cy="88" r="1" fill="#7AB648" opacity="0.4" />
    </svg>
  )
}

function LightRays() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none', opacity: 0.12 }}>
      {/* 빛살 방사형 (중앙 상단에서) */}
      {[0, 20, 40, 60, 80, 100, 120, 140, 160].map((deg, i) => (
        <line
          key={i}
          x1="50" y1="-10"
          x2={50 + Math.sin((deg * Math.PI) / 180) * 120}
          y2={-10 + Math.cos((deg * Math.PI) / 180) * 120}
          stroke="#C9A84C" strokeWidth="6"
          strokeLinecap="round"
          opacity="0.5"
        />
      ))}
      {/* 십자가 (중앙) */}
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
      {/* 펜 줄 (노트 선) */}
      {[30, 42, 54, 66, 78].map((y, i) => (
        <line key={i} x1="14" y1={y} x2="86" y2={y}
          stroke="#8892C8" strokeWidth="0.7" opacity="0.6" />
      ))}
      {/* 왼쪽 여백 수직선 */}
      <line x1="22" y1="24" x2="22" y2="92" stroke="#C9A84C" strokeWidth="0.8" opacity="0.5" />
      {/* 펜 모양 */}
      <path d="M70 18 L80 10 L84 14 L74 24 Z" fill="#8892C8" opacity="0.5" />
      <line x1="70" y1="18" x2="66" y2="28" stroke="#8892C8" strokeWidth="0.8" opacity="0.5" />
    </svg>
  )
}

function getCategoryTheme(category: string): CategoryTheme {
  if (category === '수련회') return {
    bg: 'linear-gradient(160deg, #06101E 0%, #0C1B3A 50%, #06101E 100%)',
    accent: 'rgba(180,210,255,0.75)',
    accentSolid: 'rgba(180,210,255,0.4)',
    decoration: <Stars />,
  }
  if (category === '선교') return {
    bg: 'linear-gradient(160deg, #1A0800 0%, #3D1600 50%, #1A0800 100%)',
    accent: 'rgba(224,140,60,0.8)',
    accentSolid: 'rgba(224,140,60,0.45)',
    decoration: <CrossGlobe />,
  }
  if (category === '캠프') return {
    bg: 'linear-gradient(160deg, #071408 0%, #122A14 50%, #071408 100%)',
    accent: 'rgba(130,196,88,0.8)',
    accentSolid: 'rgba(130,196,88,0.4)',
    decoration: <Leaves />,
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
  // 개인 (기본값)
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

    const theme = getCategoryTheme(category)
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

        {/* 카테고리별 장식 (사진 없을 때만) */}
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

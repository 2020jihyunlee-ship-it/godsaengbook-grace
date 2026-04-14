import React from 'react'

interface PagePhotoLeftProps {
  photoUrl: string | null
  photoUrls?: string[]
  caption: string
  pageNum: number
  category?: string
  date?: string | null
}

function getCategoryAccent(category?: string): string {
  if (category === '수련회') return '#7BA8D4'
  if (category === '선교')   return '#C07838'
  if (category === '캠프')   return '#6BAA3A'
  if (category === '예배')   return '#9B6FD0'
  if (category === '모임')   return '#C07828'
  return '#C9A84C'
}

function getCategoryLabel(category?: string): string {
  if (!category) return 'GRACE'
  if (['선교', '해외탐방'].some(k => category.includes(k))) return 'MISSION'
  if (category.includes('수련회')) return 'RETREAT'
  if (category.includes('캠프')) return 'CAMP'
  if (category.includes('예배')) return 'WORSHIP'
  if (category.includes('모임')) return 'MEETING'
  return category.toUpperCase()
}

/** 코너 마크 — 사진 프레임 4개 코너 */
function CornerMarks({ size = 10, color = '#C9A84C', opacity = 0.7 }: { size?: number; color?: string; opacity?: number }) {
  const s = `${size}px`
  const shared: React.CSSProperties = { position: 'absolute', width: s, height: s, opacity }
  return (
    <>
      <div style={{ ...shared, top: -1, left: -1, borderTop: `1.5px solid ${color}`, borderLeft: `1.5px solid ${color}` }} />
      <div style={{ ...shared, top: -1, right: -1, borderTop: `1.5px solid ${color}`, borderRight: `1.5px solid ${color}` }} />
      <div style={{ ...shared, bottom: -1, left: -1, borderBottom: `1.5px solid ${color}`, borderLeft: `1.5px solid ${color}` }} />
      <div style={{ ...shared, bottom: -1, right: -1, borderBottom: `1.5px solid ${color}`, borderRight: `1.5px solid ${color}` }} />
    </>
  )
}

const PagePhotoLeft = React.forwardRef<HTMLDivElement, PagePhotoLeftProps>(
  ({ photoUrl, photoUrls, caption, pageNum, category, date }, ref) => {
    const allPhotos: string[] = photoUrls && photoUrls.length > 0
      ? photoUrls
      : photoUrl ? [photoUrl] : []
    const count = allPhotos.length
    const accent = getCategoryAccent(category)
    const label = getCategoryLabel(category)

    return (
      <div
        ref={ref}
        className="w-full h-full select-none"
        style={{ backgroundColor: '#F5EFE4', position: 'relative', overflow: 'hidden' }}
      >
        {/* 종이 질감 */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.04 }}>
          <filter id="photoNoise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#photoNoise)" />
        </svg>

        {/* 책등 */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 6,
          background: 'linear-gradient(90deg, rgba(0,0,0,0.18) 0%, rgba(255,255,255,0.04) 60%, rgba(0,0,0,0.08) 100%)',
        }} />

        {/* 페이지 레이아웃 */}
        <div style={{
          position: 'absolute', inset: 0,
          padding: '22px 22px 18px 28px',
          display: 'flex',
          flexDirection: 'column',
        }}>

          {/* 상단 — 카테고리 라벨 + 날짜 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 16, height: 1.5, backgroundColor: accent, opacity: 0.7 }} />
              <span style={{
                fontSize: 8,
                color: accent,
                letterSpacing: '0.2em',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
              }}>
                {label}
              </span>
            </div>
            {date && (
              <span style={{ fontSize: 8, color: '#B0A090', letterSpacing: '0.06em' }}>
                {date}
              </span>
            )}
          </div>

          {/* 사진 프레임 — 2/3 영역, 중앙 */}
          <div style={{
            flex: '0 0 63%',
            position: 'relative',
            alignSelf: 'center',
            width: '88%',
            transform: 'rotate(-1deg)',
            padding: 5,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 3px 18px rgba(0,0,0,0.13), 0 1px 6px rgba(0,0,0,0.07)',
          }}>
            {count > 0 ? (
              <>
                {/* 사진 */}
                {count === 1 ? (
                  <img
                    src={allPhotos[0]}
                    alt={caption}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'grayscale(0.15) sepia(0.08)' }}
                  />
                ) : count === 2 ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ flex: '0 0 62%', overflow: 'hidden' }}>
                      <img src={allPhotos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'grayscale(0.15) sepia(0.08)' }} />
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <img src={allPhotos[1]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'grayscale(0.15) sepia(0.08)' }} />
                    </div>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ flex: '0 0 58%', overflow: 'hidden' }}>
                      <img src={allPhotos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'grayscale(0.15) sepia(0.08)' }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', gap: 2 }}>
                      <img src={allPhotos[1]} alt="" style={{ flex: 1, objectFit: 'cover', display: 'block', minWidth: 0, filter: 'grayscale(0.15) sepia(0.08)' }} />
                      <img src={allPhotos[2]} alt="" style={{ flex: 1, objectFit: 'cover', display: 'block', minWidth: 0, filter: 'grayscale(0.15) sepia(0.08)' }} />
                    </div>
                  </div>
                )}
                {/* 코너 마크 */}
                <CornerMarks color={accent} size={9} opacity={0.65} />
                {/* 얇은 이너 테두리 */}
                <div style={{
                  position: 'absolute', inset: 0,
                  border: '1px solid rgba(0,0,0,0.06)',
                  pointerEvents: 'none',
                }} />
              </>
            ) : (
              /* 사진 없을 때 — 빈 프레임 */
              <div style={{
                width: '100%', height: '100%',
                border: `1px dashed ${accent}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: `${accent}08`,
                position: 'relative',
              }}>
                <CornerMarks color={accent} size={9} opacity={0.45} />
                <span style={{ fontSize: 24, opacity: 0.2 }}>📷</span>
              </div>
            )}
          </div>

          {/* 하단 — 구분선 + 캡션 + 페이지 번호 */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            paddingTop: 10,
          }}>
            {/* 구분선 */}
            <div style={{
              width: '88%',
              alignSelf: 'center',
              height: '0.5px',
              backgroundColor: '#C9B890',
              opacity: 0.35,
              marginBottom: 10,
            }} />

            {/* 캡션 + 페이지 번호 */}
            <div style={{
              width: '88%',
              alignSelf: 'center',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 8,
            }}>
              <span style={{
                fontFamily: "'Gowun Batang', serif",
                fontSize: 11,
                color: '#3D2B1F',
                lineHeight: 1.5,
                wordBreak: 'keep-all',
                flex: 1,
              }}>
                {caption}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                <span style={{ fontSize: 8, color: '#C9B890', lineHeight: 1 }}>~</span>
                <span style={{ fontSize: 9, color: '#C9B890', letterSpacing: '0.06em', lineHeight: 1 }}>
                  {String(pageNum).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    )
  }
)
PagePhotoLeft.displayName = 'PagePhotoLeft'
export default PagePhotoLeft

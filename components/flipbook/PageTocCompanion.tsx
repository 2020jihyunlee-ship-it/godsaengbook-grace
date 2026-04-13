import React from 'react'

interface PageTocCompanionProps {
  photoUrl?: string | null
  eventName: string
  category?: string
  datesStart?: string | null
  datesEnd?: string | null
}

function formatDateRange(start?: string | null, end?: string | null) {
  if (!start) return ''
  const s = new Date(start)
  const fmt = (d: Date) => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  if (!end || end === start) return fmt(s)
  return `${fmt(s)} — ${fmt(new Date(end))}`
}

function getAccentColor(category?: string) {
  if (category && ['선교', '해외탐방'].some(k => category.includes(k))) return '#C07838'
  return '#C9A84C'
}

const PageTocCompanion = React.forwardRef<HTMLDivElement, PageTocCompanionProps>(
  ({ photoUrl, eventName, category, datesStart, datesEnd }, ref) => {
    const accent = getAccentColor(category)
    const dateStr = formatDateRange(datesStart, datesEnd)

    if (photoUrl) {
      return (
        <div ref={ref} className="relative w-full h-full overflow-hidden select-none">
          <img src={photoUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.75) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 28px' }}>
            {category && (
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.16em', marginBottom: '6px' }}>
                {category.toUpperCase()}
              </div>
            )}
            <div style={{
              fontFamily: "'Gowun Batang', serif",
              fontSize: '16px', fontWeight: 500,
              color: '#fff',
              lineHeight: 1.4,
              wordBreak: 'keep-all',
            }}>
              {eventName}
            </div>
            {dateStr && (
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', marginTop: '6px', letterSpacing: '0.06em' }}>
                {dateStr}
              </div>
            )}
          </div>
        </div>
      )
    }

    // 사진 없는 경우 — 디자인 페이지
    return (
      <div
        ref={ref}
        className="w-full h-full select-none"
        style={{
          background: 'linear-gradient(160deg, #FAF7F2 0%, #F2EBE0 100%)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 배경 장식 — 큰 원 */}
        <div style={{
          position: 'absolute',
          top: '-15%', right: '-20%',
          width: '70%', height: '70%',
          borderRadius: '50%',
          border: `1px solid ${accent}22`,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20%', left: '-15%',
          width: '60%', height: '60%',
          borderRadius: '50%',
          border: `1px solid ${accent}18`,
          pointerEvents: 'none',
        }} />

        {/* 상단 장식 선 */}
        <div style={{ width: '40px', height: '1px', backgroundColor: accent, opacity: 0.5, marginBottom: '20px' }} />

        {/* 카테고리 */}
        {category && (
          <div style={{
            fontSize: '9px',
            color: accent,
            letterSpacing: '0.2em',
            marginBottom: '18px',
            opacity: 0.8,
          }}>
            {category.toUpperCase()}
          </div>
        )}

        {/* 이벤트명 */}
        <div style={{
          fontFamily: "'Gowun Batang', serif",
          fontSize: '18px',
          fontWeight: 500,
          color: '#2A1F14',
          lineHeight: 1.5,
          textAlign: 'center',
          padding: '0 28px',
          wordBreak: 'keep-all',
        }}>
          {eventName}
        </div>

        {/* 날짜 */}
        {dateStr && (
          <div style={{
            fontSize: '10px',
            color: '#9A8060',
            marginTop: '14px',
            letterSpacing: '0.08em',
          }}>
            {dateStr}
          </div>
        )}

        {/* 하단 장식 */}
        <div style={{ width: '40px', height: '1px', backgroundColor: accent, opacity: 0.5, marginTop: '20px' }} />

        {/* 하단 브랜딩 */}
        <div style={{
          position: 'absolute',
          bottom: '18px',
          fontSize: '9px',
          color: '#BBB',
          letterSpacing: '0.12em',
        }}>
          갓생북 은혜
        </div>
      </div>
    )
  }
)
PageTocCompanion.displayName = 'PageTocCompanion'
export default PageTocCompanion

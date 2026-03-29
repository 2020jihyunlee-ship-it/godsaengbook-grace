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

function getCoverGradient(category: string) {
  if (['선교', '해외탐방'].some(k => category.includes(k)))
    return 'linear-gradient(150deg, #2A1000 0%, #4A1800 55%, #1E1000 100%)'
  if (['수련회', '캠프'].some(k => category.includes(k)))
    return 'linear-gradient(150deg, #12203A 0%, #1E1040 55%, #0E2840 100%)'
  if (category.includes('여행'))
    return 'linear-gradient(150deg, #0E2010 0%, #1A3820 55%, #0A1A0A 100%)'
  return 'linear-gradient(150deg, #12203A 0%, #1E1040 55%, #0E2840 100%)'
}

function getAccentColor(category: string) {
  if (['선교', '해외탐방'].some(k => category.includes(k))) return 'rgba(220,140,60,0.7)'
  return 'rgba(200,168,75,0.7)'
}

const PageCover = React.forwardRef<HTMLDivElement, PageCoverProps>(
  ({ eventName, category, authorName, datesStart, datesEnd, participantName, coverPhotoUrl, compact }, ref) => {
    const dateStr = datesStart
      ? datesEnd && datesEnd !== datesStart
        ? `${datesStart} — ${datesEnd}`
        : datesStart
      : null
    const accentClr = getAccentColor(category)
    const accentSolid = accentClr.replace(/[\d.]+\)$/, '0.5)')

    return (
      <div ref={ref} className="relative w-full h-full overflow-hidden select-none">
        {/* 배경 */}
        {coverPhotoUrl ? (
          <>
            <img src={coverPhotoUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.72) 100%)' }} />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: getCoverGradient(category) }} />
        )}

        {/* 콘텐츠 */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center"
          style={{ padding: compact ? '28px 24px' : '40px 36px' }}>

          {/* 로고 */}
          <p style={{ fontSize: compact ? '8px' : '9px', color: accentClr, letterSpacing: '0.18em', marginBottom: compact ? '16px' : '24px' }}>
            GOD-SAENG BOOK
          </p>

          {/* 세로 구분선 */}
          <div style={{ width: '1px', height: compact ? '20px' : '28px', backgroundColor: accentSolid, marginBottom: compact ? '14px' : '20px' }} />

          {/* 이벤트 이름 */}
          <h1 style={{
            fontFamily: "'Noto Serif KR', serif",
            fontSize: compact ? '18px' : '24px',
            fontWeight: 500,
            color: '#fff',
            lineHeight: 1.35,
            textAlign: 'center',
            marginBottom: compact ? '6px' : '8px',
          }}>
            {eventName}
          </h1>

          {/* 참여자 이름 */}
          <p style={{
            fontFamily: "'Noto Serif KR', serif",
            fontSize: compact ? '11px' : '11.5px',
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center',
            lineHeight: 1.6,
            marginBottom: compact ? '14px' : '20px',
          }}>
            {participantName}
          </p>

          {/* 가로 구분선 */}
          <div style={{ width: compact ? '32px' : '40px', height: '0.5px', backgroundColor: accentSolid, marginBottom: compact ? '12px' : '16px' }} />

          {/* 날짜 + 단체명 */}
          <div style={{ fontSize: compact ? '9px' : '10px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', letterSpacing: '0.06em', lineHeight: 1.7 }}>
            {dateStr && <p>{dateStr}</p>}
            {authorName && <p>{authorName}</p>}
            {category && <p>{category}</p>}
          </div>

          {/* 워터마크 */}
          <p style={{
            position: 'absolute', bottom: compact ? '14px' : '18px',
            fontSize: compact ? '7px' : '8.5px',
            color: 'rgba(255,255,255,0.15)',
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

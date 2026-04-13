import React from 'react'

interface PagePhotoLeftProps {
  photoUrl: string | null
  photoUrls?: string[]
  caption: string
  pageNum: number
  category?: string
  date?: string | null
}

function getGradient(category?: string) {
  if (category && ['선교', '해외탐방'].some(k => category.includes(k)))
    return 'linear-gradient(150deg, #4A2800 0%, #8A5020 55%, #5A3010 100%)'
  if (category && ['수련회', '캠프'].some(k => category.includes(k)))
    return 'linear-gradient(150deg, #3D2B1F 0%, #6B4A30 55%, #4A3020 100%)'
  if (category && category.includes('여행'))
    return 'linear-gradient(150deg, #2A3820 0%, #4A6030 50%, #3A5028 100%)'
  return 'linear-gradient(150deg, #3D2B1F 0%, #6B4A30 55%, #4A3020 100%)'
}

function getCategoryLabel(category?: string) {
  if (!category) return ''
  if (['선교', '해외탐방'].some(k => category.includes(k))) return 'MISSION'
  if (['수련회', '캠프'].some(k => category.includes(k))) return 'RETREAT'
  if (category.includes('여행')) return 'JOURNEY'
  return category.toUpperCase()
}

function getCategoryIcon(category?: string) {
  if (category && ['선교', '해외탐방'].some(k => category.includes(k))) return '✈'
  if (category && ['수련회', '캠프'].some(k => category.includes(k))) return '🙏'
  if (category && category.includes('여행')) return '🌿'
  return '✦'
}

const PagePhotoLeft = React.forwardRef<HTMLDivElement, PagePhotoLeftProps>(
  ({ photoUrl, photoUrls, caption, pageNum, category, date }, ref) => {
    const allPhotos: string[] = photoUrls && photoUrls.length > 0
      ? photoUrls
      : photoUrl ? [photoUrl] : []
    const count = allPhotos.length

    return (
      <div ref={ref} className="w-full h-full select-none" style={{ backgroundColor: '#F0EBE3', position: 'relative', overflow: 'hidden' }}>
        {/* 오른쪽 여백 — 제본 공간 */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: '14px', bottom: 0, overflow: 'hidden' }}>
        {count === 0 ? (
          /* 사진 없을 때 — 밝은 크림 스타일 */
          <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#F5EFE4',
          }}>
            {/* 상단 날짜 */}
            <div style={{ padding: '22px 24px 0' }}>
              {date && (
                <div style={{
                  fontSize: '10px',
                  color: '#B8A878',
                  letterSpacing: '0.1em',
                }}>
                  {date}
                </div>
              )}
            </div>
            {/* 중앙 아이콘 */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: '12px',
            }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                border: '1.5px solid #D9C898',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(201,168,76,0.08)',
              }}>
                <span style={{ fontSize: '30px', lineHeight: 1 }}>{getCategoryIcon(category)}</span>
              </div>
              <div style={{
                fontSize: '9px',
                color: '#C9A84C',
                letterSpacing: '0.18em',
              }}>
                {getCategoryLabel(category)}
              </div>
            </div>
            {/* 하단 캡션 */}
            <div style={{ padding: '0 24px 20px' }}>
              <div style={{
                width: '24px', height: '1px',
                backgroundColor: '#C9A84C',
                marginBottom: '10px',
                opacity: 0.6,
              }} />
              <div style={{
                fontSize: '13px',
                color: '#3D2B1F',
                fontWeight: 500,
                letterSpacing: '0.02em',
                fontFamily: "'Noto Serif KR', serif",
                lineHeight: 1.5,
              }}>
                {caption}
              </div>
            </div>
            {/* 페이지 번호 */}
            <div style={{
              position: 'absolute', bottom: '14px', right: '16px',
              fontSize: '9px', color: '#C9A84C', opacity: 0.5, letterSpacing: '0.08em',
            }}>
              P.{String(pageNum).padStart(2, '0')}
            </div>
          </div>
        ) : count === 1 ? (
          /* 사진 1장 — 풀페이지 */
          <>
            <img src={allPhotos[0]} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.72) 100%)' }} />
            <div className="absolute" style={{ bottom: 0, left: 0, right: 0, padding: '18px 22px', zIndex: 2 }}>
              {date && (
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', marginBottom: '4px' }}>
                  {date}
                </div>
              )}
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontFamily: "'Noto Serif KR', serif" }}>
                {caption}
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: '14px', right: '16px', fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
              P.{String(pageNum).padStart(2, '0')}
            </div>
          </>
        ) : count === 2 ? (
          /* 사진 2장 — 상단 65% + 하단 35% */
          <div className="absolute inset-0 flex flex-col" style={{ gap: '2px' }}>
            <div className="relative" style={{ flex: '0 0 65%' }}>
              <img src={allPhotos[0]} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="relative" style={{ flex: '0 0 35%' }}>
              <img src={allPhotos[1]} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute" style={{ bottom: 0, left: 0, right: 0, padding: '14px 22px', background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)', zIndex: 2 }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', fontFamily: "'Noto Serif KR', serif" }}>{caption}</div>
            </div>
            <div style={{ position: 'absolute', bottom: '14px', right: '16px', fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', zIndex: 3 }}>
              P.{String(pageNum).padStart(2, '0')}
            </div>
          </div>
        ) : (
          /* 사진 3장 — 상단 60% + 하단 2열 40% */
          <div className="absolute inset-0 flex flex-col" style={{ gap: '2px' }}>
            <div className="relative" style={{ flex: '0 0 60%' }}>
              <img src={allPhotos[0]} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex" style={{ flex: '0 0 40%', gap: '2px' }}>
              <div className="relative flex-1">
                <img src={allPhotos[1]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="relative flex-1">
                <img src={allPhotos[2]} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="absolute" style={{ bottom: 0, left: 0, right: 0, padding: '12px 22px', background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)', zIndex: 2 }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', fontFamily: "'Noto Serif KR', serif" }}>{caption}</div>
            </div>
            <div style={{ position: 'absolute', bottom: '14px', right: '16px', fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', zIndex: 3 }}>
              P.{String(pageNum).padStart(2, '0')}
            </div>
          </div>
        )}
        </div>
      </div>
    )
  }
)
PagePhotoLeft.displayName = 'PagePhotoLeft'
export default PagePhotoLeft

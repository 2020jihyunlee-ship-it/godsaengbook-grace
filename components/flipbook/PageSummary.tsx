import React from 'react'

interface PageSummaryProps {
  summaryText: string | null
  summaryPhotoUrl?: string | null
  eventName: string
  authorName: string | null
  pageNum: number
  compact?: boolean
  category?: string
}

function getAccent(category?: string) {
  if (category === '수련회') return '#7BA8D4'
  if (category === '선교')   return '#C07838'
  if (category === '캠프')   return '#6BAA3A'
  if (category === '예배')   return '#9B6FD0'
  if (category === '모임')   return '#C07828'
  return '#C9A84C'
}

const PageSummary = React.forwardRef<HTMLDivElement, PageSummaryProps>(
  ({ summaryText, summaryPhotoUrl, eventName, authorName, pageNum, compact, category }, ref) => {
    const accent = getAccent(category)
    const hPad = compact ? '24px' : '44px'

    return (
      <div
        ref={ref}
        className="w-full h-full select-none"
        style={{ backgroundColor: '#FEFCF7', position: 'relative', overflow: 'hidden' }}
      >
        {/* 수직 중앙 정렬 래퍼 */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: hPad,
          right: hPad,
          transform: 'translateY(-50%)',
          overflow: 'hidden',
        }}>
          {/* 헤더 */}
          <div style={{ marginBottom: compact ? 20 : 28 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: compact ? 6 : 8,
            }}>
              <div style={{ width: compact ? 18 : 24, height: 1.5, backgroundColor: accent }} />
              <p style={{
                fontSize: compact ? 8 : 9,
                color: accent,
                letterSpacing: '0.18em',
                fontFamily: "'Inter', sans-serif",
              }}>
                EPILOGUE
              </p>
            </div>
            <h2 style={{
              fontFamily: "'Gowun Batang', serif",
              fontSize: compact ? 16 : 21,
              fontWeight: 600,
              color: '#1A1208',
              lineHeight: 1.3,
            }}>
              마무리 총평
            </h2>
          </div>

          {/* 사진 (모바일 카드뷰에서만 표시) */}
          {summaryPhotoUrl && compact && (
            <div style={{
              marginBottom: 14,
              borderRadius: 8,
              overflow: 'hidden',
              height: 110,
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              position: 'relative',
            }}>
              <img
                src={summaryPhotoUrl}
                alt="총평 사진"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}

          {/* 본문 */}
          {summaryText ? (
            <p style={{
              fontFamily: "'Gowun Batang', serif",
              fontSize: compact ? 12 : 14,
              lineHeight: compact ? 2.0 : 2.1,
              color: '#3A2E26',
              wordBreak: 'keep-all',
              display: '-webkit-box',
              WebkitLineClamp: (compact && summaryPhotoUrl) ? 7 : (compact ? 13 : 15),
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
            }}>
              {summaryText}
            </p>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12, opacity: 0.4,
              padding: '20px 0',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: `1px solid ${accent}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 16, color: accent }}>✦</span>
              </div>
              <p style={{
                fontSize: compact ? 11 : 12, color: '#a8a29e',
                fontStyle: 'italic', textAlign: 'center', lineHeight: 1.8,
              }}>
                총평을 기록 페이지에서<br />작성할 수 있어요.
              </p>
            </div>
          )}
        </div>

        {/* 하단 고정 푸터 */}
        <div style={{
          position: 'absolute',
          bottom: compact ? '16px' : '24px',
          left: hPad,
          right: hPad,
          paddingTop: compact ? 12 : 16,
          borderTop: `1px solid rgba(0,0,0,0.06)`,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{
              fontFamily: "'Gowun Batang', serif",
              fontSize: compact ? 10 : 11,
              color: '#3A2E26', fontWeight: 600,
              marginBottom: 2,
            }}>
              {eventName}
            </p>
            {authorName && (
              <p style={{ fontSize: compact ? 9 : 10, color: '#b0a89e' }}>{authorName}</p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 1, backgroundColor: accent, opacity: 0.5 }} />
            <p style={{ fontSize: 9, color: '#c8c0b8', letterSpacing: '0.04em' }}>
              P.{String(pageNum).padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>
    )
  }
)
PageSummary.displayName = 'PageSummary'
export default PageSummary

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
    const pad = compact ? '28px 24px 20px' : '44px 44px 32px'

    return (
      <div
        ref={ref}
        className="w-full h-full flex flex-col select-none overflow-hidden"
        style={{ backgroundColor: '#FEFCF7', padding: pad }}
      >
        {/* 헤더 */}
        <div style={{ marginBottom: compact ? 20 : 28, flexShrink: 0 }}>
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
            fontFamily: "'Noto Serif KR', serif",
            fontSize: compact ? 16 : 21,
            fontWeight: 600,
            color: '#1A1208',
            lineHeight: 1.3,
          }}>
            마무리 총평
          </h2>
        </div>

        {/* 사진 — 여백과 둥근 모서리 */}
        {summaryPhotoUrl && (
          <div style={{
            marginBottom: compact ? 14 : 20,
            borderRadius: compact ? 8 : 12,
            overflow: 'hidden',
            height: compact ? 110 : 160,
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            position: 'relative',
          }}>
            <img
              src={summaryPhotoUrl}
              alt="총평 사진"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* 사진 하단 미세 그라디언트 */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.18), transparent)',
            }} />
          </div>
        )}

        {/* 본문 */}
        <div className="flex-1 overflow-hidden">
          {summaryText ? (
            <p style={{
              fontFamily: "'Noto Serif KR', serif",
              fontSize: compact ? 12 : 14,
              lineHeight: compact ? 2.0 : 2.1,
              color: '#3A2E26',
              wordBreak: 'keep-all',
              display: '-webkit-box',
              WebkitLineClamp: summaryPhotoUrl ? (compact ? 7 : 9) : (compact ? 13 : 15),
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
            }}>
              {summaryText}
            </p>
          ) : (
            <div style={{
              height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12, opacity: 0.4,
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

        {/* 하단 */}
        <div style={{
          paddingTop: compact ? 12 : 18,
          borderTop: `1px solid rgba(0,0,0,0.06)`,
          flexShrink: 0,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{
              fontFamily: "'Noto Serif KR', serif",
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

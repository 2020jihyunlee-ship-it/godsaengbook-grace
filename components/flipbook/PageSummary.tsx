import React from 'react'

interface PageSummaryProps {
  summaryText: string | null
  summaryPhotoUrl?: string | null
  eventName: string
  authorName: string | null
  pageNum: number
  compact?: boolean
}

const PageSummary = React.forwardRef<HTMLDivElement, PageSummaryProps>(
  ({ summaryText, summaryPhotoUrl, eventName, authorName, pageNum, compact }, ref) => {
    const pad    = compact ? '28px 22px 18px' : '52px 48px 36px'
    const titleSz  = compact ? '16px' : '22px'
    const bodySz   = compact ? '12px' : '14.5px'
    const bodyLH   = compact ? 1.85   : 2.0
    const ornW     = compact ? '20px' : '28px'
    const mbHead   = compact ? '18px' : '32px'

    return (
      <div
        ref={ref}
        className="w-full h-full flex flex-col select-none overflow-hidden"
        style={{ backgroundColor: '#FEFCF7', padding: pad }}
      >
        {/* 헤더 */}
        <div style={{ marginBottom: mbHead }}>
          <div style={{ width: ornW, height: '1.5px', backgroundColor: '#F4A228', marginBottom: '10px' }} />
          <h2
            className="font-bold"
            style={{
              fontFamily: "'Noto Serif KR', serif",
              fontSize: titleSz,
              color: '#1A4F8A',
              lineHeight: 1.3,
            }}
          >
            마무리 총평
          </h2>
        </div>

        {/* 사진 (있을 경우) */}
        {summaryPhotoUrl && (
          <div style={{ marginBottom: compact ? 10 : 16, borderRadius: 8, overflow: 'hidden', maxHeight: compact ? 120 : 180 }}>
            <img
              src={summaryPhotoUrl}
              alt="총평 사진"
              style={{ width: '100%', height: compact ? 120 : 180, objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        {/* 본문 */}
        <div className="flex-1 overflow-hidden">
          {summaryText ? (
            <p
              style={{
                fontFamily: "'Noto Serif KR', serif",
                fontSize: bodySz,
                lineHeight: bodyLH,
                color: '#3d342e',
                display: '-webkit-box',
                WebkitLineClamp: summaryPhotoUrl ? (compact ? 7 : 10) : (compact ? 13 : 16),
                WebkitBoxOrient: 'vertical' as const,
                overflow: 'hidden',
                wordBreak: 'keep-all',
              }}
            >
              {summaryText}
            </p>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4" style={{ opacity: 0.45 }}>
              <div style={{ width: '36px', height: '36px', border: '1px solid #c7c3bf', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: compact ? '14px' : '18px', color: '#c7c3bf' }}>✦</span>
              </div>
              <p style={{ fontSize: compact ? '11px' : '12px', color: '#a8a29e', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.8 }}>
                총평을 기록 페이지에서<br />작성할 수 있어요.
              </p>
            </div>
          )}
        </div>

        {/* 하단 */}
        <div style={{ paddingTop: compact ? '12px' : '20px', borderTop: '1px solid #f0ebe4' }}>
          <div className="flex items-end justify-between">
            <div>
              <p style={{ fontFamily: "'Noto Serif KR', serif", fontSize: compact ? '10px' : '11px', color: '#1A4F8A', fontWeight: 600 }}>
                {eventName}
              </p>
              {authorName && (
                <p style={{ fontSize: compact ? '9px' : '10px', color: '#c7bcb2', marginTop: '3px' }}>{authorName}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width: '10px', height: '1px', backgroundColor: '#F4A228', opacity: 0.5 }} />
              <p style={{ fontSize: '10px', color: '#d6cfc8' }}>{pageNum}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
)
PageSummary.displayName = 'PageSummary'
export default PageSummary

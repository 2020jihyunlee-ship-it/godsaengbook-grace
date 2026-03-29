import React from 'react'

interface PageEssayRightProps {
  title: string
  bodyText: string | null
  bibleVerse: string | null
  quoteText: string | null
  pageNum: number
  category?: string
  compact?: boolean
}

function getRuleColor(category?: string) {
  if (category && ['선교', '해외탐방'].some(k => category.includes(k))) return '#C07838'
  return '#C9A84C'
}

function getQuoteColors(category?: string) {
  if (category && ['선교', '해외탐방'].some(k => category.includes(k))) {
    return { bg: '#FBF4EC', text: '#884010', ref: '#A05820' }
  }
  return { bg: '#F5EFE4', text: '#8A6820', ref: '#B09040' }
}

const PageEssayRight = React.forwardRef<HTMLDivElement, PageEssayRightProps>(
  ({ title, bodyText, bibleVerse, quoteText, pageNum, category, compact }, ref) => {
    const ruleClr = getRuleColor(category)
    const qClr = getQuoteColors(category)

    const pad = compact ? '28px 22px' : '38px 32px'
    const tagSz = compact ? '8px' : '9px'
    const titleSz = compact ? '14px' : '20px'
    const bodySz = compact ? '10px' : '12px'
    const quoteSz = compact ? '9.5px' : '11px'
    const quoteRefSz = compact ? '8px' : '9.5px'
    const pageNumSz = compact ? '8px' : '9px'

    const paragraphs = bodyText ? bodyText.split(/\n\n+/).filter(Boolean) : []

    return (
      <div
        ref={ref}
        className="w-full h-full select-none overflow-hidden"
        style={{
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          padding: pad,
        }}
      >
        {/* 섹션 태그 */}
        <div style={{
          fontSize: tagSz,
          color: '#999',
          letterSpacing: '0.14em',
          marginBottom: compact ? '10px' : '14px',
        }}>
          {category ?? '은혜'}
        </div>

        {/* 제목 */}
        <div style={{
          fontFamily: "'Noto Serif KR', serif",
          fontSize: titleSz,
          fontWeight: 500,
          color: '#1A1A1A',
          lineHeight: 1.35,
          marginBottom: compact ? '10px' : '16px',
          wordBreak: 'keep-all',
        }}>
          {title}
        </div>

        {/* 골드 구분선 */}
        <div style={{
          width: '28px',
          height: '1px',
          backgroundColor: ruleClr,
          marginBottom: compact ? '12px' : '18px',
          flexShrink: 0,
        }} />

        {/* 본문 */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => (
              <p key={i} style={{
                fontFamily: "'Noto Serif KR', serif",
                fontSize: bodySz,
                color: '#3D2B1F',
                lineHeight: 1.95,
                marginBottom: '10px',
                wordBreak: 'keep-all',
              }}>
                {p}
              </p>
            ))
          ) : (
            <div style={{
              height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0.25,
            }}>
              <p style={{ fontSize: '11px', color: '#a8a29e', fontStyle: 'italic', fontFamily: "'Noto Serif KR', serif" }}>
                기록이 없습니다
              </p>
            </div>
          )}
        </div>

        {/* 성경 구절 */}
        {bibleVerse && (
          <div style={{
            marginTop: compact ? '12px' : '18px',
            padding: compact ? '10px 12px' : '14px 16px',
            borderRadius: '2px',
            backgroundColor: qClr.bg,
            flexShrink: 0,
          }}>
            <p style={{
              fontFamily: "'Noto Serif KR', serif",
              fontSize: quoteSz,
              fontStyle: 'italic',
              lineHeight: 1.75,
              color: qClr.text,
            }}>
              &ldquo;{bibleVerse}&rdquo;
            </p>
          </div>
        )}

        {/* 인용문 (성경 구절 없을 때) */}
        {!bibleVerse && quoteText && (
          <div style={{
            marginTop: compact ? '12px' : '18px',
            padding: compact ? '10px 12px' : '14px 16px',
            borderRadius: '2px',
            backgroundColor: qClr.bg,
            flexShrink: 0,
          }}>
            <p style={{
              fontFamily: "'Noto Serif KR', serif",
              fontSize: quoteSz,
              fontStyle: 'italic',
              lineHeight: 1.75,
              color: qClr.text,
            }}>
              &ldquo;{quoteText}&rdquo;
            </p>
          </div>
        )}

        {/* 페이지 번호 */}
        <div style={{
          fontSize: pageNumSz,
          color: '#BBB',
          textAlign: 'center',
          marginTop: compact ? '8px' : '12px',
          letterSpacing: '0.06em',
          flexShrink: 0,
        }}>
          P.{String(pageNum).padStart(2, '0')}
        </div>
      </div>
    )
  }
)
PageEssayRight.displayName = 'PageEssayRight'
export default PageEssayRight

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
  return '#C8A84B'
}

function getQuoteColors(category?: string) {
  if (category && ['선교', '해외탐방'].some(k => category.includes(k))) {
    return { bg: '#FBF4EC', text: '#884010', ref: '#A05820' }
  }
  return { bg: '#FBF8EE', text: '#8A6820', ref: '#B09040' }
}

function getBodyColor(category?: string) {
  if (category && ['선교', '해외탐방'].some(k => category.includes(k))) return '#7A4010'
  return '#555'
}

/** "본문 텍스트 — 마태복음 28:19" → { quote, ref } */
function parseVerse(verse: string): { quote: string; ref: string | null } {
  const idx = verse.lastIndexOf(' — ')
  if (idx !== -1) {
    return { quote: verse.slice(0, idx).trim(), ref: verse.slice(idx + 3).trim() }
  }
  // em-dash 없이 그냥 전체가 본문인 경우
  return { quote: verse.trim(), ref: null }
}

const PageEssayRight = React.forwardRef<HTMLDivElement, PageEssayRightProps>(
  ({ title, bodyText, bibleVerse, quoteText, pageNum, category, compact }, ref) => {
    const ruleClr = getRuleColor(category)
    const qClr = getQuoteColors(category)
    const bodyClr = getBodyColor(category)

    const pad = compact ? '32px 26px 40px' : '52px 52px 52px'
    const tagSz      = compact ? '9px'  : '10px'
    const titleSz    = compact ? '17px' : '22px'
    const bodySz     = compact ? '12.5px' : '14.5px'
    const quoteSz    = compact ? '11px' : '13px'
    const quoteRefSz = compact ? '10px' : '11px'

    const paragraphs = bodyText ? bodyText.split(/\n\n+/).filter(Boolean) : []

    // 성경 말씀 파싱
    const verseRaw = bibleVerse ?? quoteText
    const verse = verseRaw ? parseVerse(verseRaw) : null

    return (
      <div
        ref={ref}
        className="w-full h-full select-none overflow-hidden"
        style={{
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          padding: pad,
          position: 'relative',
        }}
      >
        {/* 섹션 태그 */}
        <p style={{
          fontSize: tagSz,
          color: '#bbb',
          letterSpacing: '0.16em',
          marginBottom: compact ? '10px' : '14px',
          fontFamily: "'Inter', sans-serif",
          flexShrink: 0,
        }}>
          {category ?? '은혜'}
        </p>

        {/* 제목 */}
        <div style={{
          fontFamily: "'Noto Serif KR', serif",
          fontSize: titleSz,
          fontWeight: 600,
          color: '#1A1208',
          lineHeight: 1.4,
          marginBottom: compact ? '10px' : '14px',
          wordBreak: 'keep-all',
          flexShrink: 0,
        }}>
          {title}
        </div>

        {/* 골드 구분선 */}
        <div style={{
          width: compact ? '24px' : '32px',
          height: '1.5px',
          backgroundColor: ruleClr,
          marginBottom: compact ? '20px' : '28px',
          flexShrink: 0,
        }} />

        {/* 본문 */}
        <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => (
              <p key={i} style={{
                fontFamily: "'Noto Serif KR', serif",
                fontSize: bodySz,
                color: bodyClr,
                lineHeight: 2.1,
                wordBreak: 'keep-all',
                margin: 0,
                marginBottom: i < paragraphs.length - 1 ? (compact ? '10px' : '14px') : 0,
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

        {/* 성경 말씀 / 인용구 — 포인트 카드 */}
        {verse && (
          <div style={{
            marginTop: compact ? '22px' : '36px',
            flexShrink: 0,
            borderRadius: compact ? 8 : 12,
            backgroundColor: qClr.bg,
            padding: compact ? '14px 18px 14px' : '20px 24px 18px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* 배경 장식 — 큰 따옴표 */}
            <div style={{
              position: 'absolute',
              top: compact ? -4 : -6,
              left: compact ? 10 : 14,
              fontSize: compact ? 48 : 64,
              color: ruleClr,
              opacity: 0.12,
              fontFamily: 'Georgia, serif',
              lineHeight: 1,
              pointerEvents: 'none',
              userSelect: 'none',
            }}>
              "
            </div>
            {/* 상단 포인트 라인 */}
            <div style={{
              width: compact ? 20 : 28,
              height: 2,
              backgroundColor: ruleClr,
              marginBottom: compact ? 10 : 14,
              opacity: 0.8,
            }} />
            <p style={{
              fontFamily: "'Noto Serif KR', serif",
              fontSize: quoteSz,
              fontStyle: 'italic',
              lineHeight: 2.0,
              color: qClr.text,
              margin: 0,
              wordBreak: 'keep-all',
              position: 'relative',
              zIndex: 1,
            }}>
              {verse.quote}
            </p>
            {verse.ref && (
              <p style={{
                fontSize: quoteRefSz,
                color: ruleClr,
                marginTop: compact ? 8 : 12,
                marginBottom: 0,
                letterSpacing: '0.06em',
                fontWeight: 500,
              }}>
                — {verse.ref}
              </p>
            )}
          </div>
        )}

        {/* 페이지 번호 */}
        <p style={{
          position: 'absolute',
          bottom: compact ? '12px' : '18px',
          right: compact ? '20px' : '24px',
          fontSize: '9px',
          color: '#CCC',
          letterSpacing: '0.06em',
        }}>
          P.{String(pageNum).padStart(2, '0')}
        </p>
      </div>
    )
  }
)
PageEssayRight.displayName = 'PageEssayRight'
export default PageEssayRight

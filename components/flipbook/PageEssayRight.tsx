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

    const pad = compact ? '32px 26px 44px' : '38px 32px 48px'
    const tagSz      = '10px'
    const titleSz    = compact ? '17px' : '20px'
    const bodySz     = compact ? '13px' : '13.5px'
    const quoteSz    = compact ? '11px' : '12px'
    const quoteRefSz = compact ? '10px' : '10.5px'
    const pageNumSz  = '9px'

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
        }}
      >
        {/* 섹션 태그 */}
        <div style={{
          fontSize: tagSz,
          color: '#999',
          letterSpacing: '0.14em',
          marginBottom: '12px',
          fontFamily: "'Inter', sans-serif",
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
          marginBottom: '14px',
          wordBreak: 'keep-all',
        }}>
          {title}
        </div>

        {/* 골드 구분선 */}
        <div style={{
          width: '28px',
          height: '1.5px',
          backgroundColor: ruleClr,
          marginBottom: '18px',
          flexShrink: 0,
        }} />

        {/* 본문 */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => (
              <p key={i} style={{
                fontFamily: "'Noto Serif KR', serif",
                fontSize: bodySz,
                color: bodyClr,
                lineHeight: 2,
                marginBottom: '12px',
                wordBreak: 'keep-all',
                margin: 0,
                marginBottom: i < paragraphs.length - 1 ? '12px' : 0,
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

        {/* 성경 말씀 / 인용구 박스 */}
        {verse && (
          <div style={{
            marginTop: '18px',
            padding: '14px 16px',
            borderRadius: '4px',
            backgroundColor: qClr.bg,
            flexShrink: 0,
          }}>
            <p style={{
              fontFamily: "'Noto Serif KR', serif",
              fontSize: quoteSz,
              fontStyle: 'italic',
              lineHeight: 1.8,
              color: qClr.text,
              margin: 0,
            }}>
              &ldquo;{verse.quote}&rdquo;
            </p>
            {verse.ref && (
              <p style={{
                fontSize: quoteRefSz,
                color: qClr.ref,
                marginTop: '6px',
                marginBottom: 0,
                letterSpacing: '0.04em',
              }}>
                — {verse.ref}
              </p>
            )}
          </div>
        )}

        {/* 페이지 번호 */}
        <div style={{
          position: 'absolute',
          bottom: '14px', left: 0, right: 0,
          fontSize: pageNumSz,
          color: '#BBB',
          textAlign: 'center',
          letterSpacing: '0.06em',
        }}>
          P.{String(pageNum).padStart(2, '0')}
        </div>
      </div>
    )
  }
)
PageEssayRight.displayName = 'PageEssayRight'
export default PageEssayRight

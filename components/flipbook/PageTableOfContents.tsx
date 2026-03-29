import React from 'react'
import type { Section } from '@/types'

interface PageTableOfContentsProps {
  sections: Section[]
  category?: string
  compact?: boolean
}

function isMission(cat?: string) {
  return cat ? ['선교', '해외탐방'].some(k => cat.includes(k)) : false
}

const PageTableOfContents = React.forwardRef<HTMLDivElement, PageTableOfContentsProps>(
  ({ sections, category, compact }, ref) => {
    const mission = isMission(category)
    const bg = mission ? '#FBF8F4' : '#FAFAF8'
    const labelClr = mission ? '#C07838' : '#B8A878'
    const label = mission ? 'JOURNEY' : 'CONTENTS'
    const pad = compact ? '28px 22px' : '38px 30px'

    return (
      <div
        ref={ref}
        className="w-full h-full flex flex-col select-none overflow-hidden"
        style={{ backgroundColor: bg, padding: pad }}
      >
        {/* 레이블 */}
        <div style={{
          fontSize: compact ? '8px' : '9px',
          color: labelClr,
          letterSpacing: '0.16em',
          marginBottom: compact ? '14px' : '20px',
        }}>
          {label}
        </div>

        {/* 목록 */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {sections.map((s, i) => {
            const pageNum = 3 + i * 2
            return (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  padding: compact ? '7px 0' : '9px 0',
                  borderBottom: '0.5px solid #E8E8E8',
                }}
              >
                <span style={{
                  fontSize: compact ? '9px' : '10px',
                  color: '#AAA',
                  minWidth: compact ? '18px' : '22px',
                  flexShrink: 0,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{
                  fontFamily: "'Noto Serif KR', serif",
                  fontSize: compact ? '10px' : '11px',
                  color: '#1A1A1A',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: '0 1 auto',
                  maxWidth: '55%',
                }}>
                  {s.book_title}
                </span>
                <span style={{
                  flex: 1,
                  borderBottom: '0.5px dotted #DDD',
                  margin: '0 8px',
                  position: 'relative',
                  top: '-3px',
                  display: 'inline-block',
                  minWidth: '8px',
                }} />
                <span style={{
                  fontSize: compact ? '9px' : '10px',
                  color: '#AAA',
                  flexShrink: 0,
                }}>
                  {pageNum}
                </span>
              </div>
            )
          })}
        </div>

        {/* 푸터 */}
        <div style={{
          marginTop: 'auto',
          paddingTop: compact ? '14px' : '20px',
          fontSize: compact ? '8px' : '9px',
          color: '#BBB',
          textAlign: 'center',
          letterSpacing: '0.06em',
        }}>
          갓생북 · God-Saeng Book
        </div>
      </div>
    )
  }
)
PageTableOfContents.displayName = 'PageTableOfContents'
export default PageTableOfContents

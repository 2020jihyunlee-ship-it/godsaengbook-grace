import React from 'react'
import type { GraceSection } from '@/types'

interface PageTableOfContentsProps {
  sections: GraceSection[]
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
        className="w-full h-full select-none"
        style={{ backgroundColor: bg, position: 'relative', overflow: 'hidden' }}
      >
        {/* 콘텐츠 — 절대 중앙 배치 */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `calc(100% - ${compact ? '44px' : '60px'})`,
        }}>
          {/* 레이블 */}
          <div style={{
            fontSize: compact ? '8px' : '9px',
            color: labelClr,
            letterSpacing: '0.16em',
            marginBottom: compact ? '16px' : '22px',
          }}>
            {label}
          </div>

          {/* 목록 */}
          <div>
            {sections.map((s, i) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  padding: compact ? '7px 0' : '10px 0',
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
                  fontSize: compact ? '10px' : '12px',
                  color: '#1A1A1A',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 푸터 — 절대 하단 */}
        <div style={{
          position: 'absolute',
          bottom: compact ? '16px' : '22px',
          left: 0, right: 0,
          fontSize: compact ? '8px' : '9px',
          color: '#BBB',
          textAlign: 'center',
          letterSpacing: '0.06em',
        }}>
          갓생북 은혜
        </div>
      </div>
    )
  }
)
PageTableOfContents.displayName = 'PageTableOfContents'
export default PageTableOfContents

'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import type { GraceSection, GraceEntry } from '@/types'

const FlipbookViewer = dynamic(() => import('@/components/flipbook/FlipbookViewer'), { ssr: false })

interface Props {
  event: { id: string; name: string; category: string; dates_start: string | null; dates_end: string | null }
  sections: GraceSection[]
  entries: Record<string, GraceEntry>
  participantName: string
}

function getCategoryAccent(category: string): string {
  if (category === '수련회') return '#7BA8D4'
  if (category === '선교')   return '#C07838'
  if (category === '캠프')   return '#6BAA3A'
  if (category === '예배')   return '#9B6FD0'
  if (category === '모임')   return '#C07828'
  return '#C9A84C'
}

export default function ShareFlipbook({ event, sections, entries, participantName }: Props) {
  const router = useRouter()
  const accent = getCategoryAccent(event.category)

  return (
    <div className="h-screen flex flex-col bg-[#F5EFE4] overflow-hidden">
      {/* 헤더 */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          backgroundColor: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #EDE0CC',
          zIndex: 30,
        }}
      >
        {/* 좌: 갓생북 브랜드 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: 'linear-gradient(135deg, #2A1A08, #4A2E10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 12 }}>📖</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1208', letterSpacing: '0.02em' }}>갓생북</span>
          <span style={{ fontSize: 11, color: accent, fontWeight: 500 }}>은혜</span>
        </div>

        {/* 중: 참가자 이름 */}
        <p style={{ fontSize: 13, fontWeight: 600, color: '#3D2B1F' }}>{participantName}의 기록</p>

        {/* 우: 이벤트 카테고리 뱃지 */}
        <div style={{
          padding: '3px 8px',
          borderRadius: 10,
          backgroundColor: `${accent}18`,
          border: `1px solid ${accent}40`,
        }}>
          <span style={{ fontSize: 10, color: accent, fontWeight: 600, letterSpacing: '0.04em' }}>
            {event.category}
          </span>
        </div>
      </header>

      {/* 플립북 — 하단 CTA 높이만큼 패딩 */}
      <div style={{ flex: 1, overflow: 'hidden', paddingBottom: 76 }}>
        <FlipbookViewer
          event={event}
          sections={sections}
          entries={entries}
          participantName={participantName}
          onTap={() => {}}
          onPageChange={() => {}}
        />
      </div>

      {/* 하단 CTA */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(253,250,245,0.97)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid #EDE0CC',
          padding: '10px 16px',
          paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
          zIndex: 50,
        }}
      >
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* 텍스트 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#1A1208', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {event.name}
            </p>
            <p style={{ fontSize: 10, color: '#B0A090' }}>소중한 기억을, 기록되는 은혜로</p>
          </div>
          {/* 버튼 */}
          <button
            onClick={() => router.push('/')}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '9px 16px',
              borderRadius: 20,
              background: 'linear-gradient(135deg, #2A1A08, #4A2E10)',
              border: 'none',
              color: '#C9A84C',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            갓생북 무료로 만들기 →
          </button>
        </div>
      </div>
    </div>
  )
}

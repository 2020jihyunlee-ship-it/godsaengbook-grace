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

export default function ShareFlipbook({ event, sections, entries, participantName }: Props) {
  const router = useRouter()

  return (
    <div className="h-screen flex flex-col bg-[#F5EFE4] overflow-hidden">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#E8D5A3] z-30">
        <div style={{ width: 32 }} />
        <p className="text-sm font-semibold text-[#3D2B1F]">{participantName}의 은혜북</p>
        <div style={{ width: 32 }} />
      </header>

      {/* 플립북 */}
      <FlipbookViewer
        event={event}
        sections={sections}
        entries={entries}
        participantName={participantName}
        onTap={() => {}}
        onPageChange={() => {}}
      />

      {/* 하단 CTA */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(253,250,245,0.97)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid #E8D5A3',
          padding: '12px 16px',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          zIndex: 50,
        }}
      >
        <p className="text-xs text-[#8C6E55]">나도 소중한 순간을 은혜북으로 만들어보세요</p>
        <button
          onClick={() => router.push('/')}
          className="w-full max-w-sm py-3 text-sm font-semibold text-white rounded-2xl"
          style={{ backgroundColor: '#C9A84C' }}
        >
          📖 나도 무료로 은혜북 만들기 →
        </button>
      </div>
    </div>
  )
}

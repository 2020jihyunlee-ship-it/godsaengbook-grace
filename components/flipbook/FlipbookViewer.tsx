'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import HTMLFlipBook from 'react-pageflip'
import PageCover from './PageCover'
import PageTableOfContents from './PageTableOfContents'
import PageTocCompanion from './PageTocCompanion'
import PagePhotoLeft from './PagePhotoLeft'
import PageEssayRight from './PageEssayRight'
import PageSummary from './PageSummary'
import type { GraceSection, GraceEntry } from '@/types'

interface EventData {
  name: string
  category: string
  dates_start: string | null
  dates_end: string | null
  author_name?: string | null
  toc_photo_url?: string | null
}

interface FlipbookViewerProps {
  event: EventData
  sections: GraceSection[]
  entries: Record<string, GraceEntry>
  participantName: string
  summaryText?: string | null
  summaryPhotoUrl?: string | null
  tocPhotoUrl?: string | null
  onTap?: () => void
  onPageChange?: (sectionIndex: number) => void
  forcePortrait?: boolean
}

function Skeleton() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-500 rounded-full animate-spin" />
    </div>
  )
}

// ── 모바일 카드뷰 (갓생북 메인 레퍼런스 스타일) ──
function MobileCardView({
  event, sections, entries, participantName, summaryText, summaryPhotoUrl, tocPhotoUrl, onPageChange,
}: Omit<FlipbookViewerProps, 'onTap' | 'forcePortrait'>) {
  // 페이지 목록: 표지(0), 목차(1), TOC동반(2), [사진i(3+i*2), 글i(4+i*2)], 총평
  const totalPages = 3 + sections.length * 2 + 1

  const [idx, setIdx] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const go = useCallback((dir: 1 | -1) => {
    setIdx(i => Math.max(0, Math.min(totalPages - 1, i + dir)))
  }, [totalPages])

  useEffect(() => {
    // onPageChange 콜백 호출: 섹션 페이지는 idx 3부터 시작
    if (idx >= 3 && idx < 3 + sections.length * 2) {
      onPageChange?.(Math.floor((idx - 3) / 2))
    } else {
      onPageChange?.(-1)
    }
  }, [idx, sections.length, onPageChange])

  function renderPage() {
    if (idx === 0) {
      return (
        <PageCover
          eventName={event.name}
          category={event.category}
          authorName={event.author_name ?? null}
          datesStart={event.dates_start}
          datesEnd={event.dates_end}
          participantName={participantName}
          coverPhotoUrl={null}
          compact={false}
        />
      )
    }
    if (idx === 1) {
      return <PageTableOfContents sections={sections} category={event.category} compact={false} />
    }
    if (idx === 2) {
      return (
        <PageTocCompanion
          photoUrl={tocPhotoUrl}
          eventName={event.name}
          category={event.category}
          datesStart={event.dates_start}
          datesEnd={event.dates_end}
        />
      )
    }
    if (idx === totalPages - 1) {
      return (
        <PageSummary
          summaryText={summaryText ?? null}
          summaryPhotoUrl={summaryPhotoUrl ?? null}
          eventName={event.name}
          authorName={event.author_name ?? null}
          pageNum={3 + sections.length * 2}
          compact={false}
        />
      )
    }
    const sectionIdx = Math.floor((idx - 3) / 2)
    const isPhoto = (idx - 3) % 2 === 0
    const section = sections[sectionIdx]
    const entry = entries[section?.id ?? '']
    const pageNum = 4 + sectionIdx * 2

    if (isPhoto) {
      return (
        <PagePhotoLeft
          photoUrl={entry?.photo_url ?? null}
          caption={section?.title ?? ''}
          pageNum={pageNum}
          category={event.category}
          date={section?.section_date ?? event.dates_start}
        />
      )
    }
    return (
      <PageEssayRight
        title={section?.title ?? ''}
        bodyText={entry?.body_text ?? null}
        bibleVerse={entry?.bible_verse ?? null}
        quoteText={entry?.quote_text ?? null}
        pageNum={pageNum + 1}
        category={event.category}
        compact={false}
      />
    )
  }

  return (
    <div
      className="flex-1 flex flex-col items-center justify-between"
      style={{ backgroundColor: '#EDE8E2', padding: '20px 16px 24px' }}
    >
      {/* 페이지 카드 */}
      <div
        style={{ flex: 1, width: '100%', maxWidth: 380, display: 'flex', alignItems: 'center' }}
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={e => {
          if (touchStartX.current === null) return
          const dx = e.changedTouches[0].clientX - touchStartX.current
          if (dx < -40) go(1)
          else if (dx > 40) go(-1)
          touchStartX.current = null
        }}
      >
        <div style={{
          width: '100%',
          aspectRatio: '3 / 4',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
          position: 'relative',
        }}>
          {renderPage()}
        </div>
      </div>

      {/* 네비게이션 */}
      <div style={{ width: '100%', maxWidth: 380, display: 'flex', alignItems: 'center', gap: 10, marginTop: 20 }}>
        <button
          onClick={() => go(-1)}
          disabled={idx === 0}
          style={{
            width: 64, height: 64, borderRadius: 16,
            backgroundColor: '#fff',
            border: 'none',
            color: idx === 0 ? '#CCC' : '#C9A84C',
            fontSize: 22, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            cursor: idx === 0 ? 'default' : 'pointer',
            flexShrink: 0,
          }}
        >←</button>

        {/* 도트 인디케이터 */}
        <div style={{ flex: 1, display: 'flex', gap: 5, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <div
              key={i}
              onClick={() => setIdx(i)}
              style={{
                width: i === idx ? 16 : 6, height: 6,
                borderRadius: 3,
                backgroundColor: i === idx ? '#C9A84C' : 'rgba(0,0,0,0.18)',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>

        <button
          onClick={() => go(1)}
          disabled={idx === totalPages - 1}
          style={{
            width: 64, height: 64, borderRadius: 16,
            backgroundColor: '#fff',
            border: 'none',
            color: idx === totalPages - 1 ? '#CCC' : '#C9A84C',
            fontSize: 22, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            cursor: idx === totalPages - 1 ? 'default' : 'pointer',
            flexShrink: 0,
          }}
        >→</button>
      </div>
      <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', marginTop: 8, letterSpacing: '0.04em' }}>← 스와이프해서 넘기기 →</p>
    </div>
  )
}

// ── 메인 FlipbookViewer ──
export default function FlipbookViewer({
  event, sections, entries, participantName, summaryText, summaryPhotoUrl, tocPhotoUrl, onTap, onPageChange, forcePortrait
}: FlipbookViewerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [pageW, setPageW] = useState(forcePortrait ? 320 : 595)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    function check() {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (forcePortrait) {
        setPageW(Math.min(Math.floor(window.innerWidth * 0.78), 340))
      } else {
        const available = window.innerWidth - 160
        setPageW(Math.min(Math.floor(available / 2), 480))
      }
    }
    check()
    window.addEventListener('resize', check)
    document.fonts.ready.then(() => setReady(true))
    return () => window.removeEventListener('resize', check)
  }, [forcePortrait])

  // 데스크탑 전용: 섹션 단위 페이지 점프
  // 페이지 구조: 0=표지(showCover단독), 1=목차, 2=빈칸, 3=사진1, 4=글1, 5=사진2, 6=글2...
  const sectionStarts = [0, 1, ...sections.map((_, i) => 3 + i * 2), 3 + sections.length * 2]

  function prev() {
    const current = bookRef.current?.pageFlip().getCurrentPageIndex() ?? 0
    const prevStart = [...sectionStarts].reverse().find(p => p < current) ?? 0
    bookRef.current?.pageFlip().turnToPage(prevStart)
  }
  function next() {
    const current = bookRef.current?.pageFlip().getCurrentPageIndex() ?? 0
    const nextStart = sectionStarts.find(p => p > current)
    if (nextStart !== undefined) bookRef.current?.pageFlip().turnToPage(nextStart)
  }

  function handleFlip(e: { data: number }) {
    const page = e.data
    const sectionIndex = page >= 3 ? Math.floor((page - 3) / 2) : -1
    onPageChange?.(sectionIndex)
  }

  if (!ready) return <Skeleton />

  // 모바일: 카드뷰 (갓생북 메인 레퍼런스 스타일)
  if (isMobile && !forcePortrait) {
    return (
      <MobileCardView
        event={event}
        sections={sections}
        entries={entries}
        participantName={participantName}
        summaryText={summaryText}
        summaryPhotoUrl={summaryPhotoUrl}
        onPageChange={onPageChange}
      />
    )
  }

  // 데스크탑 / forcePortrait: react-pageflip 책 펼침 뷰
  const W = pageW
  const H = Math.floor(pageW * 1.414)

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-6"
      style={{ padding: '24px 0 32px', backgroundColor: '#EDE8E2' }}
      onClick={onTap}
    >
      {/* 책 본체 + 중앙 제본 그림자 */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <HTMLFlipBook
          ref={bookRef}
          width={W}
          height={H}
          size="fixed"
          minWidth={280}
          maxWidth={595}
          minHeight={380}
          maxHeight={842}
          showCover
          mobileScrollSupport
          usePortrait={forcePortrait ? true : false}
          drawShadow
          flippingTime={600}
          startPage={0}
          startZIndex={0}
          autoSize={false}
          clickEventForward
          useMouseEvents
          swipeDistance={30}
          showPageCorners
          disableFlipByClick={false}
          maxShadowOpacity={0.5}
          className="shadow-2xl"
          style={{}}
          onFlip={handleFlip}
        >
          <PageCover
            eventName={event.name}
            category={event.category}
            authorName={event.author_name ?? null}
            datesStart={event.dates_start}
            datesEnd={event.dates_end}
            participantName={participantName}
            coverPhotoUrl={null}
            compact={false}
          />
          <PageTableOfContents sections={sections} category={event.category} compact={false} />
          <PageTocCompanion
            photoUrl={tocPhotoUrl}
            eventName={event.name}
            category={event.category}
            datesStart={event.dates_start}
            datesEnd={event.dates_end}
          />

          {sections.map((section, i) => {
            const entry = entries[section.id]
            const pageNum = 3 + i * 2
            return [
              <PagePhotoLeft
                key={`photo-${section.id}`}
                photoUrl={entry?.photo_url ?? null}
                caption={section.title}
                pageNum={pageNum}
                category={event.category}
                date={section.section_date ?? event.dates_start}
              />,
              <PageEssayRight
                key={`essay-${section.id}`}
                title={section.title}
                bodyText={entry?.body_text ?? null}
                bibleVerse={entry?.bible_verse ?? null}
                quoteText={entry?.quote_text ?? null}
                pageNum={pageNum + 1}
                category={event.category}
                compact={false}
              />,
            ]
          }).flat()}

          <PageSummary
            summaryText={summaryText ?? null}
            summaryPhotoUrl={summaryPhotoUrl ?? null}
            eventName={event.name}
            authorName={event.author_name ?? null}
            pageNum={3 + sections.length * 2}
            compact={false}
          />

          {/* 뒷표지 — 크림 백커버 */}
          <div className="w-full h-full flex flex-col items-center justify-center select-none"
            style={{ backgroundColor: '#F0EBE3' }}>
            <div style={{ width: '32px', height: '1px', backgroundColor: '#C9A84C', opacity: 0.4, marginBottom: '16px' }} />
            <p style={{ fontSize: '11px', color: '#C9A84C', letterSpacing: '0.22em', opacity: 0.7 }}>갓생북 은혜</p>
            <p style={{ fontSize: '9px', color: '#B8A888', letterSpacing: '0.12em', marginTop: '6px', opacity: 0.6 }}>God-Saeng Book Grace</p>
          </div>
        </HTMLFlipBook>

      </div>

      {/* 데스크탑 화살표 */}
      <div className="flex items-center gap-10">
        <button
          onClick={e => { e.stopPropagation(); prev() }}
          className="w-12 h-12 rounded-2xl bg-white border border-stone-200 text-[#C9A84C] flex items-center justify-center text-xl shadow-sm hover:shadow-md transition-shadow"
        >‹</button>
        <button
          onClick={e => { e.stopPropagation(); next() }}
          className="w-12 h-12 rounded-2xl bg-white border border-stone-200 text-[#C9A84C] flex items-center justify-center text-xl shadow-sm hover:shadow-md transition-shadow"
        >›</button>
      </div>
    </div>
  )
}

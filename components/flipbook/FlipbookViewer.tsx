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
          category={event.category}
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
          boxShadow: '20px 20px 60px -10px rgba(28,28,25,0.18), 5px 5px 15px -5px rgba(28,28,25,0.12)',
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
        const byWidth = Math.min(Math.floor((window.innerWidth - 160) / 2), 480)
        // 높이 기준: 화면 높이에서 헤더+화살표+패딩 여백 220px 빼고 책 비율(1.414)로 나눔
        const byHeight = Math.floor((window.innerHeight - 220) / 1.414)
        setPageW(Math.min(byWidth, byHeight))
      }
    }
    check()
    window.addEventListener('resize', check)
    document.fonts.ready.then(() => setReady(true))
    return () => window.removeEventListener('resize', check)
  }, [forcePortrait])

  // 데스크탑 전용: 섹션 단위 페이지 점프
  // 페이지 구조(showCover=false): 0=표지, 1=갓생북브랜딩, 2=목차, 3=TocCompanion, 4+=섹션페어, 마지막=요약
  const sectionStarts = [0, 2, ...sections.map((_, i) => 4 + i * 2), 4 + sections.length * 2]

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
    const sectionIndex = page >= 4 ? Math.floor((page - 4) / 2) : -1
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
        {/* 거터 그림자 오버레이 */}
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 56,
          pointerEvents: 'none',
          zIndex: 10,
          background: 'linear-gradient(90deg, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.04) 28%, transparent 50%, rgba(0,0,0,0.04) 72%, rgba(0,0,0,0.14) 100%)',
        }} />
        <HTMLFlipBook
          ref={bookRef}
          width={W}
          height={H}
          size="fixed"
          minWidth={280}
          maxWidth={595}
          minHeight={380}
          maxHeight={842}
          showCover={false}
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
          {/* ── 0: 표지 (왼쪽) ── */}
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

          {/* ── 1: 갓생북 브랜딩 (오른쪽, 표지와 나란히) ── */}
          <div className="w-full h-full flex flex-col items-center justify-center select-none"
            style={{ backgroundColor: '#F5EFE4', position: 'relative', overflow: 'hidden' }}>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07 }}
              viewBox="0 0 100 140" preserveAspectRatio="xMidYMid slice">
              {Array.from({ length: 14 }).map((_, i) => (
                <line key={i} x1={-20 + i * 16} y1="0" x2={i * 16 - 40} y2="140"
                  stroke="#C9A84C" strokeWidth="0.5" />
              ))}
            </svg>
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
                <div style={{ width: 28, height: 1, backgroundColor: '#C9A84C', opacity: 0.5 }} />
                <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#C9A84C', opacity: 0.6 }} />
                <div style={{ width: 28, height: 1, backgroundColor: '#C9A84C', opacity: 0.5 }} />
              </div>
              <p style={{ fontSize: '13px', color: '#C9A84C', letterSpacing: '0.28em', fontWeight: 600, marginBottom: 8 }}>
                갓생북 은혜
              </p>
              <p style={{ fontSize: '9px', color: '#B8A878', letterSpacing: '0.18em', opacity: 0.8 }}>
                God-Saeng Book Grace
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginTop: 28 }}>
                <div style={{ width: 28, height: 1, backgroundColor: '#C9A84C', opacity: 0.5 }} />
                <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#C9A84C', opacity: 0.6 }} />
                <div style={{ width: 28, height: 1, backgroundColor: '#C9A84C', opacity: 0.5 }} />
              </div>
            </div>
            <p style={{
              position: 'absolute', bottom: 20,
              fontSize: '8px', color: '#C9B890', letterSpacing: '0.1em', opacity: 0.6,
            }}>
              순간의 은혜가 평생의 기억으로
            </p>
          </div>

          {/* ── 2: 목차 (왼쪽) ── */}
          <PageTableOfContents sections={sections} category={event.category} compact={false} />

          {/* ── 3: TocCompanion (오른쪽) ── */}
          <PageTocCompanion
            photoUrl={tocPhotoUrl}
            eventName={event.name}
            category={event.category}
            datesStart={event.dates_start}
            datesEnd={event.dates_end}
          />

          {/* ── 4+: 섹션 페어 ── */}
          {sections.map((section, i) => {
            const entry = entries[section.id]
            const pageNum = 4 + i * 2
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

          {/* ── 마지막-1: 총평 사진 (왼쪽) ── */}
          <PagePhotoLeft
            photoUrl={summaryPhotoUrl ?? null}
            caption="마무리 총평"
            pageNum={4 + sections.length * 2}
            category={event.category}
          />

          {/* ── 마지막: 총평 텍스트 (오른쪽) ── */}
          <PageSummary
            summaryText={summaryText ?? null}
            eventName={event.name}
            authorName={event.author_name ?? null}
            pageNum={4 + sections.length * 2 + 1}
            compact={false}
            category={event.category}
          />
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

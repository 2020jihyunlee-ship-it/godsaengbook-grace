'use client'

import { useRef, useState, useEffect } from 'react'
import HTMLFlipBook from 'react-pageflip'
import PageCover from './PageCover'
import PageTableOfContents from './PageTableOfContents'
import PagePhotoLeft from './PagePhotoLeft'
import PageEssayRight from './PageEssayRight'
import PageSummary from './PageSummary'
import type { Section, Entry, BibleQuote, GeneralQuote } from '@/types'

interface EventData {
  name: string
  category: string
  dates_start: string | null
  dates_end: string | null
  author_name: string | null
}

interface FlipbookViewerProps {
  event: EventData
  sections: Section[]
  entries: Record<string, Entry>
  participantName: string
  summaryText?: string | null
  onTap?: () => void
  onPageChange?: (sectionIndex: number) => void
}

function Skeleton() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-500 rounded-full animate-spin" />
    </div>
  )
}

export default function FlipbookViewer({
  event, sections, entries, participantName, summaryText, onTap, onPageChange
}: FlipbookViewerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [pageW, setPageW] = useState(595)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    function check() {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setPageW(mobile ? Math.floor(window.innerWidth * 0.88) : 595)
    }
    check()
    window.addEventListener('resize', check)
    document.fonts.ready.then(() => setReady(true))
    return () => window.removeEventListener('resize', check)
  }, [])

  function prev() { bookRef.current?.pageFlip().flipPrev() }
  function next() { bookRef.current?.pageFlip().flipNext() }

  function handleFlip(e: { data: number }) {
    const page = e.data
    // page 0=표지, 1=목차, 2~=섹션 페이지쌍
    const sectionIndex = page >= 2 ? Math.floor((page - 2) / 2) : -1
    onPageChange?.(sectionIndex)
  }

  const coverPhoto = sections.map(s => entries[s.id]?.photo_url).find(Boolean) ?? null

  if (!ready) return <Skeleton />

  const W = pageW
  const H = Math.floor(pageW * 1.414)

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-4"
      onClick={onTap}
    >
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
        usePortrait={isMobile}
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
        maxShadowOpacity={0.4}
        className="shadow-2xl"
        style={{}}
        onFlip={handleFlip}
      >
        <PageCover
          eventName={event.name}
          category={event.category}
          authorName={event.author_name}
          datesStart={event.dates_start}
          datesEnd={event.dates_end}
          participantName={participantName}
          coverPhotoUrl={coverPhoto}
          compact={isMobile}
        />
        <PageTableOfContents sections={sections} category={event.category} compact={isMobile} />

        {sections.map((section, i) => {
          const entry = entries[section.id]
          const quotesData = entry?.quotes as { type: 'bible' | 'general'; quotes: (BibleQuote | GeneralQuote)[] } | null
          const quotes = quotesData?.quotes ?? []
          const quoteType = quotesData?.type ?? 'general'
          const pageNum = 3 + i * 2

          return [
            <PagePhotoLeft
              key={`photo-${section.id}`}
              photoUrl={entry?.photo_url ?? null}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              photoUrls={(entry as any)?.photo_urls ?? undefined}
              caption={section.book_title}
              pageNum={pageNum}
              category={event.category}
              date={event.dates_start}
            />,
            <PageEssayRight
              key={`essay-${section.id}`}
              bookTitle={section.book_title}
              originalTitle={section.original_title}
              aiEssay={entry?.ai_essay ?? null}
              memo={entry?.memo ?? null}
              quotes={quotes}
              quoteType={quoteType}
              pageNum={pageNum + 1}
              category={event.category}
              compact={isMobile}
            />,
          ]
        }).flat()}

        <PageSummary
          summaryText={summaryText ?? null}
          eventName={event.name}
          authorName={event.author_name}
          pageNum={3 + sections.length * 2}
          compact={isMobile}
        />

        <div className="bg-stone-900 w-full h-full flex items-center justify-center select-none">
          <p className="text-stone-600 text-xs tracking-widest">갓생북</p>
        </div>
      </HTMLFlipBook>

      {/* 화살표 네비게이션 */}
      <div className="flex items-center gap-10">
        <button
          onClick={e => { e.stopPropagation(); prev() }}
          className="w-10 h-10 rounded-full bg-white/80 border border-stone-200 text-stone-500 flex items-center justify-center text-xl shadow-sm"
        >
          ‹
        </button>
        <button
          onClick={e => { e.stopPropagation(); next() }}
          className="w-10 h-10 rounded-full bg-white/80 border border-stone-200 text-stone-500 flex items-center justify-center text-xl shadow-sm"
        >
          ›
        </button>
      </div>
    </div>
  )
}

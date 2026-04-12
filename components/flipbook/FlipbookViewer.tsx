'use client'

import { useRef, useState, useEffect } from 'react'
import HTMLFlipBook from 'react-pageflip'
import PageCover from './PageCover'
import PageTableOfContents from './PageTableOfContents'
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
}

interface FlipbookViewerProps {
  event: EventData
  sections: GraceSection[]
  entries: Record<string, GraceEntry>
  participantName: string
  summaryText?: string | null
  summaryPhotoUrl?: string | null
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

export default function FlipbookViewer({
  event, sections, entries, participantName, summaryText, summaryPhotoUrl, onTap, onPageChange, forcePortrait
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
        setPageW(Math.min(Math.floor(window.innerWidth * 0.8), 360))
      } else if (mobile) {
        setPageW(Math.floor(window.innerWidth * 0.88))
      } else {
        // 데스크탑: 2페이지 펼침 기준으로 뷰포트에 여유있게 맞춤
        const available = window.innerWidth - 120 // 양쪽 여백
        setPageW(Math.min(Math.floor(available / 2), 520))
      }
    }
    check()
    window.addEventListener('resize', check)
    document.fonts.ready.then(() => setReady(true))
    return () => window.removeEventListener('resize', check)
  }, [])

  // 페이지 구조: 0=표지(showCover단독), 1=목차, 2=빈칸(쌍 맞춤), 3=사진1, 4=글1, 5=사진2, 6=글2, ...
  // showCover=true → 표지(0)는 단독 표시 → 1+2, 3+4, 5+6 쌍으로 묶임
  // 빈칸(2)을 끼워야 사진+글이 같은 쌍이 됨
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
    // page 0=표지, 1=목차, 2=빈칸, 3~=섹션 페이지쌍(사진/글)
    const sectionIndex = page >= 3 ? Math.floor((page - 3) / 2) : -1
    onPageChange?.(sectionIndex)
  }

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
        usePortrait={forcePortrait ? true : isMobile}
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
        {/* 표지 — 항상 그라데이션 디자인, 섹션 사진 사용 안 함 */}
        <PageCover
          eventName={event.name}
          category={event.category}
          authorName={event.author_name ?? null}
          datesStart={event.dates_start}
          datesEnd={event.dates_end}
          participantName={participantName}
          coverPhotoUrl={null}
          compact={isMobile}
        />
        {/* 목차 */}
        <PageTableOfContents sections={sections} category={event.category} compact={isMobile} />
        {/* 빈 페이지 — showCover로 인한 쌍 오프셋 보정 (이 페이지는 목차 뒷면) */}
        <div className="w-full h-full bg-[#FAFAF8]" />

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
              compact={isMobile}
            />,
          ]
        }).flat()}

        <PageSummary
          summaryText={summaryText ?? null}
          summaryPhotoUrl={summaryPhotoUrl ?? null}
          eventName={event.name}
          authorName={event.author_name ?? null}
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

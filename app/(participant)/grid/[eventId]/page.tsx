'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Section, Entry } from '@/types'
import HeroSection from '@/components/ui/HeroSection'
import ThemePicker from '@/components/ui/ThemePicker'
import { useTheme } from '@/hooks/useTheme'
import { formatChapter } from '@/lib/utils'

function WaveDivider({ color }: { color: string }) {
  return (
    <svg aria-hidden width="100%" height="14" viewBox="0 0 1200 14" preserveAspectRatio="none" style={{ display: 'block' }}>
      <path d="M0,7 C100,1 200,13 300,7 C400,1 500,13 600,7 C700,1 800,13 900,7 C1000,1 1100,13 1200,7"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

interface EventData {
  id: string
  name: string
  category: string
  event_type: string | null
  theme: string | null
  dates_start: string | null
  dates_end: string | null
  author_name: string | null
}

interface PhotoItem {
  section: Section
  entry: Entry
  index: number
}

export default function GridPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string
  const reduce = useReducedMotion()

  const [event, setEvent] = useState<EventData | null>(null)
  const [category, setCategory] = useState('')
  const [eventTheme, setEventTheme] = useState<string | null>(null)
  const [eventType, setEventType] = useState<string | null>(null)
  const isGroupEvent = eventType === 'group'
  const { themeId, changeTheme, theme } = useTheme(eventId, category, isGroupEvent ? eventTheme : null)
  const chapterStyle = theme?.vars['--chapter-style'] ?? 'numeric'
  const dateStyle    = theme?.vars['--date-style']    ?? 'default'
  const dividerStyle = theme?.vars['--divider-style'] ?? 'solid'
  const dateFont       = theme?.vars['--date-font']        ?? "'Cormorant Garamond', Georgia, serif"
  const locationIcon   = theme?.vars['--location-icon']    ?? ''
  const accentColor    = theme?.vars['--color-accent']     ?? '#B8975A'
  const headingWeight  = theme?.vars['--heading-weight']   ?? '700'
  const bodyWeight     = theme?.vars['--body-weight']      ?? '400'
  const ornamentOpacity = theme?.vars['--ornament-opacity'] ?? '1'
  const [sections, setSections] = useState<Section[]>([])
  const [entries, setEntries] = useState<Record<string, Entry>>({})
  const [participantName, setParticipantName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const raw = localStorage.getItem(`participant_${eventId}`)
      const session = raw ? JSON.parse(raw) : null
      if (!session?.participantId) {
        router.push(`/join/${eventId}`)
        return
      }
      setParticipantName(session.name)

      const supabase = createClient()
      const [{ data: ev }, { data: secs }, { data: ents }] = await Promise.all([
        supabase.from('events').select('id, name, category, event_type, theme, dates_start, dates_end, author_name').eq('id', eventId).single(),
        supabase.from('sections').select('*').eq('event_id', eventId).order('order'),
        supabase.from('entries').select('*').eq('participant_id', session.participantId),
      ])

      if (ev) { setEvent(ev); setCategory(ev.category); setEventTheme(ev.theme); setEventType(ev.event_type) }
      if (secs) setSections(secs)
      if (ents) {
        const map: Record<string, Entry> = {}
        ents.forEach((e: Entry) => { map[e.section_id] = e })
        setEntries(map)
      }
      setLoading(false)
    }
    load()
  }, [eventId, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg, #FEFCF8)' }}>
        <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
      </div>
    )
  }

  // 사진 있는 항목만 추출
  const photoItems: PhotoItem[] = sections
    .map((section, index) => ({ section, entry: entries[section.id], index }))
    .filter(item => item.entry?.photo_url)

  const totalPhotos = photoItems.length
  const allSections = sections.length

  return (
    <div style={{ backgroundColor: 'var(--color-bg, #FEFCF8)', minHeight: '100vh' }}>

      {/* 상단 골드 라인 (sacred 전용) */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(184,151,90,0.9) 30%, #B8975A 50%, rgba(184,151,90,0.9) 70%, transparent 100%)',
          opacity: 'var(--top-line-opacity, 0)',
          zIndex: 60,
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* 종이 질감 노이즈 (adventure 전용) */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: 'var(--texture-opacity, 0)',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '300px 300px',
        }}
      />

      {/* 헤더 */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          backgroundColor: 'var(--header-bg, rgba(254,252,248,0.92))',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--header-border, rgba(184,151,90,0.15))',
        }}
      >
        <button
          onClick={() => router.push(`/flipbook/${eventId}`)}
          style={{ fontFamily: "var(--font-sans, 'Noto Sans KR', sans-serif)", fontSize: '13px', color: 'var(--color-text-muted, #9e9690)' }}
        >
          ← 플립북
        </button>
        <div className="text-center">
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '11px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--color-accent, #B8975A)',
              fontStyle: 'italic',
            }}
          >
            Photo Grid
          </p>
          <p
            style={{
              fontFamily: "var(--font-serif, 'Noto Serif KR', serif)",
              fontSize: '13px',
              color: 'var(--color-primary, #3d342e)',
              fontWeight: 600,
              marginTop: '1px',
            }}
          >
            {participantName}의 순간들
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
          <button
            onClick={() => router.push(`/essay/${eventId}`)}
            style={{ fontFamily: "var(--font-sans, 'Noto Sans KR', sans-serif)", fontSize: '13px', color: 'var(--color-text-muted, #9e9690)' }}
          >
            에세이 →
          </button>
          {!isGroupEvent && <ThemePicker currentThemeId={themeId} onSelect={changeTheme} />}
        </div>
      </header>

      {/* 히어로 섹션 */}
      {event && (
        <HeroSection
          title={event.name}
          category={event.category}
          coverPhotoUrl={photoItems[0]?.entry?.photo_url ?? null}
          datesStart={event.dates_start}
          datesEnd={event.dates_end}
          authorName={event.author_name}
          participantName={participantName}
        />
      )}

      {/* 사진 수 요약 */}
      <div className="text-center" style={{ padding: '3rem 2rem 2rem' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '14px', color: 'var(--color-text-muted, #b8a898)', fontStyle: 'italic' }}>
          {totalPhotos} photos · {allSections} chapters
        </p>
      </div>

      {/* 사진 없을 때 */}
      {totalPhotos === 0 ? (
        <div className="text-center" style={{ padding: '4rem 2rem' }}>
          <p
            style={{
              fontFamily: "'Noto Serif KR', serif",
              fontSize: '14px',
              color: 'var(--color-text-muted, #c7c3bf)',
              fontStyle: 'italic',
            }}
          >
            아직 업로드된 사진이 없어요.
          </p>
          <button
            onClick={() => router.push(`/record/${eventId}`)}
            className="mt-4 text-sm underline"
            style={{ color: 'var(--color-accent, #B8975A)', fontFamily: "var(--font-serif, 'Noto Serif KR', serif)" }}
          >
            사진 추가하러 가기
          </button>
        </div>
      ) : (
        <div
          style={{
            padding: '0 clamp(1.5rem, 4vw, 4rem) 6rem',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {/* 에디토리얼 그리드 — 3개씩 묶어서 행 구성 */}
          {chunkArray(photoItems, 3).map((row, rowIdx) => (
            <GridRow key={rowIdx} items={row} rowIndex={rowIdx} reduce={!!reduce} chapterStyle={chapterStyle} dateStyle={dateStyle} dateFont={dateFont} locationIcon={locationIcon} headingWeight={headingWeight} bodyWeight={bodyWeight} />
          ))}
        </div>
      )}

      {/* 마지막 장식 */}
      {dividerStyle === 'wave' && (
        <div style={{ padding: '0 clamp(1.5rem, 4vw, 4rem)', opacity: 0.45, marginTop: '2rem' }}>
          <WaveDivider color={accentColor} />
        </div>
      )}
      <div
        className="text-center"
        style={{ padding: '4rem 2rem 6rem', borderTop: (dividerStyle === 'wave' || dividerStyle === 'none') ? 'none' : `1px ${dividerStyle} var(--color-divider, rgba(184,151,90,0.12))` }}
      >
        <div className="flex items-center justify-center gap-3 mb-4" style={{ opacity: Number(ornamentOpacity) }}>
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--color-accent, #B8975A))' }} />
          <div style={{ width: '4px', height: '4px', background: 'var(--color-accent, #B8975A)', transform: 'rotate(45deg)' }} />
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, var(--color-accent, #B8975A), transparent)' }} />
        </div>
        <p
          style={{
            fontFamily: ornamentOpacity === '0' ? 'var(--font-sans)' : "'Cormorant Garamond', Georgia, serif",
            fontSize: '12px',
            fontWeight: ornamentOpacity === '0' ? 300 : undefined,
            color: 'var(--color-text-muted)',
            letterSpacing: ornamentOpacity === '0' ? '0.12em' : '0.25em',
            textTransform: 'uppercase',
          }}
        >
          갓생북
        </p>
      </div>

    </div>
  )
}

// ── 그리드 행 컴포넌트 ──────────────────────────────────────────────
function GridRow({ items, rowIndex, reduce, chapterStyle, dateStyle, dateFont, locationIcon, headingWeight, bodyWeight }: { items: PhotoItem[]; rowIndex: number; reduce: boolean; chapterStyle: string; dateStyle: string; dateFont: string; locationIcon: string; headingWeight: string; bodyWeight: string }) {
  const cols = items.length

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: cols === 1 ? '1fr' : cols === 2 ? '1fr 1fr' : '1fr 1fr 1fr',
        gap: '24px',
        marginBottom: '24px',
      }}
      className="photo-grid-row"
    >
      {items.map((item, colIdx) => (
        <GridCell
          key={item.section.id}
          item={item}
          rowIndex={rowIndex}
          colIndex={colIdx}
          reduce={reduce}
          chapterStyle={chapterStyle}
          dateStyle={dateStyle}
          dateFont={dateFont}
          locationIcon={locationIcon}
          headingWeight={headingWeight}
          bodyWeight={bodyWeight}
        />
      ))}
    </div>
  )
}

// ── 그리드 셀 컴포넌트 ──────────────────────────────────────────────
function GridCell({ item, rowIndex, colIndex, reduce, chapterStyle, dateStyle, dateFont, locationIcon, headingWeight, bodyWeight }: {
  item: PhotoItem
  rowIndex: number
  colIndex: number
  reduce: boolean
  chapterStyle: string
  dateStyle: string
  dateFont: string
  locationIcon: string
  headingWeight: string
  bodyWeight: string
}) {
  const delay = reduce ? 0 : (rowIndex * 0.08 + colIndex * 0.04)

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
    >
      {/* 사진 래퍼 — hover scale + 프레임 (sacred/archive) */}
      <motion.div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'var(--photo-radius, 2px)',
          cursor: 'default',
          boxShadow: 'var(--photo-shadow, none)',
        }}
        whileHover={reduce ? undefined : { scale: 1.03 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <img
          src={item.entry.photo_url!}
          alt={item.section.book_title}
          style={{
            width: '100%',
            aspectRatio: '4 / 3',
            objectFit: 'cover',
            display: 'block',
            borderRadius: 'var(--photo-radius, 2px)',
            filter: 'var(--photo-filter, none)',
          }}
        />
        {/* 골드 프레임 인셋 (sacred) */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: '8px',
            border: 'var(--photo-border, none)',
            pointerEvents: 'none',
          }}
        />
      </motion.div>

      {/* 캡션 */}
      <div style={{ marginTop: '12px', paddingLeft: '2px' }}>
        {dateStyle === 'stamp' ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid var(--color-accent)',
              borderRadius: '100px',
              padding: '3px 10px',
              fontFamily: "var(--font-sans, 'Noto Sans KR', sans-serif)",
              fontWeight: 700,
              fontSize: '10px',
              color: 'var(--color-accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '6px',
            }}
          >
            {item.section.date ?? `No. ${formatChapter(item.index + 1, chapterStyle)}`}
          </div>
        ) : (
        <p
          style={{
            fontFamily: dateFont,
            fontSize: dateFont.includes('Caveat') ? '16px' : '12px',
            letterSpacing: dateFont.includes('Caveat') ? '0.02em' : '0.18em',
            textTransform: 'uppercase',
            color: 'var(--color-accent, #B8975A)',
            fontStyle: dateFont.includes('Caveat') ? 'normal' : 'italic',
            marginBottom: '4px',
          }}
        >
          {locationIcon}{item.section.date
            ? item.section.date
            : `No. ${formatChapter(item.index + 1, chapterStyle)}`}
        </p>
        )}
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '13px',
            fontWeight: Number(bodyWeight),
            color: 'var(--color-text, #6b5f56)',
            fontStyle: dateStyle === 'stamp' ? 'normal' : 'italic',
            lineHeight: 1.6,
          }}
        >
          {item.section.book_title}
        </p>
      </div>
    </motion.div>
  )
}

// ── 유틸 ─────────────────────────────────────────────────────────────
function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

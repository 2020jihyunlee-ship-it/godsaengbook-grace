'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Section, Entry, BibleQuote, GeneralQuote } from '@/types'
import HeroSection from '@/components/ui/HeroSection'
import ThemePicker from '@/components/ui/ThemePicker'
import { useTheme } from '@/hooks/useTheme'
import { formatChapter } from '@/lib/utils'

// ── Wave 구분선 SVG (mission 전용) ────────────────────────────────
function WaveDivider({ color }: { color: string }) {
  return (
    <svg
      aria-hidden
      width="100%"
      height="14"
      viewBox="0 0 1200 14"
      preserveAspectRatio="none"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <path
        d="M0,7 C100,1 200,13 300,7 C400,1 500,13 600,7 C700,1 800,13 900,7 C1000,1 1100,13 1200,7"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
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

const WARM_GRADIENTS = [
  'linear-gradient(160deg, #2d1b0e 0%, #6b3a2a 50%, #8b5e3c 100%)',
  'linear-gradient(160deg, #0f1f2e 0%, #1a3a4a 50%, #2d5a6e 100%)',
  'linear-gradient(160deg, #1a1028 0%, #3d2454 50%, #5c3d7a 100%)',
  'linear-gradient(160deg, #0d1f0d 0%, #1e3d1e 50%, #2d5c2d 100%)',
]

export default function EssayPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  const [event, setEvent] = useState<EventData | null>(null)
  const [category, setCategory] = useState('')
  const [eventTheme, setEventTheme] = useState<string | null>(null)
  const [eventType, setEventType] = useState<string | null>(null)
  const isGroupEvent = eventType === 'group'
  const { themeId, changeTheme, theme } = useTheme(eventId, category, isGroupEvent ? eventTheme : null)
  const chapterStyle   = theme?.vars['--chapter-style']   ?? 'numeric'
  const dateStyle      = theme?.vars['--date-style']      ?? 'default'
  const dividerStyle   = theme?.vars['--divider-style']   ?? 'solid'
  const dateFont       = theme?.vars['--date-font']       ?? "'Cormorant Garamond', Georgia, serif"
  const locationIcon   = theme?.vars['--location-icon']   ?? ''
  const quoteBar       = theme?.vars['--quote-bar']       ?? 'transparent'
  const meaningBox     = theme?.vars['--meaning-box']     ?? 'hide'
  const accentColor    = theme?.vars['--color-accent']    ?? '#D4703A'
  const headingWeight  = theme?.vars['--heading-weight']  ?? '700'
  const bodyWeight     = theme?.vars['--body-weight']     ?? '400'
  const ornamentOpacity = theme?.vars['--ornament-opacity'] ?? '1'
  const [sections, setSections] = useState<Section[]>([])
  const [entries, setEntries] = useState<Record<string, Entry>>({})
  const [participantName, setParticipantName] = useState('')
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  async function handleSaveEdit(sectionId: string, entryId: string) {
    setSavingEdit(true)
    const supabase = createClient()
    await supabase.from('entries').update({ ai_essay: editText }).eq('id', entryId)
    setEntries(prev => ({ ...prev, [sectionId]: { ...prev[sectionId], ai_essay: editText } }))
    setEditingId(null)
    setSavingEdit(false)
  }
  const printRef = useRef<HTMLDivElement>(null)

  async function handleDownloadPdf() {
    if (!printRef.current || !event) return
    setPdfLoading(true)
    const html2pdf = (await import('html2pdf.js')).default
    await html2pdf().set({
      margin: 0,
      filename: `${participantName}_${event.name}.pdf`,
      image: { type: 'jpeg', quality: 0.92 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(printRef.current).save()
    setPdfLoading(false)
  }

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

  if (!event || sections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--color-bg, #FEFCF8)' }}>
        <div className="text-center">
          <p className="text-stone-400 text-sm">아직 기록이 없어요.</p>
          <button
            onClick={() => router.push(`/record/${eventId}`)}
            className="mt-4 text-sm underline text-stone-500"
          >
            기록하러 가기
          </button>
        </div>
      </div>
    )
  }

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
            Photo Essay
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
            {participantName}의 이야기
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <button
            onClick={() => router.push(`/record/${eventId}`)}
            style={{ fontFamily: "var(--font-sans, 'Noto Sans KR', sans-serif)", fontSize: '13px', color: 'var(--color-text-muted, #9e9690)' }}
          >
            기록 →
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {!isGroupEvent && <ThemePicker currentThemeId={themeId} onSelect={changeTheme} />}
            <button
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              style={{
                fontFamily: "var(--font-sans, 'Noto Sans KR', sans-serif)",
                fontSize: '11px',
                color: 'var(--color-accent, #B8975A)',
                opacity: pdfLoading ? 0.5 : 1,
                border: '1px solid var(--color-accent, #B8975A)',
                borderRadius: '100px',
                padding: '3px 10px',
                backgroundColor: 'transparent',
                whiteSpace: 'nowrap',
              }}
            >
              {pdfLoading ? '저장 중...' : '📄 PDF'}
            </button>
          </div>
        </div>
      </header>

      {/* PDF 캡처 영역 */}
      <div ref={printRef}>

      {/* 히어로 섹션 */}
      <HeroSection
        title={event.name}
        category={event.category}
        coverPhotoUrl={sections.map(s => entries[s.id]?.photo_url).find(Boolean) ?? null}
        datesStart={event.dates_start}
        datesEnd={event.dates_end}
        authorName={event.author_name}
        participantName={participantName}
      />

      {/* 섹션별 포토에세이 */}
      {sections.map((section, i) => {
        const entry = entries[section.id]
        const photoUrl = entry?.photo_url ?? null
        const text = entry?.ai_essay || entry?.memo || null
        const quotesData = entry?.quotes as { type: 'bible' | 'general'; quotes: (BibleQuote | GeneralQuote)[] } | null
        const firstQuote = quotesData?.quotes?.[0] ?? null
        const gradient = WARM_GRADIENTS[i % 4]

        return (
          <div key={section.id}>
            {/* 섹션 구분 */}
            {i > 0 && dividerStyle === 'wave' && (
              <div style={{ padding: '0 clamp(2rem, 5vw, 4rem)', opacity: 0.5 }}>
                <WaveDivider color={accentColor} />
              </div>
            )}
            {i > 0 && dividerStyle === 'none' && (
              <div style={{ height: 'clamp(3rem, 8vw, 6rem)' }} aria-hidden />
            )}

          <article
            className="essay-article"
            style={{
              display: 'flex',
              minHeight: '100vh',
              borderTop: 'none',
            }}
          >
            {/* ── 왼쪽: sticky 사진 패널 ── */}
            <div
              className="essay-photo-panel"
              style={{
                width: '50%',
                position: 'sticky',
                top: '0',
                height: '100vh',
                alignSelf: 'flex-start',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {photoUrl ? (
                <>
                  <img
                    src={photoUrl}
                    alt={section.book_title}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                      borderRadius: 'var(--photo-radius, 2px)',
                      filter: 'var(--photo-filter, none)',
                    }}
                  />
                  {/* 오버레이 */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(20,14,8,0.55) 0%, rgba(20,14,8,0.1) 50%, transparent 100%)',
                    }}
                  />
                  {/* 골드 프레임 (sacred) / 빈티지 섀도 (archive) */}
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      inset: '16px',
                      border: 'var(--photo-border, none)',
                      boxShadow: 'var(--photo-shadow, none)',
                      pointerEvents: 'none',
                    }}
                  />
                  {/* 하단 섹션 번호 */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '2.5rem',
                      left: '2.5rem',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: '11px',
                        letterSpacing: '0.25em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.5)',
                        marginBottom: '6px',
                      }}
                    >
                      {formatChapter(i + 1, chapterStyle)}
                    </p>
                    <div style={{ width: '24px', height: '1px', backgroundColor: 'var(--color-accent, #B8975A)' }} />
                  </div>

                  {/* "이 순간의 의미" 코멘트 박스 (mission 전용) */}
                  {meaningBox === 'show' && entry?.memo && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '2.5rem',
                        right: '2rem',
                        left: '2rem',
                        background: 'rgba(255,243,236,0.92)',
                        backdropFilter: 'blur(8px)',
                        borderLeft: `3px solid ${accentColor}`,
                        borderRadius: '0 6px 6px 0',
                        padding: '12px 16px',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "'Noto Sans KR', sans-serif",
                          fontSize: '10px',
                          fontWeight: 700,
                          color: accentColor,
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          marginBottom: '6px',
                        }}
                      >
                        이 순간의 의미
                      </p>
                      <p
                        style={{
                          fontFamily: "'Noto Serif KR', serif",
                          fontSize: '12px',
                          color: '#2A2A2A',
                          lineHeight: 1.7,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {entry.memo}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ position: 'absolute', inset: 0, background: gradient }} />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '1.5rem',
                      padding: '3rem',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: 'clamp(48px, 8vw, 80px)',
                        fontWeight: 600,
                        fontStyle: 'italic',
                        color: 'rgba(184,151,90,0.3)',
                        lineHeight: 1,
                      }}
                    >
                      {formatChapter(i + 1, chapterStyle)}
                    </p>
                    <div style={{ width: '32px', height: '1px', backgroundColor: 'rgba(184,151,90,0.5)' }} />
                    <p
                      style={{
                        fontFamily: "'Noto Serif KR', serif",
                        fontSize: 'clamp(15px, 2.5vw, 20px)',
                        color: 'rgba(255,255,255,0.75)',
                        textAlign: 'center',
                        lineHeight: 1.7,
                      }}
                    >
                      {section.book_title}
                    </p>
                  </div>
                  {/* 상단 골드선 */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', backgroundColor: 'rgba(184,151,90,0.3)' }} />
                </>
              )}
            </div>

            {/* ── 오른쪽: 스크롤 텍스트 패널 ── */}
            <div
              className="essay-text-panel"
              style={{
                width: '50%',
                padding: 'clamp(2.5rem, 5vw, 4rem) clamp(2rem, 4vw, 3.5rem)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: '100vh',
              }}
            >
              {/* 날짜 / 섹션 번호 */}
              <div style={{ marginBottom: '2rem' }}>
                {dateStyle === 'stamp' ? (
                  /* Adventure — 스탬프 스타일 */
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1.5px solid var(--color-accent)',
                        borderRadius: '100px',
                        padding: '5px 14px',
                        fontFamily: "var(--font-sans, 'Noto Sans KR', sans-serif)",
                        fontWeight: 700,
                        fontSize: '11px',
                        color: 'var(--color-accent)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {section.date ?? `No. ${formatChapter(i + 1, chapterStyle)}`}
                    </div>
                  </div>
                ) : (
                  /* Default / Archive 손글씨 */
                  <p
                    style={{
                      fontFamily: dateFont,
                      fontSize: dateFont.includes('Caveat') ? '18px' : '12px',
                      letterSpacing: dateFont.includes('Caveat') ? '0.04em' : '0.28em',
                      textTransform: 'uppercase',
                      color: 'var(--color-accent)',
                      fontStyle: dateFont.includes('Caveat') ? 'normal' : 'italic',
                      marginBottom: '0.75rem',
                      fontWeight: dateFont.includes('Caveat') ? 400 : undefined,
                    }}
                  >
                    {locationIcon}{section.date
                      ? section.date
                      : `Chapter ${formatChapter(i + 1, chapterStyle)}`}
                  </p>
                )}
                {/* 장식선 */}
                <div style={{ width: '32px', height: '1px', backgroundColor: 'var(--color-accent, #B8975A)' }} />
              </div>

              {/* 제목 */}
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(18px, 3vw, 26px)',
                  fontWeight: Number(headingWeight),
                  color: 'var(--color-primary, #1c1714)',
                  lineHeight: 1.4,
                  marginBottom: '0.5rem',
                  wordBreak: 'keep-all',
                }}
              >
                {section.book_title}
              </h2>
              {section.original_title && (
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '13px',
                    color: '#b8a898',
                    fontStyle: 'italic',
                    marginBottom: '2rem',
                    letterSpacing: '0.04em',
                  }}
                >
                  {section.original_title}
                </p>
              )}

              {/* 에세이 본문 */}
              {text ? (
                editingId === section.id ? (
                  <div>
                    <textarea
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      rows={12}
                      style={{
                        width: '100%',
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(13px, 1.6vw, 15px)',
                        lineHeight: 2,
                        color: 'var(--color-text, #3d342e)',
                        border: '1px solid var(--color-accent, #B8975A)',
                        borderRadius: '6px',
                        padding: '12px',
                        resize: 'vertical',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        outline: 'none',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button
                        onClick={() => entry && handleSaveEdit(section.id, entry.id)}
                        disabled={savingEdit}
                        style={{ fontSize: '12px', padding: '6px 18px', backgroundColor: 'var(--color-accent, #B8975A)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', opacity: savingEdit ? 0.6 : 1 }}
                      >
                        {savingEdit ? '저장 중...' : '저장'}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{ fontSize: '12px', padding: '6px 18px', background: 'none', color: 'var(--color-text-muted, #9e9690)', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <p
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(14px, 1.8vw, 16px)',
                        fontWeight: Number(bodyWeight),
                        lineHeight: 2.1,
                        color: 'var(--color-text, #3d342e)',
                        wordBreak: 'keep-all',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {text}
                    </p>
                    <button
                      onClick={() => { setEditingId(section.id); setEditText(entry?.ai_essay || entry?.memo || '') }}
                      style={{ marginTop: '12px', fontSize: '11px', color: 'var(--color-accent, #B8975A)', background: 'none', border: '1px solid var(--color-accent, #B8975A)', borderRadius: '100px', padding: '3px 12px', cursor: 'pointer', opacity: 0.7 }}
                    >
                      ✏️ 수정
                    </button>
                  </div>
                )
              ) : (
                <p
                  style={{
                    fontFamily: "'Noto Serif KR', serif",
                    fontSize: '14px',
                    color: '#c7c3bf',
                    fontStyle: 'italic',
                    lineHeight: 2,
                  }}
                >
                  아직 기록이 없습니다.
                </p>
              )}

              {/* 구절 / 명언 */}
              {firstQuote && (
                <div
                  style={{
                    marginTop: '3rem',
                    paddingTop: '2rem',
                    borderTop: dividerStyle === 'wave' ? 'none' : `1px ${dividerStyle} var(--color-divider, rgba(184,151,90,0.3))`,
                    // mission: 왼쪽 세로선 스타일 (성경 구절 인용)
                    ...(quoteBar !== 'transparent' && {
                      borderTop: 'none',
                      paddingTop: '1.5rem',
                      paddingLeft: '1.25rem',
                      borderLeft: `3px solid ${quoteBar}`,
                      marginLeft: '0',
                      background: 'rgba(212,112,58,0.04)',
                      borderRadius: '0 6px 6px 0',
                    }),
                  }}
                >
                  {dividerStyle === 'wave' && quoteBar === 'transparent' && (
                    <div style={{ marginBottom: '1.5rem', opacity: 0.4 }}>
                      <WaveDivider color={accentColor} />
                    </div>
                  )}
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: quoteBar !== 'transparent' ? 'clamp(14px, 1.8vw, 17px)' : 'clamp(15px, 2vw, 18px)',
                      lineHeight: 1.9,
                      color: quoteBar !== 'transparent' ? '#2A2A2A' : 'var(--color-accent, #8B6F3A)',
                      fontStyle: 'italic',
                    }}
                  >
                    &ldquo;{'text' in firstQuote ? firstQuote.text : ''}&rdquo;
                  </p>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: '12px',
                      color: '#b8a898',
                      marginTop: '0.75rem',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {'reference' in firstQuote
                      ? (firstQuote as BibleQuote).reference
                      : `— ${(firstQuote as GeneralQuote).author}`}
                  </p>
                </div>
              )}

              {/* 하단 장식 (ornament) */}
              <div
                style={{
                  marginTop: ornamentOpacity === '0' ? '6rem' : '4rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  opacity: Number(ornamentOpacity) * 0.4,
                  visibility: ornamentOpacity === '0' ? 'hidden' : 'visible',
                  height: ornamentOpacity === '0' ? '0' : undefined,
                  overflow: ornamentOpacity === '0' ? 'hidden' : undefined,
                }}
              >
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-accent, #B8975A)' }} />
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '11px',
                    color: 'var(--color-accent, #B8975A)',
                    fontStyle: 'italic',
                  }}
                >
                  {formatChapter(i + 1, chapterStyle)} / {formatChapter(sections.length, chapterStyle)}
                </p>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#B8975A' }} />
              </div>
            </div>
          </article>
          </div>
        )
      })}

      {/* 마지막 장식 */}
      {dividerStyle === 'wave' && (
        <div style={{ padding: '0 clamp(2rem, 5vw, 4rem)', opacity: 0.45, marginTop: '1rem' }}>
          <WaveDivider color={accentColor} />
        </div>
      )}
      <div
        className="text-center"
        style={{ padding: dividerStyle === 'wave' ? '3rem 2rem 6rem' : '6rem 2rem', borderTop: dividerStyle === 'wave' ? 'none' : '1px solid var(--color-divider, rgba(184,151,90,0.12))' }}
      >
        <div className="flex items-center justify-center gap-3 mb-6" style={{ opacity: Number(ornamentOpacity) }}>
          <div style={{ width: '40px', height: '1px', background: `linear-gradient(90deg, transparent, var(--color-accent, #B8975A))` }} />
          <div style={{ width: '4px', height: '4px', background: 'var(--color-accent, #B8975A)', transform: 'rotate(45deg)' }} />
          <div style={{ width: '40px', height: '1px', background: `linear-gradient(90deg, var(--color-accent, #B8975A), transparent)` }} />
        </div>
        <p
          style={{
            fontFamily: ornamentOpacity === '0' ? 'var(--font-sans)' : "'Cormorant Garamond', Georgia, serif",
            fontSize: ornamentOpacity === '0' ? '11px' : '13px',
            letterSpacing: ornamentOpacity === '0' ? '0.15em' : '0.3em',
            textTransform: 'uppercase',
            color: ornamentOpacity === '0' ? 'var(--color-text-muted)' : 'var(--color-accent, #B8975A)',
            fontStyle: ornamentOpacity === '0' ? 'normal' : 'italic',
            fontWeight: ornamentOpacity === '0' ? 300 : undefined,
            marginBottom: '0.5rem',
          }}
        >
          Fin
        </p>
        <p
          style={{
            fontFamily: "'Noto Serif KR', serif",
            fontSize: '12px',
            color: '#c7bcb2',
          }}
        >
          갓생북
        </p>
      </div>

      </div>{/* /printRef */}

    </div>
  )
}

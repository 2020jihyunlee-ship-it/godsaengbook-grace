'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { GraceSection, GraceEntry } from '@/types'

const CATEGORY_ICON: Record<string, string> = {
  '수련회': '⛺', '선교': '✈️', '캠프': '🌿',
  '예배': '🕊️', '모임': '🤝', '개인': '📖',
}

function getCategoryBg(category: string): string {
  if (category === '수련회') return 'linear-gradient(160deg, #06101E 0%, #0C1B3A 100%)'
  if (category === '선교')   return 'linear-gradient(160deg, #1A0800 0%, #3D1600 100%)'
  if (category === '캠프')   return 'linear-gradient(160deg, #071408 0%, #122A14 100%)'
  if (category === '예배')   return 'linear-gradient(160deg, #0E0618 0%, #1E0A30 100%)'
  if (category === '모임')   return 'linear-gradient(160deg, #140A02 0%, #2E1608 100%)'
  return 'linear-gradient(160deg, #060A18 0%, #0E1530 100%)'
}

function getCategoryAccent(category: string): string {
  if (category === '수련회') return 'rgba(180,210,255,0.75)'
  if (category === '선교')   return 'rgba(224,140,60,0.85)'
  if (category === '캠프')   return 'rgba(130,196,88,0.85)'
  if (category === '예배')   return 'rgba(210,180,255,0.85)'
  if (category === '모임')   return 'rgba(212,136,44,0.85)'
  return 'rgba(160,175,230,0.75)'
}

export default function PdfPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  const [event, setEvent] = useState<{ name: string; category: string; dates_start: string | null; dates_end: string | null } | null>(null)
  const [sections, setSections] = useState<GraceSection[]>([])
  const [entries, setEntries] = useState<Record<string, GraceEntry>>({})
  const [participantName, setParticipantName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const raw = localStorage.getItem(`grace_participant_${eventId}`)
      const session = raw ? JSON.parse(raw) : null
      if (!session?.participantId) { router.push(`/join/${eventId}`); return }
      setParticipantName(session.name)

      const supabase = createClient()
      const [{ data: ev }, { data: secs }, { data: ents }] = await Promise.all([
        supabase.from('grace_events').select('name, category, dates_start, dates_end').eq('id', eventId).single(),
        supabase.from('grace_sections').select('*').eq('event_id', eventId).order('order'),
        supabase.from('grace_entries').select('*').eq('participant_id', session.participantId),
      ])
      if (ev) setEvent(ev)
      if (secs) setSections(secs)
      if (ents) {
        const map: Record<string, GraceEntry> = {}
        ents.forEach((e: GraceEntry) => { if (e.section_id) map[e.section_id] = e })
        setEntries(map)
      }
      setLoading(false)
    }
    load()
  }, [eventId, router])

  function handlePrint() {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!event) return null

  const icon = CATEGORY_ICON[event.category] ?? '📌'
  const dateStr = event.dates_start
    ? event.dates_start + (event.dates_end && event.dates_end !== event.dates_start ? ` ~ ${event.dates_end}` : '')
    : ''
  const coverPhoto = sections.map(s => entries[s.id]?.photo_url).find(Boolean) ?? null

  return (
    <>
      {/* 인쇄 전용 전역 스타일 */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          .page-break { page-break-after: always; break-after: page; }
          .pdf-page { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; }
        }
        @page {
          size: A4 portrait;
          margin: 0;
        }
      `}</style>

      {/* 상단 버튼 바 (인쇄 시 숨김) */}
      <div className="no-print sticky top-0 z-10 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-sm text-stone-500 px-1">← 뒤로</button>
        <p className="text-sm font-semibold text-stone-700">{participantName}의 은혜북</p>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#C9A84C] text-white text-sm font-semibold rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          PDF 저장
        </button>
      </div>

      {/* PDF 본문 */}
      <div className="bg-stone-100 min-h-screen py-8 px-4">
        <div className="max-w-[794px] mx-auto space-y-6">

          {/* ── 표지 ── */}
          <div
            className="pdf-page page-break relative w-full overflow-hidden shadow-md"
            style={{
              aspectRatio: '210/297',
              background: coverPhoto ? 'none' : getCategoryBg(event.category),
            }}
          >
            {coverPhoto && (
              <>
                <img src={coverPhoto} alt="표지" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,5,20,0.85) 45%, rgba(10,5,20,0.2) 100%)' }} />
              </>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
              <div className="text-5xl mb-5">{icon}</div>
              <p style={{ fontSize: 9, color: getCategoryAccent(event.category), letterSpacing: '0.2em', marginBottom: 18 }}>
                GOD-SAENG BOOK
              </p>
              <div style={{ width: 1, height: 32, backgroundColor: getCategoryAccent(event.category), opacity: 0.45, margin: '0 auto 20px' }} />
              <h1 className="text-white font-semibold text-3xl leading-tight mb-3">{event.name}</h1>
              <p className="text-white/65 text-sm mb-5">{participantName}</p>
              <div style={{ width: 36, height: 1, backgroundColor: getCategoryAccent(event.category), opacity: 0.45, margin: '0 auto 16px' }} />
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.06em', lineHeight: 1.9 }}>
                {dateStr && <p>{dateStr}</p>}
                <p>{event.category}</p>
              </div>
            </div>
            <p style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontSize: 8, color: 'rgba(255,255,255,0.12)', letterSpacing: '0.1em' }}>
              MEMORY BOOK
            </p>
          </div>

          {/* ── 섹션별 페이지 ── */}
          {sections.map((section, i) => {
            const entry = entries[section.id]
            const isLast = i === sections.length - 1
            return (
              <div
                key={section.id}
                className={`pdf-page bg-white shadow-md overflow-hidden ${!isLast ? 'page-break' : ''}`}
                style={{ borderRadius: 8 }}
              >
                {/* 섹션 헤더 */}
                <div style={{ background: 'linear-gradient(90deg, #F5EFE4, #FDFAF5)', borderBottom: '1px solid #E8D5A3', padding: '20px 28px 16px' }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 11, color: '#C9A84C', fontWeight: 600, letterSpacing: '0.08em' }}>
                      {String(section.order).padStart(2, '0')}
                    </span>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#3D2B1F', margin: 0 }}>{section.title}</h2>
                  </div>
                  {section.section_date && (
                    <p style={{ fontSize: 12, color: '#8C6E55', marginTop: 4 }}>{section.section_date}</p>
                  )}
                </div>

                <div style={{ display: 'flex', minHeight: 360 }}>
                  {/* 사진 */}
                  <div style={{ width: '42%', flexShrink: 0, background: '#F5EFE4', position: 'relative', overflow: 'hidden' }}>
                    {entry?.photo_url ? (
                      <img
                        src={entry.photo_url}
                        alt={section.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 280 }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 32, opacity: 0.3 }}>📷</span>
                      </div>
                    )}
                  </div>

                  {/* 텍스트 */}
                  <div style={{ flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {entry?.body_text ? (
                      <p style={{ fontSize: 14, lineHeight: 1.9, color: '#3D2B1F', whiteSpace: 'pre-wrap', flex: 1 }}>
                        {entry.body_text}
                      </p>
                    ) : (
                      <p style={{ fontSize: 13, color: '#C9B990', fontStyle: 'italic', flex: 1 }}>기록이 없습니다.</p>
                    )}

                    {entry?.bible_verse && (
                      <div style={{ borderLeft: '3px solid #C9A84C', paddingLeft: 12, marginTop: 'auto' }}>
                        <p style={{ fontSize: 13, color: '#8C6E55', lineHeight: 1.7, fontStyle: 'italic' }}>
                          "{entry.bible_verse}"
                        </p>
                      </div>
                    )}

                    {entry?.quote_text && (
                      <div style={{ background: '#F5EFE4', borderRadius: 8, padding: '10px 14px' }}>
                        <p style={{ fontSize: 12, color: '#8C6E55', lineHeight: 1.6 }}>💬 {entry.quote_text}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 하단 페이지 번호 */}
                <div style={{ borderTop: '1px solid #F0E8D8', padding: '8px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#C9B990' }}>갓생북 은혜</span>
                  <span style={{ fontSize: 10, color: '#C9B990' }}>p.{i + 2}</span>
                </div>
              </div>
            )
          })}

          {/* ── 마지막 페이지 ── */}
          <div
            className="pdf-page bg-white shadow-md overflow-hidden"
            style={{ borderRadius: 8, padding: '60px 40px', textAlign: 'center' }}
          >
            <div style={{ width: 40, height: 2, background: '#C9A84C', margin: '0 auto 24px' }} />
            <p style={{ fontSize: 20, fontWeight: 700, color: '#3D2B1F', marginBottom: 8 }}>{event.name}</p>
            <p style={{ fontSize: 14, color: '#8C6E55', marginBottom: 4 }}>{participantName}</p>
            {dateStr && <p style={{ fontSize: 12, color: '#C9B990' }}>{dateStr}</p>}
            <p style={{ fontSize: 11, color: '#C9B990', marginTop: 40 }}>갓생북 은혜 — 소중한 기억을, 기록되는 은혜로</p>
          </div>

        </div>
      </div>
    </>
  )
}

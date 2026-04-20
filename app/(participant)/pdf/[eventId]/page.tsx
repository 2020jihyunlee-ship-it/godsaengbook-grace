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
  if (category === '수련회') return 'rgba(180,210,255,0.8)'
  if (category === '선교')   return 'rgba(224,140,60,0.9)'
  if (category === '캠프')   return 'rgba(130,196,88,0.9)'
  if (category === '예배')   return 'rgba(210,180,255,0.9)'
  if (category === '모임')   return 'rgba(212,136,44,0.9)'
  return 'rgba(160,175,230,0.8)'
}

function getAccentSolid(category: string): string {
  if (category === '수련회') return '#7BA8D4'
  if (category === '선교')   return '#C07838'
  if (category === '캠프')   return '#6BAA3A'
  if (category === '예배')   return '#9B6FD0'
  if (category === '모임')   return '#C07828'
  return '#C9A84C'
}

export default function PdfPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  const [event, setEvent] = useState<{ name: string; category: string; dates_start: string | null; dates_end: string | null } | null>(null)
  const [sections, setSections] = useState<GraceSection[]>([])
  const [entries, setEntries] = useState<Record<string, GraceEntry>>({})
  const [summaryText, setSummaryText] = useState<string | null>(null)
  const [summaryPhotoUrl, setSummaryPhotoUrl] = useState<string | null>(null)
  const [participantName, setParticipantName] = useState('')
  const [loading, setLoading] = useState(true)

  function handleSave() {
    const ua = navigator.userAgent
    const isIOS = /iPhone|iPad|iPod/i.test(ua)
    const isAndroid = /Android/i.test(ua)
    if (isIOS) {
      alert('화면 하단 공유 버튼(□↑) → "인쇄" 선택 후\n두 손가락으로 화면을 벌리면 PDF로 저장할 수 있어요.')
    } else if (isAndroid) {
      alert('오른쪽 상단 메뉴(⋮) → "인쇄" → 저장 대상을 "PDF로 저장"으로 선택해주세요.')
    }
    window.print()
  }

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
        ents.forEach((e: GraceEntry) => {
          if (e.section_id) {
            map[e.section_id] = e
          } else {
            setSummaryText(e.body_text ?? null)
            setSummaryPhotoUrl(e.photo_url ?? null)
          }
        })
        setEntries(map)
      }
      setLoading(false)
    }
    load()
  }, [eventId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5EFE4] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-[#C9A84C] rounded-full animate-spin" />
      </div>
    )
  }

  if (!event) return null

  const icon = CATEGORY_ICON[event.category] ?? '📌'
  const accent = getAccentSolid(event.category)
  const dateStr = event.dates_start
    ? event.dates_start + (event.dates_end && event.dates_end !== event.dates_start ? ` ~ ${event.dates_end}` : '')
    : ''
  const coverPhoto = sections.map(s => entries[s.id]?.photo_url).find(Boolean) ?? null

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; background: white; }
          .pdf-section { box-shadow: none !important; break-inside: avoid; }
          .pdf-cover { break-after: page; }
        }
        @page { size: A4 portrait; margin: 12mm 10mm; }
      `}</style>

      {/* 상단 바 */}
      <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #E8D5A3', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => router.back()} className="text-sm text-[#8C6E55]">← 뒤로</button>
        <p className="text-sm font-semibold text-[#3D2B1F]">{participantName}의 은혜북</p>
        <button
          onClick={handleSave}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 20, backgroundColor: '#C9A84C', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          ↓ PDF 저장
        </button>
      </div>

      {/* 본문 */}
      <div style={{ backgroundColor: '#F0EBE3', minHeight: '100vh', padding: '72px 16px 100px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── 표지 ── */}
          <div
            className="pdf-cover"
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              aspectRatio: '3/4',
              position: 'relative',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              background: coverPhoto ? 'none' : getCategoryBg(event.category),
            }}
          >
            {coverPhoto && (
              <>
                <img src={coverPhoto} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,5,20,0.88) 40%, rgba(10,5,20,0.15) 100%)' }} />
              </>
            )}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{icon}</div>
              <p style={{ fontSize: 9, color: getCategoryAccent(event.category), letterSpacing: '0.22em', marginBottom: 20 }}>GOD-SAENG BOOK</p>
              <div style={{ width: 1, height: 28, backgroundColor: getCategoryAccent(event.category), opacity: 0.4, marginBottom: 20 }} />
              <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: 1.35, marginBottom: 10, wordBreak: 'keep-all' }}>{event.name}</h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginBottom: 20 }}>{participantName}</p>
              <div style={{ width: 32, height: 1, backgroundColor: getCategoryAccent(event.category), opacity: 0.4, marginBottom: 16 }} />
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', lineHeight: 1.9, letterSpacing: '0.05em' }}>
                {dateStr && <p>{dateStr}</p>}
                <p>{event.category}</p>
              </div>
            </div>
            <p style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', fontSize: 8, color: 'rgba(255,255,255,0.1)', letterSpacing: '0.12em' }}>MEMORY BOOK</p>
          </div>

          {/* ── 섹션별 카드 ── */}
          {sections.map((section, i) => {
            const entry = entries[section.id]
            const hasPhoto = !!entry?.photo_url
            const hasText = !!entry?.body_text
            const hasVerse = !!entry?.bible_verse
            const hasQuote = !!entry?.quote_text

            return (
              <div
                key={section.id}
                className="pdf-section"
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}
              >
                {/* 섹션 헤더 */}
                <div style={{ padding: '18px 22px 14px', borderBottom: `2px solid ${accent}20` }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <span style={{ fontSize: 11, color: accent, fontWeight: 700, letterSpacing: '0.1em', flexShrink: 0 }}>
                      {String(section.order).padStart(2, '0')}
                    </span>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1208', margin: 0, lineHeight: 1.3, wordBreak: 'keep-all' }}>
                      {section.title}
                    </h2>
                  </div>
                  {section.section_date && (
                    <p style={{ fontSize: 11, color: '#B0A090', marginTop: 5, marginLeft: 21 }}>{section.section_date}</p>
                  )}
                </div>

                {/* 사진 — 풀 너비 */}
                {hasPhoto ? (
                  <div style={{ position: 'relative', width: '100%', maxHeight: 260, overflow: 'hidden' }}>
                    <img
                      src={entry.photo_url!}
                      alt={section.title}
                      style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to top, rgba(255,255,255,0.9), transparent)' }} />
                  </div>
                ) : (
                  <div style={{ height: 80, backgroundColor: `${accent}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 28, opacity: 0.25 }}>📷</span>
                  </div>
                )}

                {/* 텍스트 본문 */}
                <div style={{ padding: '20px 22px' }}>
                  {hasText ? (
                    <p style={{
                      fontSize: 15,
                      lineHeight: 1.95,
                      color: '#2A2018',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'keep-all',
                      margin: 0,
                    }}>
                      {entry.body_text}
                    </p>
                  ) : (
                    <p style={{ fontSize: 13, color: '#C9B990', fontStyle: 'italic' }}>기록이 없습니다.</p>
                  )}

                  {/* 말씀 구절 */}
                  {hasVerse && (
                    <div style={{
                      marginTop: 20,
                      padding: '14px 18px',
                      borderRadius: 10,
                      backgroundColor: `${accent}12`,
                      borderLeft: `3px solid ${accent}`,
                    }}>
                      <p style={{ fontSize: 14, color: '#3A2E20', lineHeight: 1.85, fontStyle: 'italic', margin: 0, wordBreak: 'keep-all' }}>
                        &ldquo;{entry.bible_verse}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* 인상 깊은 말 */}
                  {hasQuote && (
                    <div style={{
                      marginTop: 12,
                      padding: '12px 16px',
                      borderRadius: 10,
                      backgroundColor: '#F5EFE4',
                    }}>
                      <p style={{ fontSize: 13, color: '#6B5040', lineHeight: 1.75, margin: 0, wordBreak: 'keep-all' }}>
                        💬 {entry.quote_text}
                      </p>
                    </div>
                  )}
                </div>

                {/* 카드 푸터 */}
                <div style={{ padding: '10px 22px', borderTop: '1px solid #F0E8D8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#C9B890', letterSpacing: '0.06em' }}>갓생북 은혜</span>
                  <span style={{ fontSize: 10, color: '#C9B890' }}>p.{i + 2}</span>
                </div>
              </div>
            )
          })}

          {/* ── 총평 카드 ── */}
          {(summaryText || summaryPhotoUrl) && (
            <div
              className="pdf-section"
              style={{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
            >
              <div style={{ padding: '18px 22px 14px', borderBottom: `2px solid ${accent}20` }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1208', margin: 0 }}>✦ 마무리 총평</h2>
              </div>
              {summaryPhotoUrl && (
                <div style={{ width: '100%', maxHeight: 260, overflow: 'hidden' }}>
                  <img src={summaryPhotoUrl} alt="총평 사진" style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} />
                </div>
              )}
              <div style={{ padding: '20px 22px' }}>
                {summaryText && (
                  <p style={{ fontSize: 15, lineHeight: 1.95, color: '#2A2018', whiteSpace: 'pre-wrap', wordBreak: 'keep-all', margin: 0 }}>
                    {summaryText}
                  </p>
                )}
              </div>
              <div style={{ padding: '10px 22px', borderTop: '1px solid #F0E8D8', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, color: '#C9B890', letterSpacing: '0.06em' }}>갓생북 은혜</span>
              </div>
            </div>
          )}

          {/* ── 마지막 카드 — 브랜딩 ── */}
          <div style={{
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
          }}>
            {/* 상단 — 크림 */}
            <div style={{ backgroundColor: '#fff', padding: '44px 32px 36px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 28 }}>
                <div style={{ width: 32, height: 1, backgroundColor: accent, opacity: 0.45 }} />
                <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: accent, opacity: 0.65 }} />
                <div style={{ width: 32, height: 1, backgroundColor: accent, opacity: 0.45 }} />
              </div>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#1A1208', marginBottom: 10, wordBreak: 'keep-all', lineHeight: 1.35 }}>{event.name}</p>
              <p style={{ fontSize: 15, color: accent, marginBottom: 6, fontWeight: 500 }}>{participantName}</p>
              {dateStr && <p style={{ fontSize: 12, color: '#B0A090' }}>{dateStr}</p>}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 28 }}>
                <div style={{ width: 32, height: 1, backgroundColor: accent, opacity: 0.45 }} />
                <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: accent, opacity: 0.65 }} />
                <div style={{ width: 32, height: 1, backgroundColor: accent, opacity: 0.45 }} />
              </div>
              <p style={{ fontSize: 12, color: '#C9B890', marginTop: 28, lineHeight: 1.8, wordBreak: 'keep-all' }}>
                소중한 기억을, 기록되는 은혜로
              </p>
            </div>
            {/* 하단 — 브랜딩 배너 */}
            <div style={{
              background: 'linear-gradient(135deg, #2A1A08, #4A2E10)',
              padding: '20px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ fontSize: 13, color: '#C9A84C', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 3 }}>
                  갓생북 은혜
                </p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em' }}>
                  교회 공동체를 위한 기록 플립북
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.03em', lineHeight: 1.7 }}>
                  godsaengbook-grace.vercel.app
                </p>
                <p style={{ fontSize: 9, color: 'rgba(201,168,76,0.6)', marginTop: 2 }}>무료로 만들어보세요 →</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 하단 고정 저장 버튼 */}
      <div className="no-print" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, backgroundColor: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(8px)', borderTop: '1px solid #E8D5A3', padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
        <button
          onClick={handleSave}
          style={{ width: '100%', maxWidth: 480, display: 'block', margin: '0 auto', padding: '14px', borderRadius: 50, backgroundColor: '#C9A84C', border: 'none', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
        >
          📥 PDF로 저장하기
        </button>
      </div>
    </>
  )
}

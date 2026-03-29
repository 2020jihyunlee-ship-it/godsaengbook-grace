'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import type { Section, Entry } from '@/types'
import ThemePicker from '@/components/ui/ThemePicker'
import { useTheme } from '@/hooks/useTheme'

const FlipbookViewer = dynamic(() => import('@/components/flipbook/FlipbookViewer'), { ssr: false })

interface EventData {
  id: string
  name: string
  category: string
  dates_start: string | null
  dates_end: string | null
  author_name: string | null
}

export default function FlipbookPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  const [event, setEvent] = useState<EventData | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [entries, setEntries] = useState<Record<string, Entry>>({})
  const [participantName, setParticipantName] = useState('')
  const [participantId, setParticipantId] = useState('')
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const { themeId, changeTheme } = useTheme(eventId, category)

  // UI 표시/숨김
  const [uiVisible, setUiVisible] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 현재 열린 섹션 인덱스
  const [currentSectionIdx, setCurrentSectionIdx] = useState(-1)

  // 글 편집
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [editText, setEditText] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedAnim, setSavedAnim] = useState(false)

  useEffect(() => {
    async function load() {
      const raw = localStorage.getItem(`participant_${eventId}`)
      const session = raw ? JSON.parse(raw) : null
      if (!session?.participantId) { router.push(`/join/${eventId}`); return }
      setParticipantName(session.name)
      setParticipantId(session.participantId)

      const supabase = createClient()
      const [{ data: ev }, { data: secs }, { data: ents }] = await Promise.all([
        supabase.from('events').select('id, name, category, dates_start, dates_end, author_name').eq('id', eventId).single(),
        supabase.from('sections').select('*').eq('event_id', eventId).order('order'),
        supabase.from('entries').select('*').eq('participant_id', session.participantId),
      ])
      if (ev) { setEvent(ev); setCategory(ev.category) }
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

  // 탭 → UI 표시, 2초 후 자동 숨김
  const handleTap = useCallback(() => {
    setUiVisible(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setUiVisible(false), 2000)
  }, [])

  // 편집 열기
  function openEdit() {
    if (currentSectionIdx < 0 || currentSectionIdx >= sections.length) return
    const section = sections[currentSectionIdx]
    const entry = entries[section.id]
    setEditingSection(section)
    setEditText(entry?.memo || entry?.ai_essay || '')
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setUiVisible(false)
  }

  // 저장
  async function handleSave() {
    if (!editingSection || !participantId) return
    setSaving(true)
    const supabase = createClient()
    const existing = entries[editingSection.id]
    if (existing) {
      await supabase.from('entries').update({ memo: editText }).eq('id', existing.id)
    } else {
      await supabase.from('entries').insert({ section_id: editingSection.id, participant_id: participantId, memo: editText })
    }
    setEntries(prev => ({
      ...prev,
      [editingSection.id]: { ...(prev[editingSection.id] ?? {} as Entry), memo: editText, section_id: editingSection.id, participant_id: participantId },
    }))
    setSaving(false)
    setSavedAnim(true)
    setTimeout(() => { setSavedAnim(false); setEditingSection(null) }, 800)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
      </div>
    )
  }

  if (!event || sections.length === 0) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-2xl mb-3">📖</p>
          <p className="text-stone-700 font-medium">아직 책이 준비되지 않았어요.</p>
          <p className="text-stone-400 text-sm mt-1">기록을 작성하면 책이 만들어집니다.</p>
          <button onClick={() => router.push(`/record/${eventId}`)} className="mt-4 px-5 py-2 bg-stone-800 text-white text-sm rounded-lg">
            기록하러 가기
          </button>
        </div>
      </div>
    )
  }

  const currentSection = currentSectionIdx >= 0 && currentSectionIdx < sections.length
    ? sections[currentSectionIdx] : null

  return (
    <div className="h-screen flex flex-col bg-stone-100 overflow-hidden">

      {/* ── 헤더: ← 제목 만 ── */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-stone-100 z-30">
        <button
          onClick={() => router.push(`/record/${eventId}`)}
          className="text-sm text-stone-400"
        >
          ←
        </button>
        <p className="text-sm font-semibold text-stone-900">{participantName}의 갓생북</p>
        <div style={{ width: 24 }} />
      </header>

      {/* ── 플립북 본체 ── */}
      <FlipbookViewer
        event={event}
        sections={sections}
        entries={entries}
        participantName={participantName}
        onTap={handleTap}
        onPageChange={setCurrentSectionIdx}
      />

      {/* ── 슬라이드업 탭바 ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          transform: uiVisible ? 'translateY(0)' : 'translateY(100%)',
          opacity: uiVisible ? 1 : 0,
          transition: 'transform 0.3s ease, opacity 0.3s ease',
          zIndex: 50,
          backgroundColor: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          padding: '12px 16px 28px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <button
          onClick={() => router.push(`/essay/${eventId}`)}
          className="flex-1 py-2 text-sm text-stone-600 rounded-xl border border-stone-200 bg-stone-50"
        >
          에세이
        </button>
        <button
          onClick={() => router.push(`/grid/${eventId}`)}
          className="flex-1 py-2 text-sm text-stone-600 rounded-xl border border-stone-200 bg-stone-50"
        >
          그리드
        </button>
        <div className="flex-1">
          <ThemePicker currentThemeId={themeId} onSelect={changeTheme} />
        </div>
        {currentSection && (
          <button
            onClick={openEdit}
            className="flex-1 py-2 text-sm font-medium text-white rounded-xl"
            style={{ backgroundColor: '#1A4F8A' }}
          >
            ✏️ 글 수정
          </button>
        )}
      </div>

      {/* ── 글 수정 오버레이 ── */}
      {editingSection && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'flex-end',
          }}
          onClick={() => setEditingSection(null)}
        >
          <div
            style={{
              width: '100%',
              backgroundColor: '#fff',
              borderRadius: '20px 20px 0 0',
              padding: '24px 20px 36px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* 드래그 핸들 */}
            <div style={{ width: '36px', height: '4px', backgroundColor: '#e5e5e5', borderRadius: '2px', margin: '0 auto 4px' }} />

            <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A4F8A' }}>
              {editingSection.book_title}
            </p>

            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              style={{
                flex: 1,
                minHeight: '200px',
                border: '1px solid #e5e5e5',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '14px',
                lineHeight: 1.8,
                color: '#3d342e',
                fontFamily: "'Noto Serif KR', serif",
                resize: 'none',
                outline: 'none',
              }}
            />

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                backgroundColor: savedAnim ? '#22c55e' : '#1A4F8A',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 600,
                transition: 'background-color 0.3s ease',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {savedAnim ? '✅ 저장됐어요' : saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

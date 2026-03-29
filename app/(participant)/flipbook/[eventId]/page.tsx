'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import type { GraceSection, GraceEntry } from '@/types'

const FlipbookViewer = dynamic(() => import('@/components/flipbook/FlipbookViewer'), { ssr: false })

export default function FlipbookPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  const [event, setEvent] = useState<{ id: string; name: string; category: string; dates_start: string | null; dates_end: string | null } | null>(null)
  const [sections, setSections] = useState<GraceSection[]>([])
  const [entries, setEntries] = useState<Record<string, GraceEntry>>({})
  const [participantName, setParticipantName] = useState('')
  const [participantId, setParticipantId] = useState('')
  const [loading, setLoading] = useState(true)

  // UI 탭 → 표시, 2초 후 자동 숨김
  const [uiVisible, setUiVisible] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [currentSectionIdx, setCurrentSectionIdx] = useState(-1)

  // 글 수정 오버레이
  const [editingSection, setEditingSection] = useState<GraceSection | null>(null)
  const [editText, setEditText] = useState('')
  const [editBible, setEditBible] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedAnim, setSavedAnim] = useState(false)

  useEffect(() => {
    async function load() {
      const raw = localStorage.getItem(`grace_participant_${eventId}`)
      const session = raw ? JSON.parse(raw) : null
      if (!session?.participantId) { router.push(`/join/${eventId}`); return }
      setParticipantName(session.name)
      setParticipantId(session.participantId)

      const supabase = createClient()
      const [{ data: ev }, { data: secs }, { data: ents }] = await Promise.all([
        supabase.from('grace_events').select('id, name, category, dates_start, dates_end').eq('id', eventId).single(),
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

  const handleTap = useCallback(() => {
    setUiVisible(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setUiVisible(false), 2500)
  }, [])

  function openEdit() {
    if (currentSectionIdx < 0 || currentSectionIdx >= sections.length) return
    const section = sections[currentSectionIdx]
    const entry = entries[section.id]
    setEditingSection(section)
    setEditText(entry?.body_text ?? '')
    setEditBible(entry?.bible_verse ?? '')
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setUiVisible(false)
  }

  async function handleSave() {
    if (!editingSection || !participantId) return
    setSaving(true)
    const supabase = createClient()
    const existing = entries[editingSection.id]
    const payload = {
      body_text: editText,
      bible_verse: editBible || null,
      updated_at: new Date().toISOString(),
    }
    if (existing) {
      await supabase.from('grace_entries').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('grace_entries').insert({
        event_id: eventId,
        section_id: editingSection.id,
        participant_id: participantId,
        ...payload,
        is_draft: false,
      })
    }
    setEntries(prev => ({
      ...prev,
      [editingSection.id]: {
        ...(prev[editingSection.id] ?? {} as GraceEntry),
        body_text: editText,
        bible_verse: editBible || null,
      },
    }))
    setSaving(false)
    setSavedAnim(true)
    setTimeout(() => { setSavedAnim(false); setEditingSection(null) }, 800)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5EFE4] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#E8D5A3] border-t-[#C9A84C] rounded-full animate-spin" />
      </div>
    )
  }

  if (!event || sections.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFAF5] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-4">📖</p>
          <p className="text-[#3D2B1F] font-medium">아직 플립북이 준비되지 않았어요.</p>
          <p className="text-[#8C6E55] text-sm mt-2">기록을 작성하면 플립북이 만들어져요.</p>
          <button
            onClick={() => router.push(`/record/${eventId}`)}
            className="mt-5 px-6 py-3 bg-[#C9A84C] text-white text-sm font-medium rounded-full hover:bg-[#A8853A] transition-colors"
          >
            기록하러 가기
          </button>
        </div>
      </div>
    )
  }

  const currentSection = currentSectionIdx >= 0 && currentSectionIdx < sections.length
    ? sections[currentSectionIdx] : null

  return (
    <div className="h-screen flex flex-col bg-[#F5EFE4] overflow-hidden">

      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#E8D5A3] z-30">
        <button
          onClick={() => router.push(`/record/${eventId}`)}
          className="text-[#8C6E55] text-sm px-1 py-1"
        >
          ←
        </button>
        <p className="text-sm font-semibold text-[#3D2B1F]">{participantName}의 은혜북</p>
        <div style={{ width: 32 }} />
      </header>

      {/* 플립북 */}
      <FlipbookViewer
        event={event}
        sections={sections}
        entries={entries}
        participantName={participantName}
        onTap={handleTap}
        onPageChange={setCurrentSectionIdx}
      />

      {/* 슬라이드업 탭바 */}
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
          backgroundColor: 'rgba(253,250,245,0.97)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid #E8D5A3',
          padding: '12px 16px',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          display: 'flex',
          justifyContent: 'space-around',
          gap: '8px',
        }}
      >
        <button
          onClick={() => router.push(`/record/${eventId}`)}
          className="flex-1 py-2.5 text-sm text-[#8C6E55] rounded-2xl border border-[#E8D5A3] bg-white active:bg-[#F5EFE4]"
        >
          ✏️ 기록 수정
        </button>
        {currentSection && (
          <button
            onClick={openEdit}
            className="flex-1 py-2.5 text-sm font-medium text-white rounded-2xl"
            style={{ backgroundColor: '#C9A84C' }}
          >
            현재 페이지 수정
          </button>
        )}
      </div>

      {/* 글 수정 오버레이 */}
      {editingSection && (
        <div
          className="fixed inset-0 z-60 flex items-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 60 }}
          onClick={() => setEditingSection(null)}
        >
          <div
            className="w-full bg-white rounded-t-3xl flex flex-col gap-3"
            style={{
              padding: '24px 20px',
              paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
              maxHeight: '85vh',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-9 h-1 bg-[#E8D5A3] rounded-full mx-auto mb-1" />
            <p className="text-sm font-semibold text-[#A8853A]">{editingSection.title}</p>

            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              placeholder="묵상 기록을 입력해주세요."
              style={{
                flex: 1,
                minHeight: '160px',
                border: '1px solid #E8D5A3',
                borderRadius: '16px',
                padding: '12px',
                fontSize: '15px',
                lineHeight: 1.8,
                color: '#3D2B1F',
                resize: 'none',
                outline: 'none',
                backgroundColor: '#FDFAF5',
              }}
            />

            <input
              value={editBible}
              onChange={e => setEditBible(e.target.value)}
              placeholder="성경 구절 (선택)"
              style={{
                border: '1px solid #E8D5A3',
                borderRadius: '16px',
                padding: '12px 16px',
                fontSize: '14px',
                color: '#3D2B1F',
                outline: 'none',
                backgroundColor: '#FDFAF5',
              }}
            />

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                backgroundColor: savedAnim ? '#22c55e' : '#C9A84C',
                color: '#fff',
                border: 'none',
                borderRadius: '16px',
                padding: '16px',
                fontSize: '15px',
                fontWeight: 600,
                transition: 'background-color 0.3s ease',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {savedAnim ? '✓ 저장됐어요' : saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

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

  const [event, setEvent] = useState<{ id: string; name: string; category: string; dates_start: string | null; dates_end: string | null; toc_photo_url?: string | null } | null>(null)
  const [sections, setSections] = useState<GraceSection[]>([])
  const [entries, setEntries] = useState<Record<string, GraceEntry>>({})
  const [participantName, setParticipantName] = useState('')
  const [participantId, setParticipantId] = useState('')
  const [summaryText, setSummaryText] = useState<string | null>(null)
  const [summaryPhotoUrl, setSummaryPhotoUrl] = useState<string | null>(null)
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

  const loadData = useCallback(async () => {
    const raw = localStorage.getItem(`grace_participant_${eventId}`)
    const session = raw ? JSON.parse(raw) : null
    if (!session?.participantId) { router.push(`/join/${eventId}`); return }
    setParticipantName(session.name)
    setParticipantId(session.participantId)

    const supabase = createClient()
    const [{ data: ev }, { data: secs }, entriesRes] = await Promise.all([
      supabase.from('grace_events').select('id, name, category, dates_start, dates_end, toc_photo_url').eq('id', eventId).single(),
      supabase.from('grace_sections').select('*').eq('event_id', eventId).order('order'),
      fetch(`/api/entries?participantId=${session.participantId}`, { cache: 'no-store' }).then(r => r.json()),
    ])
    if (ev) setEvent(ev)
    if (secs) setSections(secs)
    const ents: GraceEntry[] = entriesRes?.entries ?? []
    if (ents.length > 0) {
      const map: Record<string, GraceEntry> = {}
      ents.forEach((e: GraceEntry) => {
        if (e.section_id) map[e.section_id] = e
        else {
          setSummaryText(e.body_text ?? null)
          setSummaryPhotoUrl(e.photo_url ?? null)
        }
      })
      setEntries(map)
    }
    setLoading(false)
  }, [eventId, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 기록 페이지에서 돌아올 때 항상 최신 데이터 반영
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        loadData()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [loadData])

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
    await fetch('/api/save-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participantId,
        eventId,
        sectionId: editingSection.id,
        bodyText: editText,
        bibleVerse: editBible || null,
        isDraft: false,
      }),
    })
    setEntries(prev => ({
      ...prev,
      [editingSection.id]: {
        ...(prev[editingSection.id] ?? {} as GraceEntry),
        body_text: editText,
        bible_verse: editBible || null,
        updated_at: new Date().toISOString(),
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
        {/* 항상 보이는 PDF 저장 버튼 */}
        <button
          onClick={() => router.push(`/pdf/${eventId}`)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '6px 12px', borderRadius: 20,
            backgroundColor: '#C9A84C', border: 'none',
            color: '#fff', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          📥 PDF
        </button>
      </header>

      {/* 플립북 — entries가 바뀌면 key가 바뀌어 재마운트됨 */}
      <FlipbookViewer
        key={Object.values(entries).map(e => `${e.id}:${e.updated_at ?? ''}`).join('|') || 'empty'}
        event={event}
        sections={sections}
        entries={entries}
        participantName={participantName}
        summaryText={summaryText}
        summaryPhotoUrl={summaryPhotoUrl}
        tocPhotoUrl={event?.toc_photo_url ?? null}
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
          ✏️ 수정
        </button>
        <button
          onClick={() => router.push(`/pdf/${eventId}`)}
          className="flex-1 py-2.5 text-sm font-bold text-white rounded-2xl"
          style={{ backgroundColor: '#C9A84C', fontSize: 13 }}
        >
          📥 PDF 저장
        </button>
        <button
          onClick={() => {
            const url = `${window.location.origin}/share/${participantId}`
            navigator.clipboard.writeText(url).then(() => alert('링크가 복사됐어요!\n(30일간 유효해요)'))
          }}
          className="flex-1 py-2.5 text-sm text-[#8C6E55] rounded-2xl border border-[#E8D5A3] bg-white active:bg-[#F5EFE4]"
        >
          🔗 공유
        </button>
        {currentSection && (
          <button
            onClick={openEdit}
            className="flex-1 py-2.5 text-sm font-medium text-[#8C6E55] rounded-2xl border border-[#E8D5A3] bg-white active:bg-[#F5EFE4]"
          >
            페이지 수정
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

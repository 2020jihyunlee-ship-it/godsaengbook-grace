'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Section, Entry, BibleQuote, GeneralQuote } from '@/types'
import { PageTransition, CtaBtn, MBtn, TypingCursor, SuccessCheck, Confetti } from '@/components/ui/motion'

const EMOTIONS = [
  { emoji: '😂', label: '웃김' },
  { emoji: '🥹', label: '감동' },
  { emoji: '🙏', label: '감사' },
  { emoji: '⚡', label: '설렘' },
  { emoji: '😤', label: '도전' },
  { emoji: '💕', label: '사랑' },
]

interface PhotoItem {
  preview: string   // blob URL 또는 원격 URL
  file: File | null // null = 이미 업로드된 사진
  url: string | null
}

interface ParticipantSession {
  participantId: string
  sessionToken: string
  name: string
}

interface EventInfo {
  id: string
  name: string
  category: string
  insight_type: string
  status: string
}

export default function RecordPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  const [session, setSession] = useState<ParticipantSession | null>(null)
  const [event, setEvent] = useState<EventInfo | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [memo, setMemo] = useState('')
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [primaryIdx, setPrimaryIdx] = useState(0)
  const [emotions, setEmotions] = useState<string[]>([])
  const [existingEntries, setExistingEntries] = useState<Record<string, Entry>>({})
  const [sectionPickerOpen, setSectionPickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draftSaving, setDraftSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [error, setError] = useState('')

  // AI
  const [aiEssay, setAiEssay] = useState('')
  const [pendingEssay, setPendingEssay] = useState('')
  const [generatingEssay, setGeneratingEssay] = useState(false)
  const [aiError, setAiError] = useState('')

  const multiPhotoRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipPhotoRestoreRef = useRef(false) // 저장 후 effect가 사진을 덮어쓰지 않도록

  const todayStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  })

  // 세션 복원
  useEffect(() => {
    const raw = localStorage.getItem(`participant_${eventId}`)
    if (!raw) { router.push(`/join/${eventId}`); return }
    setSession(JSON.parse(raw))
  }, [eventId, router])

  // 이벤트 + 섹션 로드
  useEffect(() => {
    if (!session) return
    async function load() {
      const supabase = createClient()
      const [{ data: ev }, { data: secs }] = await Promise.all([
        supabase.from('events').select('id, name, category, insight_type, status').eq('id', eventId).single(),
        supabase.from('sections').select('*').eq('event_id', eventId).order('order'),
      ])
      if (ev) setEvent(ev)
      if (secs && secs.length > 0) {
        setSections(secs)
        const now = new Date()
        const matched = secs.find((s: Section) => {
          if (!s.date || !s.time) return false
          return new Date(`${s.date}T${s.time}`) <= now
        })
        setSelectedSection(matched ?? secs[0])
      }
      const sess = JSON.parse(localStorage.getItem(`participant_${eventId}`) || '{}')
      if (sess.participantId) {
        const { data: ents } = await supabase.from('entries').select('*').eq('participant_id', sess.participantId)
        if (ents) {
          const map: Record<string, Entry> = {}
          ents.forEach((e: Entry) => { map[e.section_id] = e })
          setExistingEntries(map)
        }
      }
    }
    load()
  }, [session, eventId])

  // 섹션 변경 시 기존 데이터 복원
  useEffect(() => {
    if (!selectedSection) return
    // 방금 저장한 직후라면 사진/감정 상태는 이미 최신 → 복원 건너뜀
    if (skipPhotoRestoreRef.current) {
      skipPhotoRestoreRef.current = false
      return
    }
    const existing = existingEntries[selectedSection.id]
    setMemo(existing?.memo ?? '')
    setSaved(false)
    setJustSaved(false)
    setAiEssay(existing?.ai_essay ?? '')
    setPendingEssay('')
    setAiError('')

    // 사진 복원
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const urls: string[] = (existing as any)?.photo_urls ?? []
    const primaryUrl: string | null = existing?.photo_url ?? null
    const allUrls = primaryUrl && !urls.includes(primaryUrl)
      ? [primaryUrl, ...urls]
      : urls.length ? urls : (primaryUrl ? [primaryUrl] : [])
    setPhotos(allUrls.map(u => ({ preview: u, file: null, url: u })))
    setPrimaryIdx(0)

    // 감정 태그 복원
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const savedEmotions = (existing as any)?.emotions
    setEmotions(savedEmotions ? JSON.parse(savedEmotions) : [])
  }, [selectedSection, existingEntries])

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  function handleMemoChange(val: string) {
    setMemo(val)
    setSaved(false)
    autoResize()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => autoSaveMemo(val), 1000)
  }

  async function autoSaveMemo(memoVal: string) {
    if (!session || !selectedSection || !memoVal.trim()) return
    const supabase = createClient()
    const existing = existingEntries[selectedSection.id]
    if (existing) {
      await supabase.from('entries').update({ memo: memoVal, is_draft: true }).eq('id', existing.id)
    } else {
      const { data } = await supabase.from('entries').insert({
        section_id: selectedSection.id,
        participant_id: session.participantId,
        user_role: 'student',
        memo: memoVal,
        is_draft: true,
      }).select().single()
      if (data) setExistingEntries(prev => ({ ...prev, [selectedSection.id]: data }))
    }
    setSaved(true)
  }

  function toggleEmotion(emoji: string) {
    setEmotions(prev => prev.includes(emoji) ? prev.filter(e => e !== emoji) : [...prev, emoji])
  }

  // 사진 추가 → 즉시 업로드 + 임시저장
  async function addPhotosFromFiles(files: FileList | null) {
    if (!files || !session || !selectedSection) return
    setError('')
    const newItems: PhotoItem[] = Array.from(files)
      .slice(0, 3 - photos.length)
      .map(file => ({ preview: URL.createObjectURL(file), file, url: null }))
    if (newItems.length === 0) return
    const newPhotos = [...photos, ...newItems].slice(0, 3)
    setPhotos(newPhotos) // 먼저 미리보기 표시
    await saveDraft(memo, newPhotos, emotions) // 즉시 업로드 + DB 저장
  }

  function removePhoto(idx: number) {
    setPhotos(prev => {
      const next = prev.filter((_, i) => i !== idx)
      if (primaryIdx >= next.length) setPrimaryIdx(Math.max(0, next.length - 1))
      return next
    })
  }

  // 임시저장
  async function saveDraft(memoVal: string, photoList: PhotoItem[], emojiList: string[]) {
    if (!session || !selectedSection) return
    setDraftSaving(true)
    setError('')
    const supabase = createClient()
    const existing = existingEntries[selectedSection.id]

    // 새 파일만 업로드
    const uploadedPhotos = await uploadNewPhotos(photoList)
    const primaryUrl = uploadedPhotos[primaryIdx]?.url ?? uploadedPhotos[0]?.url ?? null
    const allUrls = uploadedPhotos.map(p => p.url).filter(Boolean) as string[]

    const payload = {
      section_id: selectedSection.id,
      participant_id: session.participantId,
      user_role: 'student' as const,
      memo: memoVal,
      photo_url: primaryUrl,
      photo_urls: allUrls,
      emotions: emojiList.length ? JSON.stringify(emojiList) : null,
      is_draft: true,
    }
    if (existing) {
      const { data } = await supabase.from('entries').update(payload).eq('id', existing.id).select().single()
      if (data) setExistingEntries(prev => ({ ...prev, [selectedSection.id]: data }))
    } else {
      const { data } = await supabase.from('entries').insert(payload).select().single()
      if (data) setExistingEntries(prev => ({ ...prev, [selectedSection.id]: data }))
    }
    // 업로드된 URL로 photos 업데이트 (effect가 덮어쓰지 않도록)
    skipPhotoRestoreRef.current = true
    setPhotos(uploadedPhotos)
    setDraftSaving(false)
    setSaved(true)
  }

  async function uploadNewPhotos(photoList: PhotoItem[]): Promise<PhotoItem[]> {
    if (!session || !selectedSection) return photoList
    const supabase = createClient()
    const result: PhotoItem[] = []
    for (let i = 0; i < photoList.length; i++) {
      const p = photoList[i]
      if (p.file) {
        const ext = p.file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
        const safeExt = ['jpg','jpeg','png','gif','webp','heic','heif'].includes(ext) ? ext : 'jpg'
        const path = `entries/${session.participantId}/${selectedSection.id}_${i}.${safeExt}`
        const { error: uploadErr } = await supabase.storage
          .from('photos').upload(path, p.file, { upsert: true })
        if (uploadErr) {
          setError(`사진 업로드 실패: ${uploadErr.message}`)
          result.push(p)
        } else {
          const { data } = supabase.storage.from('photos').getPublicUrl(path)
          result.push({ preview: data.publicUrl, file: null, url: data.publicUrl })
        }
      } else {
        result.push(p)
      }
    }
    return result
  }

  async function handleSubmit() {
    if (!session || !selectedSection) return
    if (!memo.trim() && photos.length === 0 && !aiEssay) return
    setSaving(true)
    setError('')

    const supabase = createClient()
    const uploadedPhotos = await uploadNewPhotos(photos)
    const primaryUrl = uploadedPhotos[primaryIdx]?.url ?? uploadedPhotos[0]?.url ?? null
    const allUrls = uploadedPhotos.map(p => p.url).filter(Boolean) as string[]

    const existing = existingEntries[selectedSection.id]
    const payload = {
      section_id: selectedSection.id,
      participant_id: session.participantId,
      user_role: 'student' as const,
      memo: memo.trim(),
      photo_url: primaryUrl,
      photo_urls: allUrls,
      emotions: emotions.length ? JSON.stringify(emotions) : null,
      is_draft: false,
    }

    let savedEntry: Entry | null = null
    if (existing) {
      const { data } = await supabase.from('entries').update(payload).eq('id', existing.id).select().single()
      savedEntry = data
    } else {
      const { data } = await supabase.from('entries').insert(payload).select().single()
      savedEntry = data
    }

    if (savedEntry) {
      skipPhotoRestoreRef.current = true
      setExistingEntries(prev => ({ ...prev, [selectedSection.id]: savedEntry! }))
      setPhotos(uploadedPhotos)
      const count = Object.values({ ...existingEntries, [selectedSection.id]: savedEntry })
        .filter(e => !e.is_draft).length
      await supabase.from('participants').update({ record_count: count }).eq('id', session.participantId)
    }

    setSaving(false)
    setSaved(true)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1600)
  }

  async function handleGenerateEssay() {
    if (!selectedSection) return
    const existing = existingEntries[selectedSection.id]
    if (!existing?.id) {
      await handleSubmit()
      setAiError('메모를 먼저 저장했습니다. 다시 눌러주세요.')
      return
    }
    setGeneratingEssay(true)
    setAiError('')
    const res = await fetch('/api/ai/generate-essay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry_id: existing.id, section_id: selectedSection.id, user_role: 'student' }),
    })
    const data = await res.json()
    if (!res.ok || data.error) setAiError(data.error ?? 'AI 에세이 생성 실패')
    else setPendingEssay(data.ai_essay)
    setGeneratingEssay(false)
  }

  const completedCount = Object.values(existingEntries).filter(e => !e.is_draft).length
  const draftCount = Object.values(existingEntries).filter(e => e.is_draft).length

  if (!session || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF7' }}>
        <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
      </div>
    )
  }

  if (sections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FAFAF7' }}>
        <div className="text-center">
          <p className="text-2xl mb-3">📋</p>
          <p className="text-stone-700 font-medium">아직 목차가 준비되지 않았어요.</p>
          <p className="text-stone-400 text-sm mt-1">리더님이 일정표를 업로드하면 기록을 시작할 수 있어요.</p>
        </div>
      </div>
    )
  }

  const currentEntry = selectedSection ? existingEntries[selectedSection.id] : null
  const isSaved = currentEntry && !currentEntry.is_draft

  return (
    <PageTransition>
      <Confetti show={justSaved} />

      <div className="min-h-screen pb-32" style={{ backgroundColor: '#FAFAF7' }}>

        {/* 헤더 */}
        <header className="bg-white border-b border-stone-100 px-4 py-3 sticky top-0 z-20">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400">{event.name}</p>
              <p className="text-sm font-semibold text-stone-900">
                {session.name} 님의 기록
                {draftCount > 0 && (
                  <span className="ml-2 text-xs font-normal px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                    임시저장 {draftCount}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400">{completedCount}/{sections.length}</span>
              {session.sessionToken === 'creator' && (
                <MBtn onClick={() => router.push(`/events/${eventId}/schedule`)} className="text-xs px-3 py-1.5 border border-stone-200 rounded-full text-stone-600">
                  📋 목차 수정
                </MBtn>
              )}
              <MBtn onClick={() => router.push(`/flipbook/${eventId}`)} className="text-xs px-3 py-1.5 border border-stone-200 rounded-full text-stone-600">
                📖 플립북
              </MBtn>
              <MBtn onClick={() => router.push(`/essay/${eventId}`)} className="text-xs px-3 py-1.5 border border-stone-200 rounded-full text-stone-600">
                ✦ 에세이
              </MBtn>
            </div>
          </div>
        </header>

        <div className="max-w-lg mx-auto px-4 py-4 space-y-4">

          {/* 섹션 선택 뱃지 */}
          {selectedSection && (
            <button
              onClick={() => setSectionPickerOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{ backgroundColor: '#FFF8EC', border: '1px solid #F4A228' }}
            >
              {(() => {
                const isDone = existingEntries[selectedSection.id] && !existingEntries[selectedSection.id].is_draft
                const isDraft = existingEntries[selectedSection.id]?.is_draft
                return (
                  <>
                    <span style={{ color: '#F4A228' }}>
                      {isDone ? '✓' : isDraft ? '…' : `${selectedSection.order}.`}
                    </span>
                    <span className="text-stone-700 truncate max-w-[200px]">{selectedSection.book_title}</span>
                    <span className="text-stone-400 text-xs ml-auto">
                      {completedCount}/{sections.length} ▾
                    </span>
                  </>
                )
              })()}
            </button>
          )}

          {/* 섹션 선택 바텀시트 */}
          {sectionPickerOpen && (
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 60, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end' }}
              onClick={() => setSectionPickerOpen(false)}
            >
              <div
                style={{ width: '100%', backgroundColor: '#fff', borderRadius: '20px 20px 0 0', padding: '20px 0 40px', maxHeight: '70vh', overflowY: 'auto' }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ width: 36, height: 4, backgroundColor: '#e5e5e5', borderRadius: 2, margin: '0 auto 16px' }} />
                <p className="text-xs font-medium text-stone-400 px-5 mb-3">섹션 선택</p>
                {sections.map((s) => {
                  const isDone = existingEntries[s.id] && !existingEntries[s.id].is_draft
                  const isDraft = existingEntries[s.id]?.is_draft
                  const isActive = selectedSection?.id === s.id
                  return (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedSection(s); setSectionPickerOpen(false) }}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors"
                      style={{ backgroundColor: isActive ? '#FFF8EC' : 'transparent' }}
                    >
                      <span className="text-sm w-5 shrink-0" style={{ color: isDone ? '#22c55e' : isDraft ? '#D97706' : '#c7c3bf' }}>
                        {isDone ? '✓' : isDraft ? '…' : s.order}
                      </span>
                      <span className="flex-1 text-sm" style={{ color: isActive ? '#1A4F8A' : '#3d342e', fontWeight: isActive ? 600 : 400 }}>
                        {s.book_title}
                      </span>
                      {isDone && <span className="text-xs text-green-400">완료</span>}
                      {isDraft && !isDone && <span className="text-xs text-amber-400">임시</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {selectedSection && (
            <>
              {/* 섹션 정보 */}
              <div className="bg-white rounded-2xl p-4" style={{ borderLeft: '4px solid #F4A228', border: '1px solid #f0ece4', borderLeftWidth: '4px', borderLeftColor: '#F4A228' }}>
                <p className="font-semibold" style={{ color: '#1A1A2E' }}>{selectedSection.book_title}</p>
                <p className="text-xs text-stone-400 mt-0.5">{selectedSection.original_title}</p>
                {selectedSection.description && (
                  <p className="text-sm text-stone-500 mt-2">{selectedSection.description}</p>
                )}
              </div>

              {/* [2] 사진 다중 업로드 */}
              <div>
                <p className="text-xs font-medium text-stone-500 mb-2">사진 <span className="text-stone-300">(최대 3장, 길게 누르면 대표 사진 선택)</span></p>
                <div className="flex gap-3 pb-1">
                  {photos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="relative shrink-0"
                      style={{ width: '120px', height: '120px' }}
                      onContextMenu={e => { e.preventDefault(); setPrimaryIdx(idx) }}
                      onTouchStart={() => { longPressTimer.current = setTimeout(() => setPrimaryIdx(idx), 600) }}
                      onTouchEnd={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current) }}
                    >
                      <img
                        src={photo.preview}
                        className="w-full h-full object-cover rounded-xl"
                        style={{ border: idx === primaryIdx ? '2.5px solid #F4A228' : '2px solid #f0ece4' }}
                        alt=""
                      />
                      {idx === primaryIdx && (
                        <div className="absolute top-1.5 left-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#F4A228', color: '#fff' }}>
                          대표
                        </div>
                      )}
                      <button
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {photos.length < 3 && (
                    <button
                      onClick={() => multiPhotoRef.current?.click()}
                      className="shrink-0 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors"
                      style={{
                        width: '120px', height: '120px',
                        background: 'linear-gradient(160deg, #FEFCF8 0%, #FDF6EC 100%)',
                        border: '2px dashed #e5ddd0',
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>📷</span>
                      <span style={{ fontSize: '11px', color: '#b8a898' }}>{photos.length === 0 ? '사진 추가' : photos.length === 1 ? '보조 사진 추가' : '보조 사진 추가'}</span>
                    </button>
                  )}
                </div>
                <input
                  ref={multiPhotoRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => { addPhotosFromFiles(e.target.files); e.target.value = '' }}
                />
              </div>

              {/* [2] 메모 */}
              <div
                className="rounded-2xl p-4"
                style={{ backgroundColor: '#FEFCF8', border: '1px solid #f0ece4', borderLeft: '3px solid #B8975A' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p style={{ fontSize: '11px', color: '#B8975A', letterSpacing: '0.08em', fontWeight: 500 }}>메모</p>
                  {saved && <span style={{ fontSize: '11px', color: '#c7c3bf' }}>자동 저장됨</span>}
                </div>
                <p style={{ fontSize: '11px', color: '#c7c3bf', marginBottom: '10px' }}>{todayStr}</p>
                <textarea
                  ref={textareaRef}
                  value={memo}
                  onChange={e => handleMemoChange(e.target.value)}
                  placeholder="오늘 이 순간, 어떤 마음이었나요..."
                  style={{
                    width: '100%', minHeight: '120px', backgroundColor: 'transparent',
                    border: 'none', outline: 'none', resize: 'none',
                    fontSize: '15px', lineHeight: 1.8, color: '#3d342e',
                    fontFamily: "'Noto Serif KR', serif", overflow: 'hidden',
                  }}
                />
                <p className="text-right" style={{ fontSize: '11px', color: '#c7c3bf', marginTop: '6px' }}>{memo.length}자</p>

                {/* [4] 감정 태그 */}
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0ece4' }}>
                  <p style={{ fontSize: '11px', color: '#c7c3bf', marginBottom: '8px' }}>이 순간의 감정</p>
                  <div className="flex gap-2 flex-wrap">
                    {EMOTIONS.map(({ emoji, label }) => {
                      const selected = emotions.includes(emoji)
                      return (
                        <button
                          key={emoji}
                          onClick={() => toggleEmotion(emoji)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors"
                          style={{
                            backgroundColor: selected ? '#FEF3C7' : '#f5f0ea',
                            color: selected ? '#92400E' : '#9e9690',
                            border: selected ? '1px solid #F4A228' : '1px solid transparent',
                            fontWeight: selected ? 600 : 400,
                          }}
                        >
                          <span>{emoji}</span>
                          <span>{label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* AI 에세이 */}
              <div className="bg-white rounded-2xl border border-stone-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-stone-700">AI 에세이</p>
                  <CtaBtn
                    onClick={handleGenerateEssay}
                    disabled={generatingEssay || !memo.trim()}
                    className="text-xs px-3 py-1.5 rounded-full transition-colors disabled:bg-stone-100 disabled:text-stone-400 bg-brand-cta text-white hover:bg-brand-cta/90"
                  >
                    {generatingEssay ? (
                      <span className="flex items-center gap-1.5">
                        <span className="inline-block w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        생성 중<TypingCursor />
                      </span>
                    ) : aiEssay ? '다시 생성' : '✨ AI 이어쓰기'}
                  </CtaBtn>
                </div>
                {pendingEssay ? (
                  <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <p className="text-xs text-amber-600 font-medium mb-2">AI 초안 — 반영하시겠어요?</p>
                      <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{pendingEssay}</p>
                    </div>
                    <div className="flex gap-2">
                      <MBtn
                        onClick={async () => {
                          const existing = selectedSection ? existingEntries[selectedSection.id] : null
                          if (existing?.id) {
                            const supabase = (await import('@/lib/supabase/client')).createClient()
                            await supabase.from('entries').update({ ai_essay: pendingEssay }).eq('id', existing.id)
                            setExistingEntries(prev => ({ ...prev, [selectedSection!.id]: { ...existing, ai_essay: pendingEssay } }))
                          }
                          setAiEssay(pendingEssay)
                          setPendingEssay('')
                        }}
                        className="flex-1 py-2 bg-brand-primary text-white text-sm font-medium rounded-xl"
                      >
                        ✓ 반영
                      </MBtn>
                      <MBtn onClick={() => setPendingEssay('')} className="flex-1 py-2 bg-stone-100 text-stone-500 text-sm font-medium rounded-xl">
                        ✗ 취소
                      </MBtn>
                    </div>
                  </div>
                ) : aiEssay ? (
                  <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{aiEssay}</p>
                ) : (
                  <p className="text-sm text-stone-300">메모를 저장하고 AI가 이어 써드립니다.</p>
                )}
              </div>

              {(error || aiError) && <p className="text-red-500 text-sm">{error || aiError}</p>}
            </>
          )}
        </div>

        {/* 하단 버튼: 임시저장 + 저장 */}
        {selectedSection && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 px-4 py-3" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
            <div className="max-w-lg mx-auto flex items-center gap-2">
              {/* [3] 임시저장 */}
              <button
                onClick={() => saveDraft(memo, photos, emotions)}
                disabled={draftSaving || !memo.trim()}
                className="py-3 px-4 text-sm font-medium rounded-xl border transition-colors disabled:opacity-40"
                style={{ borderColor: '#e8e5e0', color: '#9e9690', backgroundColor: '#fafaf7' }}
              >
                {draftSaving ? '저장 중' : '임시저장'}
              </button>

              {/* 기록 저장 */}
              <CtaBtn
                onClick={handleSubmit}
                disabled={saving || (!memo.trim() && photos.length === 0 && !aiEssay) || !!isSaved}
                className="flex-1 py-3 text-sm font-medium rounded-xl transition-colors"
                style={isSaved
                  ? { backgroundColor: '#f5f5f3', color: '#a8a29e', border: '1px solid #e8e5e0' }
                  : { backgroundColor: '#E65100', color: '#fff', opacity: ((!memo.trim() && photos.length === 0 && !aiEssay) || saving) ? 0.4 : 1 }
                }
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    저장 중...
                  </span>
                ) : isSaved
                  ? <span className="flex items-center justify-center gap-1.5">✓ <span style={{ fontWeight: 400 }}>기록 완료</span></span>
                  : '기록 저장하기'
                }
              </CtaBtn>
              <SuccessCheck show={justSaved} />
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}

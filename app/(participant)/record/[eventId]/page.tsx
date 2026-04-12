'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { GraceSection, GraceEntry } from '@/types'
import { PageTransition, MBtn } from '@/components/ui/motion'
import PhotoCropModal from '@/components/ui/PhotoCropModal'

// 카테고리별 가이드 질문
const GUIDE_QUESTIONS: Record<string, string[]> = {
  '수련회': ['오늘 말씀 중 마음에 남은 구절은?', '하나님께서 내게 하신 말씀은?', '결단하고 싶은 것이 있다면?'],
  '선교': ['오늘 만난 사람들을 통해 무엇을 느꼈나요?', '하나님의 역사를 어디서 보았나요?', '내 마음에 남은 기도제목은?'],
  '캠프': ['오늘 가장 기억에 남는 순간은?', '새롭게 깨달은 것은 무엇인가요?', '집에 돌아가서 실천할 것은?'],
  '예배': ['오늘 말씀의 핵심 메시지는?', '내 삶에 적용할 수 있는 것은?', '하나님께 드리고 싶은 감사는?'],
  '모임': ['오늘 나눔 중 마음에 남은 것은?', '서로에게 배운 점은 무엇인가요?', '함께 기도하고 싶은 제목은?'],
  '개인': ['오늘 묵상한 말씀은?', '하나님과 나눈 이야기는?', '오늘 하루 감사한 것은?'],
}

interface ParticipantSession {
  participantId: string
  sessionToken: string
  name: string
}

export default function RecordPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  const [session, setSession] = useState<ParticipantSession | null>(null)
  const [event, setEvent] = useState<{ id: string; name: string; category: string; status: string } | null>(null)
  const [sections, setSections] = useState<GraceSection[]>([])
  const [selectedSection, setSelectedSection] = useState<GraceSection | null>(null)
  const [existingEntries, setExistingEntries] = useState<Record<string, GraceEntry>>({})

  // 폼 상태
  const [bodyText, setBodyText] = useState('')
  const [bibleVerse, setBibleVerse] = useState('')
  const [quoteText, setQuoteText] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)

  const [sectionPickerOpen, setSectionPickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [error, setError] = useState('')

  // 총평 상태
  const [summaryText, setSummaryText] = useState('')
  const [summaryPhotoFile, setSummaryPhotoFile] = useState<File | null>(null)
  const [summaryPhotoPreview, setSummaryPhotoPreview] = useState<string | null>(null)
  const [summarySaving, setSummarySaving] = useState(false)
  const [summarySaved, setSummarySaved] = useState(false)
  const [summaryCropSrc, setSummaryCropSrc] = useState<string | null>(null)
  const [summaryEntryId, setSummaryEntryId] = useState<string | null>(null)

  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const summaryCameraRef = useRef<HTMLInputElement>(null)
  const summaryGalleryRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 세션 복원
  useEffect(() => {
    const raw = localStorage.getItem(`grace_participant_${eventId}`)
    if (!raw) { router.push(`/join/${eventId}`); return }
    setSession(JSON.parse(raw))
  }, [eventId, router])

  // 이벤트 + 섹션 + 기존 기록 로드
  useEffect(() => {
    if (!session) return
    async function load() {
      const supabase = createClient()
      const [{ data: ev }, { data: secs }, { data: ents }] = await Promise.all([
        supabase.from('grace_events').select('id, name, category, status').eq('id', eventId).single(),
        supabase.from('grace_sections').select('*').eq('event_id', eventId).order('order'),
        supabase.from('grace_entries').select('*').eq('participant_id', session!.participantId),
      ])
      if (ev) setEvent(ev)
      if (secs && secs.length > 0) {
        setSections(secs)
        setSelectedSection(secs[0])
      }
      if (ents) {
        const map: Record<string, GraceEntry> = {}
        ents.forEach((e: GraceEntry) => {
          if (e.section_id) map[e.section_id] = e
          else {
            // section_id = null → 총평 엔트리
            setSummaryText(e.body_text ?? '')
            setSummaryPhotoPreview(e.photo_url ?? null)
            setSummaryEntryId(e.id)
          }
        })
        setExistingEntries(map)
      }
    }
    load()
  }, [session, eventId])

  // 섹션 변경 시 기존 데이터 복원
  useEffect(() => {
    if (!selectedSection) return
    const existing = existingEntries[selectedSection.id]
    setBodyText(existing?.body_text ?? '')
    setBibleVerse(existing?.bible_verse ?? '')
    setQuoteText(existing?.quote_text ?? '')
    setPhotoPreview(existing?.photo_url ?? null)
    setPhotoFile(null)
    setJustSaved(false)
  }, [selectedSection?.id])

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // 크롭 모달로 넘기기 위해 objectURL만 생성
    setCropSrc(URL.createObjectURL(file))
    // input 초기화 (같은 파일 재선택 가능하도록)
    e.target.value = ''
  }

  // 공통 저장 헬퍼 (서버 API 경유 → RLS 우회)
  async function saveEntry({
    sectionId, bodyText: bt, bibleVerse: bv, quoteText: qt, photoUrl, isDraft,
  }: {
    sectionId: string | null
    bodyText: string
    bibleVerse: string
    quoteText: string
    photoUrl: string | null
    isDraft: boolean
  }) {
    if (!session) return null
    const res = await fetch('/api/save-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participantId: session.participantId,
        eventId,
        sectionId,
        bodyText: bt.trim() || null,
        bibleVerse: bv.trim() || null,
        quoteText: qt.trim() || null,
        photoUrl,
        isDraft,
      }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? '저장 실패')
    return json.entry
  }

  async function uploadPhoto(file: File, path: string): Promise<string | null> {
    const form = new FormData()
    form.append('file', file)
    form.append('path', path)
    const res = await fetch('/api/upload-photo', { method: 'POST', body: form })
    if (!res.ok) return null
    return (await res.json()).url ?? null
  }

  async function handleCropConfirm(croppedFile: File) {
    setPhotoPreview(URL.createObjectURL(croppedFile))
    setCropSrc(null)
    if (!session || !selectedSection) return
    const path = `grace_entries/${session.participantId}/${selectedSection.id}.jpg`
    const photoUrl = await uploadPhoto(croppedFile, path)
    if (!photoUrl) return
    const saved = await saveEntry({
      sectionId: selectedSection.id, bodyText, bibleVerse, quoteText, photoUrl, isDraft: true,
    }).catch(() => null)
    if (saved) setExistingEntries(prev => ({ ...prev, [selectedSection.id]: saved }))
    setPhotoPreview(photoUrl)
  }

  // 자동저장 트리거 (입력 멈춤 2초 후)
  useEffect(() => {
    if (!selectedSection || (!bodyText && !bibleVerse && !quoteText)) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(async () => {
      if (!session || !selectedSection) return
      if (!bodyText.trim() && !bibleVerse.trim() && !quoteText.trim()) return
      setAutoSaveStatus('saving')
      try {
        const photoUrl = existingEntries[selectedSection.id]?.photo_url ?? null
        const saved = await saveEntry({
          sectionId: selectedSection.id, bodyText, bibleVerse, quoteText, photoUrl, isDraft: true,
        })
        if (saved) setExistingEntries(prev => ({ ...prev, [selectedSection.id]: saved }))
        setAutoSaveStatus('saved')
        setTimeout(() => setAutoSaveStatus('idle'), 2000)
      } catch {
        setAutoSaveStatus('idle')
      }
    }, 2000)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [bodyText, bibleVerse, quoteText])

  // 섹션 전환 시 현재 내용 자동 저장
  const switchSection = useCallback(async (s: GraceSection) => {
    if (selectedSection && session && (bodyText.trim() || bibleVerse.trim() || quoteText.trim())) {
      try {
        const photoUrl = existingEntries[selectedSection.id]?.photo_url ?? null
        const saved = await saveEntry({
          sectionId: selectedSection.id, bodyText, bibleVerse, quoteText, photoUrl, isDraft: true,
        })
        if (saved) setExistingEntries(prev => ({ ...prev, [selectedSection.id]: saved }))
      } catch { /* 무시 */ }
    }
    setSelectedSection(s)
    setSectionPickerOpen(false)
  }, [selectedSection, session, bodyText, bibleVerse, quoteText, existingEntries, eventId])

  async function handleSave(isDraft = false) {
    if (!session || !selectedSection) return
    if (!bodyText.trim() && !photoPreview && !bibleVerse.trim() && !quoteText.trim()) return
    setSaving(true)
    setError('')

    try {
      const photoUrl = existingEntries[selectedSection.id]?.photo_url ?? null
      const saved = await saveEntry({
        sectionId: selectedSection.id, bodyText, bibleVerse, quoteText, photoUrl, isDraft,
      })
      if (saved) {
        setExistingEntries(prev => ({ ...prev, [selectedSection.id]: saved }))
        if (!isDraft) {
          setJustSaved(true)
          setTimeout(() => setJustSaved(false), 2000)
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSummarySave() {
    if (!session || (!summaryText.trim() && !summaryPhotoPreview)) return
    setSummarySaving(true)
    try {
      const saved = await saveEntry({
        sectionId: null,
        bodyText: summaryText,
        bibleVerse: '',
        quoteText: '',
        photoUrl: summaryPhotoPreview,
        isDraft: false,
      })
      if (saved) setSummaryEntryId(saved.id)
      setSummarySaved(true)
      setTimeout(() => setSummarySaved(false), 2000)
    } catch {
      /* 무시 */
    } finally {
      setSummarySaving(false)
    }
  }

  const completedCount = Object.values(existingEntries).filter(e => !e.is_draft).length

  if (!session || !event) {
    return (
      <div className="min-h-screen bg-[#FDFAF5] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#E8D5A3] border-t-[#C9A84C] rounded-full animate-spin" />
      </div>
    )
  }

  if (sections.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFAF5] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-[#3D2B1F] font-medium">아직 목차가 준비되지 않았어요.</p>
          <p className="text-[#8C6E55] text-sm mt-2">리더님이 섹션을 추가하면 기록을 시작할 수 있어요.</p>
        </div>
      </div>
    )
  }

  const currentEntry = selectedSection ? existingEntries[selectedSection.id] : null
  const isSaved = currentEntry && !currentEntry.is_draft
  const guideQuestions = GUIDE_QUESTIONS[event.category] ?? GUIDE_QUESTIONS['개인']
  const sectionIndex = sections.findIndex(s => s.id === selectedSection?.id)
  const isFirstSection = sectionIndex === 0
  const hasPhoto = !!photoPreview
  const hasText = !!bodyText.trim()
  const hasBible = !!bibleVerse.trim()

  const inputCls = "w-full px-4 py-3 border border-[#E8D5A3] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 bg-white text-[#3D2B1F] placeholder-[#C9B990]"

  return (
    <PageTransition>
      {/* 크롭 모달 */}
      {cropSrc && (
        <PhotoCropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}

      <div className="min-h-screen bg-[#FDFAF5] pb-32">

        {/* 헤더 */}
        <header className="bg-[#FDFAF5]/95 backdrop-blur border-b border-[#E8D5A3] px-4 py-3 sticky top-0 z-20">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs text-[#8C6E55] truncate">{event.name}</p>
              <p className="text-sm font-semibold text-[#3D2B1F]">{session.name} 님의 기록</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {autoSaveStatus === 'saving' && <span className="text-[10px] text-[#C9B990]">저장 중...</span>}
              {autoSaveStatus === 'saved' && <span className="text-[10px] text-emerald-500">✓ 자동저장</span>}
              <span className="text-xs text-[#8C6E55]">{completedCount}/{sections.length}</span>
              <button
                onClick={() => router.push(`/flipbook/${eventId}`)}
                className="text-xs px-3 py-1.5 border border-[#E8D5A3] rounded-full text-[#8C6E55] hover:border-[#C9A84C] transition-colors"
              >
                📖 플립북
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-lg mx-auto px-4 py-4 space-y-4">

          {/* 섹션 선택 버튼 */}
          {selectedSection && (
            <button
              onClick={() => setSectionPickerOpen(true)}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-[#C9A84C] bg-[#F5EFE4] text-left"
            >
              <span className="text-[#A8853A] font-semibold text-sm w-5 shrink-0">
                {isSaved ? '✓' : currentEntry?.is_draft ? '…' : `${selectedSection.order}.`}
              </span>
              <span className="flex-1 text-sm font-medium text-[#3D2B1F] truncate">{selectedSection.title}</span>
              {selectedSection.section_date && (
                <span className="text-xs text-[#8C6E55] shrink-0">{selectedSection.section_date}</span>
              )}
              <span className="text-[#A8853A] text-sm shrink-0">▾</span>
            </button>
          )}

          {/* 섹션 선택 바텀시트 */}
          {sectionPickerOpen && (
            <div
              className="fixed inset-0 z-50 flex items-end"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              onClick={() => setSectionPickerOpen(false)}
            >
              <div
                className="w-full bg-white rounded-t-3xl overflow-y-auto"
                style={{ maxHeight: '70vh', paddingBottom: 'env(safe-area-inset-bottom)' }}
                onClick={e => e.stopPropagation()}
              >
                <div className="w-9 h-1 bg-[#E8D5A3] rounded-full mx-auto mt-3 mb-4" />
                <p className="text-xs font-medium text-[#8C6E55] px-5 mb-2">섹션 선택</p>
                {sections.map(s => {
                  const isDone = existingEntries[s.id] && !existingEntries[s.id].is_draft
                  const isDraft = existingEntries[s.id]?.is_draft
                  const isActive = selectedSection?.id === s.id
                  return (
                    <button
                      key={s.id}
                      onClick={() => switchSection(s)}
                      className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors active:bg-[#F5EFE4]"
                      style={{ backgroundColor: isActive ? '#F5EFE4' : 'transparent' }}
                    >
                      <span className="text-sm w-5 shrink-0 font-medium"
                        style={{ color: isDone ? '#22c55e' : isDraft ? '#C9A84C' : '#C9B990' }}>
                        {isDone ? '✓' : isDraft ? '…' : s.order}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm block truncate"
                          style={{ color: isActive ? '#A8853A' : '#3D2B1F', fontWeight: isActive ? 600 : 400 }}>
                          {s.title}
                        </span>
                        {s.section_date && <span className="text-xs text-[#8C6E55]">{s.section_date}</span>}
                      </div>
                      {isDone && <span className="text-xs text-emerald-500 shrink-0">완료</span>}
                      {isDraft && !isDone && <span className="text-xs text-[#C9A84C] shrink-0">임시</span>}
                    </button>
                  )
                })}
                <div className="h-6" />
              </div>
            </div>
          )}

          {selectedSection && (<>

            {/* 플립북 연동 안내 배너 */}
            <div className="rounded-2xl border px-4 py-3 flex items-start gap-3"
              style={{ backgroundColor: isFirstSection ? '#FBF8EE' : '#F5EFE4', borderColor: '#E8D5A3' }}>
              <span className="text-lg shrink-0">{isFirstSection ? '🏅' : '📄'}</span>
              <div>
                <p className="text-xs font-semibold text-[#A8853A]">
                  {isFirstSection ? '첫 번째 섹션 — 표지 페이지' : `${sectionIndex + 1}번째 섹션 — 플립북 P.${String(sectionIndex * 2 + 3).padStart(2, '0')}~${String(sectionIndex * 2 + 4).padStart(2, '0')}`}
                </p>
                <p className="text-xs text-[#8C6E55] mt-0.5 leading-relaxed">
                  {isFirstSection
                    ? '이 섹션의 사진이 플립북 표지 배경이 됩니다. 가장 인상적인 사진을 올려주세요.'
                    : '사진(왼쪽)과 묵상 기록(오른쪽)이 한 세트로 완성됩니다.'}
                </p>
              </div>
            </div>

            {/* 완성도 체크 */}
            <div className="flex gap-2">
              {[
                { label: '사진', done: hasPhoto },
                { label: '기록', done: hasText },
                { label: '말씀', done: hasBible },
              ].map(item => (
                <div key={item.label} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border text-xs font-medium transition-colors"
                  style={item.done
                    ? { backgroundColor: '#F0FDF4', borderColor: '#86EFAC', color: '#16A34A' }
                    : { backgroundColor: 'white', borderColor: '#E8D5A3', color: '#C9B990' }}>
                  {item.done ? '✓' : '○'} {item.label}
                </div>
              ))}
            </div>

            {/* ① 사진 (맨 먼저) */}
            <div className="bg-white border border-[#E8D5A3] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-[#8C6E55]">
                  📷 사진 <span className="text-[#C9B990] font-normal">(플립북 왼쪽 페이지 전체)</span>
                </label>
                {isFirstSection && !hasPhoto && (
                  <span className="text-[10px] bg-[#FBF8EE] text-[#C9A84C] border border-[#E8D5A3] rounded-full px-2 py-0.5">표지 배경</span>
                )}
              </div>
              {photoPreview ? (
                <div className="relative">
                  <img src={photoPreview} alt="첨부 사진" className="w-full rounded-xl object-cover" style={{ aspectRatio: '3/4' }} />
                  {isFirstSection && (
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">표지 배경</div>
                  )}
                  <button onClick={() => { setPhotoPreview(null); setPhotoFile(null) }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center text-sm">×</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => cameraRef.current?.click()}
                    className="flex-1 py-6 rounded-2xl border-2 border-dashed flex flex-col items-center gap-1.5 active:bg-[#F5EFE4] transition-colors"
                    style={{ borderColor: isFirstSection ? '#C9A84C' : '#E8D5A3' }}>
                    <span className="text-xl">📷</span>
                    <span className="text-xs text-[#8C6E55]">촬영하기</span>
                  </button>
                  <button onClick={() => galleryRef.current?.click()}
                    className="flex-1 py-6 rounded-2xl border-2 border-dashed flex flex-col items-center gap-1.5 active:bg-[#F5EFE4] transition-colors"
                    style={{ borderColor: isFirstSection ? '#C9A84C' : '#E8D5A3' }}>
                    <span className="text-xl">🖼️</span>
                    <span className="text-xs text-[#8C6E55]">앨범 / 파일</span>
                  </button>
                </div>
              )}
              {/* 카메라 전용 (모바일 직접 촬영) */}
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
              {/* 갤러리 / 파일 선택 (앨범, 노트북 파일 등) */}
              <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>

            {/* ② 가이드 질문 */}
            <div className="bg-[#F5EFE4] border border-[#E8D5A3] rounded-2xl p-4">
              <p className="text-xs font-medium text-[#A8853A] mb-2">✦ 기록 가이드 — 아래 질문을 참고해 작성해보세요</p>
              <ul className="space-y-1">
                {guideQuestions.map((q, i) => (
                  <li key={i} className="text-xs text-[#8C6E55]">· {q}</li>
                ))}
              </ul>
            </div>

            {/* ③ 본문 작성 */}
            <div className="bg-white border border-[#E8D5A3] rounded-2xl p-4">
              <label className="block text-xs font-medium text-[#8C6E55] mb-1">✍️ 묵상 기록</label>
              <p className="text-[11px] text-[#C9B990] mb-2">플립북 오른쪽 페이지 본문이 됩니다.</p>
              <textarea
                ref={textareaRef}
                value={bodyText}
                onChange={e => { setBodyText(e.target.value); autoResize() }}
                placeholder="오늘 하나님께서 내게 말씀하신 것, 느낀 것, 결단한 것을 자유롭게 적어주세요."
                className="w-full border-none outline-none resize-none text-sm text-[#3D2B1F] placeholder-[#C9B990] bg-transparent leading-relaxed"
                style={{ minHeight: '140px', fontSize: '15px', lineHeight: 1.8 }}
              />
              <p className="text-right text-xs text-[#C9B990] mt-2">{bodyText.length}자</p>
            </div>

            {/* ④ 성경 구절 */}
            <div className="bg-white border border-[#E8D5A3] rounded-2xl p-4">
              <label className="block text-xs font-medium text-[#8C6E55] mb-1">
                📖 성경 구절 <span className="text-[#C9B990] font-normal">(선택 · 플립북 말씀 박스)</span>
              </label>
              <p className="text-[11px] text-[#C9B990] mb-2">형식: <span className="font-medium">구절 내용 — 성경 장절</span> (예: 하나님이 세상을 이처럼 사랑하사 — 요한복음 3:16)</p>
              <input
                value={bibleVerse}
                onChange={e => setBibleVerse(e.target.value)}
                placeholder="하나님이 세상을 이처럼 사랑하사 — 요한복음 3:16"
                className={inputCls}
              />
            </div>

            {/* ⑤ 인용문 */}
            <div className="bg-white border border-[#E8D5A3] rounded-2xl p-4">
              <label className="block text-xs font-medium text-[#8C6E55] mb-1">
                💬 인상 깊은 말 <span className="text-[#C9B990] font-normal">(선택)</span>
              </label>
              <p className="text-[11px] text-[#C9B990] mb-2">설교나 나눔 중 기억에 남는 말씀이나 문장을 적어주세요.</p>
              <input
                value={quoteText}
                onChange={e => setQuoteText(e.target.value)}
                placeholder="설교나 나눔 중 기억에 남는 말을 적어주세요."
                className={inputCls}
              />
            </div>

            {error && <p className="text-red-500 text-sm px-1">{error}</p>}

          </>)}

          {/* ── 마무리 총평 카드 (섹션 무관, 항상 표시) ── */}
          {sections.length > 0 && (
            <div className="bg-white border-2 border-dashed border-[#C9A84C]/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-base">✦</span>
                <div>
                  <p className="text-sm font-semibold text-[#3D2B1F]">마무리 총평</p>
                  <p className="text-[11px] text-[#8C6E55]">플립북 마지막 페이지에 들어갑니다. 사진과 글을 남겨주세요.</p>
                </div>
              </div>

              {/* 총평 사진 */}
              {summaryPhotoPreview ? (
                <div className="relative">
                  <img src={summaryPhotoPreview} alt="총평 사진" className="w-full rounded-xl object-cover" style={{ aspectRatio: '3/4' }} />
                  <button onClick={() => { setSummaryPhotoPreview(null); setSummaryPhotoFile(null) }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center text-sm">×</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => summaryCameraRef.current?.click()}
                    className="flex-1 py-5 rounded-2xl border-2 border-dashed border-[#E8D5A3] flex flex-col items-center gap-1.5 active:bg-[#F5EFE4]">
                    <span className="text-xl">📷</span>
                    <span className="text-xs text-[#8C6E55]">촬영하기</span>
                  </button>
                  <button onClick={() => summaryGalleryRef.current?.click()}
                    className="flex-1 py-5 rounded-2xl border-2 border-dashed border-[#E8D5A3] flex flex-col items-center gap-1.5 active:bg-[#F5EFE4]">
                    <span className="text-xl">🖼️</span>
                    <span className="text-xs text-[#8C6E55]">앨범 / 파일</span>
                  </button>
                </div>
              )}
              <input ref={summaryCameraRef} type="file" accept="image/*" capture="environment" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) { setSummaryCropSrc(URL.createObjectURL(f)); e.target.value = '' } }} />
              <input ref={summaryGalleryRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) { setSummaryCropSrc(URL.createObjectURL(f)); e.target.value = '' } }} />

              {/* 총평 텍스트 */}
              <textarea
                value={summaryText}
                onChange={e => setSummaryText(e.target.value)}
                placeholder="이번 여정을 마치며 느낀 것, 감사한 것, 앞으로의 결단을 자유롭게 적어주세요."
                className="w-full px-4 py-3 border border-[#E8D5A3] rounded-2xl text-sm text-[#3D2B1F] placeholder-[#C9B990] bg-[#FDFAF5] outline-none resize-none leading-relaxed"
                style={{ minHeight: '120px', fontSize: '15px', lineHeight: 1.8 }}
              />

              <button
                onClick={handleSummarySave}
                disabled={summarySaving || (!summaryText.trim() && !summaryPhotoPreview && !summaryPhotoFile)}
                className="w-full py-3.5 text-sm font-semibold rounded-2xl transition-colors disabled:opacity-40"
                style={summarySaved
                  ? { backgroundColor: '#22c55e', color: '#fff' }
                  : { backgroundColor: '#C9A84C', color: '#fff' }}
              >
                {summarySaving ? '저장 중...' : summarySaved ? '✓ 총평 저장완료!' : '총평 저장하기'}
              </button>
            </div>
          )}

          {/* 총평 사진 크롭 모달 */}
          {summaryCropSrc && (
            <PhotoCropModal
              imageSrc={summaryCropSrc}
              onConfirm={async file => {
                setSummaryPhotoPreview(URL.createObjectURL(file))
                setSummaryCropSrc(null)
                if (!session) return
                const path = `grace_entries/${session.participantId}/summary.jpg`
                const url = await uploadPhoto(file, path)
                if (url) setSummaryPhotoPreview(url)
                setSummaryPhotoFile(url ? null : file)
              }}
              onCancel={() => setSummaryCropSrc(null)}
            />
          )}
        </div>

        {/* 하단 고정 버튼 */}
        {selectedSection && (
          <div
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8D5A3] px-4 py-3"
            style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
          >
            <div className="max-w-lg mx-auto flex gap-2">
              <MBtn
                onClick={() => handleSave(false)}
                disabled={saving || (!bodyText.trim() && !photoPreview && !bibleVerse.trim() && !quoteText.trim())}
                className="flex-1 py-3.5 text-sm font-semibold rounded-2xl transition-colors disabled:opacity-40"
                style={justSaved
                  ? { backgroundColor: '#22c55e', color: '#fff' }
                  : isSaved
                  ? { backgroundColor: '#F5EFE4', color: '#A8853A', border: '1px solid #E8D5A3' }
                  : { backgroundColor: '#C9A84C', color: '#fff' }
                }
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    저장 중...
                  </span>
                ) : justSaved
                  ? '✓ 저장완료!'
                  : isSaved
                  ? '✓ 기록 완료'
                  : '기록 저장하기'
                }
              </MBtn>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}

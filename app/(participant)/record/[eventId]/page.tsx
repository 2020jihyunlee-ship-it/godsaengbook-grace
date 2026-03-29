'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { GraceSection, GraceEntry } from '@/types'
import { PageTransition, MBtn } from '@/components/ui/motion'

// 카테고리별 가이드 질문
const GUIDE_QUESTIONS: Record<string, string[]> = {
  '수련회': ['오늘 말씀 중 마음에 남은 구절은?', '하나님께서 내게 하신 말씀은?', '결단하고 싶은 것이 있다면?'],
  '선교여행': ['오늘 만난 사람들을 통해 무엇을 느꼈나요?', '하나님의 역사를 어디서 보았나요?', '내 마음에 남은 기도제목은?'],
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

  const [sectionPickerOpen, setSectionPickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [error, setError] = useState('')

  const photoRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSave(isDraft = false) {
    if (!session || !selectedSection) return
    if (!bodyText.trim() && !photoFile && !photoPreview && !bibleVerse.trim() && !quoteText.trim()) return
    setSaving(true)
    setError('')

    const supabase = createClient()
    let photoUrl = existingEntries[selectedSection.id]?.photo_url ?? null

    // 사진 업로드
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const safeExt = ['jpg','jpeg','png','gif','webp','heic','heif'].includes(ext) ? ext : 'jpg'
      const path = `grace_entries/${session.participantId}/${selectedSection.id}.${safeExt}`
      const { error: uploadErr } = await supabase.storage
        .from('photos').upload(path, photoFile, { upsert: true })
      if (uploadErr) {
        setError(`사진 업로드 실패: ${uploadErr.message}`)
        setSaving(false)
        return
      }
      const { data } = supabase.storage.from('photos').getPublicUrl(path)
      photoUrl = data.publicUrl
    }

    const payload = {
      event_id: eventId,
      section_id: selectedSection.id,
      participant_id: session.participantId,
      body_text: bodyText.trim() || null,
      bible_verse: bibleVerse.trim() || null,
      quote_text: quoteText.trim() || null,
      photo_url: photoUrl,
      is_draft: isDraft,
    }

    const existing = existingEntries[selectedSection.id]
    let savedEntry: GraceEntry | null = null
    if (existing) {
      const { data } = await supabase.from('grace_entries').update(payload).eq('id', existing.id).select().single()
      savedEntry = data
    } else {
      const { data } = await supabase.from('grace_entries').insert(payload).select().single()
      savedEntry = data
    }

    if (savedEntry) {
      setExistingEntries(prev => ({ ...prev, [selectedSection.id]: savedEntry! }))
      if (photoUrl) setPhotoPreview(photoUrl)
      setPhotoFile(null)

      if (!isDraft) {
        // record_count 갱신
        const count = Object.values({ ...existingEntries, [selectedSection.id]: savedEntry })
          .filter(e => !e.is_draft).length
        await supabase.from('grace_participants').update({ record_count: count }).eq('id', session.participantId)

        setJustSaved(true)
        setTimeout(() => setJustSaved(false), 2000)
      }
    }

    setSaving(false)
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

  const inputCls = "w-full px-4 py-3 border border-[#E8D5A3] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 bg-white text-[#3D2B1F] placeholder-[#C9B990]"

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FDFAF5] pb-32">

        {/* 헤더 */}
        <header className="bg-[#FDFAF5]/95 backdrop-blur border-b border-[#E8D5A3] px-4 py-3 sticky top-0 z-20">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs text-[#8C6E55] truncate">{event.name}</p>
              <p className="text-sm font-semibold text-[#3D2B1F]">{session.name} 님의 기록</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
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
                      onClick={() => { setSelectedSection(s); setSectionPickerOpen(false) }}
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

            {/* 가이드 질문 */}
            <div className="bg-[#F5EFE4] border border-[#E8D5A3] rounded-2xl p-4">
              <p className="text-xs font-medium text-[#A8853A] mb-2">✦ 기록 가이드</p>
              <ul className="space-y-1">
                {guideQuestions.map((q, i) => (
                  <li key={i} className="text-xs text-[#8C6E55]">· {q}</li>
                ))}
              </ul>
            </div>

            {/* 본문 작성 */}
            <div className="bg-white border border-[#E8D5A3] rounded-2xl p-4">
              <label className="block text-xs font-medium text-[#8C6E55] mb-2">묵상 기록</label>
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

            {/* 성경 구절 */}
            <div className="bg-white border border-[#E8D5A3] rounded-2xl p-4">
              <label className="block text-xs font-medium text-[#8C6E55] mb-2">
                성경 구절 <span className="text-[#C9B990] font-normal">(선택)</span>
              </label>
              <input
                value={bibleVerse}
                onChange={e => setBibleVerse(e.target.value)}
                placeholder="요한복음 3:16 — 하나님이 세상을 이처럼 사랑하사..."
                className={inputCls}
              />
            </div>

            {/* 인용문 */}
            <div className="bg-white border border-[#E8D5A3] rounded-2xl p-4">
              <label className="block text-xs font-medium text-[#8C6E55] mb-2">
                인상 깊은 말 / 인용구 <span className="text-[#C9B990] font-normal">(선택)</span>
              </label>
              <input
                value={quoteText}
                onChange={e => setQuoteText(e.target.value)}
                placeholder="설교나 나눔 중 기억에 남는 말을 적어주세요."
                className={inputCls}
              />
            </div>

            {/* 사진 */}
            <div className="bg-white border border-[#E8D5A3] rounded-2xl p-4">
              <label className="block text-xs font-medium text-[#8C6E55] mb-3">
                사진 <span className="text-[#C9B990] font-normal">(선택)</span>
              </label>
              {photoPreview ? (
                <div className="relative">
                  <img src={photoPreview} alt="첨부 사진" className="w-full rounded-xl object-cover max-h-64" />
                  <button
                    onClick={() => { setPhotoPreview(null); setPhotoFile(null) }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => photoRef.current?.click()}
                  className="w-full py-8 rounded-2xl border-2 border-dashed border-[#E8D5A3] flex flex-col items-center gap-2 active:bg-[#F5EFE4] transition-colors"
                >
                  <span className="text-2xl">📷</span>
                  <span className="text-xs text-[#8C6E55]">카메라 또는 앨범에서 선택</span>
                </button>
              )}
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            {error && <p className="text-red-500 text-sm px-1">{error}</p>}

          </>)}
        </div>

        {/* 하단 고정 버튼 */}
        {selectedSection && (
          <div
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8D5A3] px-4 py-3"
            style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
          >
            <div className="max-w-lg mx-auto flex gap-2">
              <MBtn
                onClick={() => handleSave(true)}
                disabled={saving}
                className="px-4 py-3.5 text-sm font-medium rounded-2xl border border-[#E8D5A3] text-[#8C6E55] bg-white disabled:opacity-50 transition-colors"
              >
                임시저장
              </MBtn>
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

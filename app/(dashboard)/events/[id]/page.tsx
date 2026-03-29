'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import QRCodeDisplay from '@/components/QRCodeDisplay'
import type { Event, Section, Participant, GroupContent } from '@/types'
import { PageTransition, MBtn, MCard } from '@/components/ui/motion'
import { type ThemeId } from '@/lib/themes'

const THEME_OPTIONS: { id: ThemeId; label: string; color: string }[] = [
  { id: 'luxe-cream', label: '럭스 크림', color: '#C8A96E' },
  { id: 'sacred',     label: '성스러운',  color: '#1A3A5C' },
  { id: 'adventure',  label: '탐험',      color: '#4A7C59' },
  { id: 'editorial',  label: '에디토리얼', color: '#1A4F8A' },
  { id: 'archive',    label: '아카이브',  color: '#8B6F4E' },
  { id: 'mission',    label: '미션',      color: '#D4703A' },
  { id: 'minimal',    label: '미니멀',    color: '#6B7280' },
]

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [contents, setContents] = useState<GroupContent[]>([])
  const [loading, setLoading] = useState(true)
  const [creatorUser, setCreatorUser] = useState<{ id: string; email: string; metaName: string } | null>(null)

  // 공지 업로드 상태
  const [noticeText, setNoticeText] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [statusChanging, setStatusChanging] = useState(false)
  const [openSections, setOpenSections] = useState(false)
  const [themeSaving, setThemeSaving] = useState(false)
  const [bookForm, setBookForm] = useState({ publisher_name: '', publisher_org: '', publish_date: '', copyright_text: '' })
  const [bookSaving, setBookSaving] = useState(false)
  const [bookSaved, setBookSaved] = useState(false)
  const [tab, setTab] = useState<'overview' | 'participants' | 'book' | 'publish'>('overview')
  const [creatorJoining, setCreatorJoining] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setCreatorUser({ id: user.id, email: user.email ?? '', metaName: (user.user_metadata?.name as string) ?? '' })

    const [{ data: ev }, { data: secs }, { data: parts }, { data: conts }] = await Promise.all([
      supabase.from('events').select('*').eq('id', id).eq('creator_id', user.id).single(),
      supabase.from('sections').select('*').eq('event_id', id).order('order'),
      supabase.from('participants').select('*').eq('event_id', id).order('created_at'),
      supabase.from('group_contents').select('*').eq('event_id', id).order('created_at', { ascending: false }),
    ])

    if (!ev) { router.push('/dashboard'); return }

    // QR URL이 현재 origin과 다르면 자동 갱신 (localhost → 배포 URL 등)
    if (ev.event_type === 'group') {
      const correctUrl = `${window.location.origin}/join/${id}`
      if (ev.qr_code_url !== correctUrl) {
        await supabase.from('events').update({ qr_code_url: correctUrl }).eq('id', id)
        ev.qr_code_url = correctUrl
      }
    }

    setEvent(ev)
    setBookForm({
      publisher_name: ev.publisher_name ?? '',
      publisher_org: ev.publisher_org ?? '',
      publish_date: ev.publish_date ?? '',
      copyright_text: ev.copyright_text ?? '',
    })
    setSections(secs ?? [])
    setParticipants(parts ?? [])
    setContents(conts ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  async function handleStatusChange(newStatus: Event['status']) {
    if (!event) return
    setStatusChanging(true)
    const res = await fetch(`/api/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      const data = await res.json()
      setEvent(data.event)
    }
    setStatusChanging(false)
  }

  async function handleUploadContent(type: 'notice' | 'photo') {
    if (type === 'notice' && !noticeText.trim()) return
    if (type === 'photo' && !photoFile) return
    setUploading(true)

    const fd = new FormData()
    fd.append('content_type', type)
    if (type === 'notice') fd.append('content_text', noticeText.trim())
    if (type === 'photo' && photoFile) fd.append('file', photoFile)

    const res = await fetch(`/api/events/${id}/contents`, { method: 'POST', body: fd })
    if (res.ok) {
      const data = await res.json()
      setContents(prev => [data.content, ...prev])
      setNoticeText('')
      setPhotoFile(null)
    }
    setUploading(false)
  }

  async function handleDeleteContent(contentId: string) {
    await fetch(`/api/events/${id}/contents?content_id=${contentId}`, { method: 'DELETE' })
    setContents(prev => prev.filter(c => c.id !== contentId))
  }

  async function handleBookSettingsSave() {
    setBookSaving(true)
    const supabase = createClient()
    await supabase.from('events').update(bookForm).eq('id', id)
    setEvent(prev => prev ? { ...prev, ...bookForm } : prev)
    setBookSaving(false)
    setBookSaved(true)
    setTimeout(() => setBookSaved(false), 2000)
  }

  async function handleThemeChange(themeId: ThemeId) {
    if (!event) return
    setThemeSaving(true)
    const supabase = createClient()
    await supabase.from('events').update({ theme: themeId }).eq('id', id)
    setEvent(prev => prev ? { ...prev, theme: themeId } : prev)
    setThemeSaving(false)
  }

  async function handleCreatorRecord() {
    if (!creatorUser || !event) return
    setCreatorJoining(true)
    const supabase = createClient()
    const { data: profile } = await supabase.from('users').select('name').eq('id', creatorUser.id).single()
    const creatorName = profile?.name?.trim() || creatorUser.metaName.trim() || '리더'

    // 이미 존재하는 참여자 레코드 찾기 (session_token 또는 이름으로)
    let participant = participants.find(p => p.session_token === 'creator') ?? participants.find(p => p.name === creatorName)
    if (!participant) {
      const { data, error } = await supabase.from('participants').insert({
        event_id: id,
        name: creatorName,
        sub_info: '리더',
        session_token: 'creator',
        record_count: 0,
      }).select().single()
      if (error) {
        // insert 실패 시 이미 존재하는 레코드 DB에서 직접 조회
        const { data: existing } = await supabase
          .from('participants').select('*')
          .eq('event_id', id).eq('session_token', 'creator').single()
        if (existing) {
          participant = existing
        } else {
          setCreatorJoining(false)
          return
        }
      } else if (data) {
        participant = data
        setParticipants(prev => [...prev, data])
      }
    }
    if (participant) {
      localStorage.setItem(`participant_${id}`, JSON.stringify({
        participantId: participant.id,
        name: participant.name,
        sessionToken: 'creator',
      }))
      router.push(`/record/${id}`)
    }
    setCreatorJoining(false)
  }

  async function handleDeleteParticipant(participantId: string, name: string) {
    if (!confirm(`"${name}" 참여자를 삭제할까요?\n(작성한 기록도 함께 삭제됩니다)`)) return
    const supabase = createClient()
    await supabase.from('entries').delete().eq('participant_id', participantId)
    await supabase.from('participants').delete().eq('id', participantId)
    setParticipants(prev => prev.filter(p => p.id !== participantId))
  }

  const statusLabel = { draft: '초안', active: '진행중', completed: '완료' }
  const statusColor = {
    active: 'bg-green-50 text-green-600',
    completed: 'bg-stone-100 text-stone-500',
    draft: 'bg-amber-50 text-amber-600',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
      </div>
    )
  }

  if (!event) return null

  const totalRecords = participants.reduce((sum, p) => sum + p.record_count, 0)
  const maxRecords = participants.length * (sections.length || 1)
  const completionPct = maxRecords > 0 ? Math.round((totalRecords / maxRecords) * 100) : 0
  const notStarted = participants.filter(p => p.record_count === 0)

  const TABS = [
    { key: 'overview',     label: '개요',    icon: '📊' },
    { key: 'participants', label: '참여자',   icon: '👥' },
    { key: 'book',         label: '책 설정',  icon: '🎨' },
    { key: 'publish',      label: '갓생북',   icon: '📚' },
  ] as const

  return (
    <PageTransition>
    <div className="min-h-screen" style={{ backgroundColor: '#F5F4F0' }}>

      {/* 헤더 */}
      <header className="bg-white border-b border-stone-100 px-4 py-3 flex items-center gap-3">
        <a href="/dashboard" className="text-stone-400 hover:text-stone-700 text-sm md:hidden">←</a>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-stone-900 truncate">{event.name}</h1>
          <p className="text-xs text-stone-400">{event.event_type === 'group' ? '단체 이벤트' : '개인 기록'} · {event.category}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusColor[event.status]}`}>
          {statusLabel[event.status]}
        </span>
        <MBtn
          onClick={handleCreatorRecord}
          disabled={creatorJoining}
          className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: '#E65100' }}
        >
          {creatorJoining ? '...' : '✏️ 내 기록'}
        </MBtn>
      </header>

      {/* 탭 바 */}
      <div className="bg-white border-b border-stone-100 px-4">
        <div className="flex gap-0 max-w-3xl mx-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-3 text-sm border-b-2 transition-colors"
              style={{
                borderBottomColor: tab === t.key ? '#1A4F8A' : 'transparent',
                color: tab === t.key ? '#1A4F8A' : '#9e9690',
                fontWeight: tab === t.key ? 600 : 400,
              }}
            >
              <span className="hidden sm:inline">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* ── 개요 탭 ── */}
        {tab === 'overview' && (<>
          {event.event_type === 'group' && (
            <div className="grid grid-cols-3 gap-3">
              <MCard className="rounded-2xl p-4 flex flex-col gap-1" style={{ backgroundColor: '#1A4F8A' }}>
                <p className="text-white/60 text-xs">참여자</p>
                <p className="text-white font-bold text-3xl leading-none">{participants.length}</p>
                <p className="text-white/40 text-xs">명</p>
              </MCard>
              <MCard className="rounded-2xl p-4 flex flex-col gap-1" style={{ backgroundColor: '#1A4F8A' }}>
                <p className="text-white/60 text-xs">섹션</p>
                <p className="text-white font-bold text-3xl leading-none">{sections.length}</p>
                <p className="text-white/40 text-xs">개</p>
              </MCard>
              <MCard className="rounded-2xl p-4 flex flex-col gap-1" style={{ backgroundColor: '#1A1A2E' }}>
                <p className="text-white/60 text-xs">완성률</p>
                <p className="font-bold text-3xl leading-none" style={{ color: '#F4A228' }}>{completionPct}</p>
                <p className="text-white/40 text-xs">%</p>
              </MCard>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <div className="text-sm text-stone-500 space-y-1 mb-4">
              {event.dates_start && <p>📅 {event.dates_start} ~ {event.dates_end ?? '?'}</p>}
              <p>💡 인사이트: {event.insight_type === 'bible' ? '성경 구절' : event.insight_type === 'general' ? '명언' : '참여자 선택'}</p>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              {event.status === 'draft' && (
                <MBtn onClick={() => handleStatusChange('active')} disabled={statusChanging || !sections.length}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-40 transition-colors">
                  {statusChanging ? '변경 중...' : '▶ 이벤트 시작'}
                </MBtn>
              )}
              {event.status === 'active' && (
                <MBtn onClick={() => handleStatusChange('completed')} disabled={statusChanging}
                  className="px-4 py-2 text-white text-sm rounded-lg disabled:opacity-40 transition-colors"
                  style={{ backgroundColor: '#1A4F8A' }}>
                  {statusChanging ? '변경 중...' : '■ 이벤트 종료'}
                </MBtn>
              )}
              {event.status === 'completed' && (<>
                <MBtn onClick={() => handleStatusChange('active')} disabled={statusChanging}
                  className="px-4 py-2 border border-stone-200 text-stone-600 text-sm rounded-lg disabled:opacity-40 transition-colors">
                  다시 활성화
                </MBtn>
                <a href={`/events/${id}/summary`} className="px-4 py-2 text-sm rounded-lg border"
                  style={{ backgroundColor: '#FFF8EC', color: '#B45309', borderColor: '#F4A228' }}>
                  📄 총평 & PDF
                </a>
              </>)}
              {!sections.length && event.status === 'draft' && (
                <p className="text-xs text-amber-500">목차를 먼저 업로드해야 시작할 수 있어요.</p>
              )}
            </div>
          </div>

          {event.event_type === 'group' && event.qr_code_url && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <h2 className="font-semibold text-stone-900 mb-1">참여자 QR 코드</h2>
              <p className="text-sm text-stone-400 mb-4">
                {event.status === 'active' ? '참여자에게 공유하세요.' : '이벤트를 시작해야 QR로 접속할 수 있습니다.'}
              </p>
              <QRCodeDisplay url={event.qr_code_url} />
              <p className="text-xs text-stone-400 mt-3 break-all">{event.qr_code_url}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <MBtn className="w-full flex items-center justify-between p-5" onClick={() => setOpenSections(v => !v)}>
              <div className="text-left">
                <h2 className="font-semibold text-stone-900">목차 (섹션)</h2>
                <p className="text-sm text-stone-400 mt-0.5">
                  {sections.length ? `${sections.length}개 섹션` : '일정표를 업로드해 AI가 목차를 생성합니다.'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <a href={`/events/${id}/schedule`} onClick={e => e.stopPropagation()}
                  className="text-sm px-3 py-1.5 border border-stone-200 rounded-lg">
                  {sections.length ? '수정' : '업로드'}
                </a>
                <span className="text-stone-400 text-sm" style={{ transform: openSections ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block', transition: 'transform 0.2s' }}>▾</span>
              </div>
            </MBtn>
            {openSections && sections.length > 0 && (
              <ol className="px-5 pb-4 space-y-2 border-t border-stone-50">
                {sections.map((s) => (
                  <li key={s.id} className="flex items-start gap-3 text-sm pt-3">
                    <span className="text-stone-300 w-5 shrink-0">{s.order}.</span>
                    <div>
                      <p className="text-stone-900">{s.book_title}</p>
                      <p className="text-stone-400 text-xs">{s.original_title}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>)}

        {/* ── 참여자 탭 ── */}
        {tab === 'participants' && (<>
          {event.event_type === 'group' && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-stone-900">참여자 현황 <span className="text-sm font-normal text-stone-400">({participants.length}명)</span></h2>
                {notStarted.length > 0 && (
                  <span className="text-xs px-2 py-1 rounded-full font-medium text-white" style={{ backgroundColor: '#EF4444' }}>
                    미작성 {notStarted.length}명
                  </span>
                )}
              </div>
              {participants.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-stone-400 mb-1.5">
                    <span>전체 완성률</span><span>{completionPct}%</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${completionPct}%`, backgroundColor: '#F4A228' }} />
                  </div>
                </div>
              )}
              {!participants.length ? (
                <p className="text-sm text-stone-400">아직 참여자가 없어요. QR 코드를 공유해보세요.</p>
              ) : (
                <div className="space-y-3">
                  {participants.map((p) => {
                    const pct = sections.length > 0 ? Math.round((p.record_count / sections.length) * 100) : 0
                    const isNotStarted = p.record_count === 0
                    return (
                      <div key={p.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {isNotStarted && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#EF4444' }} />}
                            <span className={isNotStarted ? 'text-red-500 font-medium' : 'text-stone-900'}>{p.name}</span>
                            {p.sub_info && <span className="text-stone-400 text-xs">({p.sub_info})</span>}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-stone-400 text-xs">{p.record_count}/{sections.length || '?'}</span>
                            <button onClick={() => handleDeleteParticipant(p.id, p.name)}
                              className="text-stone-300 hover:text-red-400 transition-colors text-xs" title="참여자 삭제">×</button>
                          </div>
                        </div>
                        {sections.length > 0 && (
                          <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: isNotStarted ? '#FCA5A5' : '#F4A228' }} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {event.event_type === 'group' && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <h2 className="font-semibold text-stone-900 mb-4">공지 / 단체 사진</h2>
              <div className="space-y-2 mb-4">
                <textarea value={noticeText} onChange={e => setNoticeText(e.target.value)} rows={3}
                  placeholder="참여자에게 전달할 공지 내용을 입력하세요."
                  className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none resize-none" />
                <MBtn onClick={() => handleUploadContent('notice')} disabled={uploading || !noticeText.trim()}
                  className="px-4 py-2 bg-brand-primary text-white text-sm rounded-lg disabled:opacity-40 transition-colors">
                  {uploading ? '등록 중...' : '공지 등록'}
                </MBtn>
              </div>
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2">
                  <MBtn onClick={() => fileRef.current?.click()}
                    className="px-4 py-2 border border-stone-200 text-stone-600 text-sm rounded-lg">📷 단체 사진 선택</MBtn>
                  {photoFile && (
                    <MBtn onClick={() => handleUploadContent('photo')} disabled={uploading}
                      className="px-4 py-2 bg-brand-primary text-white text-sm rounded-lg disabled:opacity-40">
                      {uploading ? '업로드 중...' : '업로드'}
                    </MBtn>
                  )}
                </div>
                {photoFile && <p className="text-xs text-stone-400">{photoFile.name}</p>}
                <input ref={fileRef} type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] ?? null)} className="hidden" />
              </div>
              {contents.length > 0 && (
                <div className="space-y-3 border-t border-stone-100 pt-4">
                  {contents.map((c) => (
                    <div key={c.id} className="flex items-start gap-3">
                      {c.content_type === 'notice' ? (
                        <div className="flex-1 rounded-xl p-3" style={{ backgroundColor: '#FFF8EC', borderLeft: '3px solid #F4A228' }}>
                          <p className="text-xs font-semibold mb-1" style={{ color: '#F4A228' }}>공지</p>
                          <p className="text-sm text-stone-700">{c.content_text}</p>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <img src={c.file_url ?? ''} alt="단체 사진" className="w-full rounded-xl object-cover max-h-48" />
                        </div>
                      )}
                      <MBtn onClick={() => handleDeleteContent(c.id)} className="text-stone-300 hover:text-red-400 text-xs mt-1 shrink-0">삭제</MBtn>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>)}

        {/* ── 책 설정 탭 ── */}
        {tab === 'book' && (
          <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-6">
            <div>
              <p className="text-xs font-medium text-stone-500 mb-2">
                디자인 테마 {themeSaving && <span className="text-stone-300 font-normal">저장 중...</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {THEME_OPTIONS.map(t => {
                  const isSelected = (event.theme ?? '') === t.id
                  return (
                    <MBtn key={t.id} onClick={() => handleThemeChange(t.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                      style={{ backgroundColor: isSelected ? t.color : '#fafaf7', color: isSelected ? '#fff' : '#78716c', borderColor: isSelected ? t.color : '#e7e5e0' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: isSelected ? 'rgba(255,255,255,0.6)' : t.color, display: 'inline-block', flexShrink: 0 }} />
                      {t.label}
                    </MBtn>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium text-stone-500">출판 정보</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { key: 'publisher_name', label: '저자 / 편저', placeholder: '예) 2학년 중등부' },
                  { key: 'publisher_org',  label: '소속 / 단체명', placeholder: '예) ○○교회' },
                  { key: 'publish_date',   label: '발행일', placeholder: '예) 2026년 7월' },
                  { key: 'copyright_text', label: '판권 문구', placeholder: '예) 무단 복제 금지' },
                ] as const).map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-stone-400 mb-1 block">{f.label}</label>
                    <input
                      value={bookForm[f.key]}
                      onChange={e => setBookForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-300"
                    />
                  </div>
                ))}
              </div>
              <MBtn onClick={handleBookSettingsSave} disabled={bookSaving}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
                style={bookSaved ? { backgroundColor: '#22c55e', color: '#fff' } : { backgroundColor: '#1A4F8A', color: '#fff' }}>
                {bookSaved ? '✓ 저장됐어요' : bookSaving ? '저장 중...' : '저장'}
              </MBtn>
            </div>
          </div>
        )}

        {/* ── 갓생북 탭 ── */}
        {tab === 'publish' && (
          <div className="rounded-2xl border p-5 space-y-4" style={{ backgroundColor: '#1A1A2E', borderColor: '#2d2d4e' }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold text-white">📚 합본 갓생북</h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#F4A228', color: '#1A1A2E' }}>준비 중</span>
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                모든 참여자의 기록을 하나로 모아 갓생북을 완성합니다.
                섹션별로 참여자 소감이 모이고, 리더의 총평으로 마무리되는 단 하나의 책이에요.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-medium" style={{ color: '#F4A228' }}>🖥️ PC 플립북</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>전체 합본을 화면에서 펼쳐볼 수 있어요.</p>
                <button disabled className="w-full py-2 text-xs font-medium rounded-lg"
                  style={{ backgroundColor: 'rgba(244,162,40,0.15)', color: 'rgba(244,162,40,0.4)', border: '1px solid rgba(244,162,40,0.2)' }}>
                  미리보기 (준비 중)
                </button>
              </div>
              <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-medium" style={{ color: '#F4A228' }}>🖨️ 인쇄용 PDF</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>A5 규격으로 인쇄소에 바로 맡길 수 있어요.</p>
                <button disabled className="w-full py-2 text-xs font-medium rounded-lg"
                  style={{ backgroundColor: 'rgba(244,162,40,0.15)', color: 'rgba(244,162,40,0.4)', border: '1px solid rgba(244,162,40,0.2)' }}>
                  PDF 다운로드 (준비 중)
                </button>
              </div>
            </div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              * 이벤트가 종료되고 참여자 기록이 완성되면 활성화됩니다.
            </p>
          </div>
        )}

      </main>
    </div>
    </PageTransition>
  )
}

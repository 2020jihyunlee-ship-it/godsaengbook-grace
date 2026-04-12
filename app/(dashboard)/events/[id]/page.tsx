'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import QRCodeDisplay from '@/components/QRCodeDisplay'
import type { GraceEvent, GraceSection, GraceParticipant } from '@/types'
import { PageTransition, MBtn } from '@/components/ui/motion'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [event, setEvent] = useState<GraceEvent | null>(null)
  const [sections, setSections] = useState<GraceSection[]>([])
  const [participants, setParticipants] = useState<GraceParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'participants' | 'sections'>('overview')

  // 섹션 추가 폼
  const [sectionForm, setSectionForm] = useState({ title: '', section_date: '', section_time: '' })
  const [sectionSaving, setSectionSaving] = useState(false)
  const [addMode, setAddMode] = useState<'auto' | 'manual' | null>(null)
  const [autoPerDay, setAutoPerDay] = useState<number>(2)

  // 섹션 인라인 수정
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editSectionForm, setEditSectionForm] = useState({ title: '', section_date: '', section_time: '' })

  // 리더 기록
  const [creatorJoining, setCreatorJoining] = useState(false)

  const inputCls = "w-full px-3 py-2.5 border border-[#E8D5A3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 bg-[#FDFAF5]"

  async function load() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const [{ data: ev }, { data: secs }, { data: parts }] = await Promise.all([
      supabase.from('grace_events').select('*').eq('id', id).eq('creator_id', user.id).single(),
      supabase.from('grace_sections').select('*').eq('event_id', id).order('order'),
      supabase.from('grace_participants').select('*').eq('event_id', id).order('created_at'),
    ])

    if (!ev) { router.push('/dashboard'); return }

    // QR URL 자동 갱신 (localhost → 배포 URL, 모든 이벤트 타입)
    const correctUrl = `${window.location.origin}/join/${id}`
    if (ev.qr_code_url !== correctUrl) {
      await supabase.from('grace_events').update({ qr_code_url: correctUrl }).eq('id', id)
      ev.qr_code_url = correctUrl
    }

    setEvent(ev)
    setSections(secs ?? [])
    setParticipants(parts ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  async function handleStatusChange(newStatus: GraceEvent['status']) {
    if (!event) return
    const supabase = createClient()
    const { data } = await supabase
      .from('grace_events').update({ status: newStatus }).eq('id', id).select().single()
    if (data) setEvent(data)
  }

  async function handleAddSection(e: React.FormEvent) {
    e.preventDefault()
    if (!sectionForm.title.trim()) return
    setSectionSaving(true)
    const supabase = createClient()
    const nextOrder = (sections[sections.length - 1]?.order ?? 0) + 1
    const { data } = await supabase.from('grace_sections').insert({
      event_id: id,
      order: nextOrder,
      title: sectionForm.title.trim(),
      section_date: sectionForm.section_date || null,
      section_time: sectionForm.section_time || null,
    }).select().single()
    if (data) {
      setSections(prev => [...prev, data])
      setSectionForm({ title: '', section_date: '', section_time: '' })
    }
    setSectionSaving(false)
  }

  async function handleDeleteSection(sectionId: string) {
    if (!confirm('이 섹션을 삭제할까요?')) return
    const supabase = createClient()
    await supabase.from('grace_sections').delete().eq('id', sectionId)
    setSections(prev => prev.filter(s => s.id !== sectionId))
  }

  function startEditSection(s: GraceSection) {
    setEditingSectionId(s.id)
    setEditSectionForm({ title: s.title, section_date: s.section_date ?? '', section_time: s.section_time ?? '' })
  }

  async function handleUpdateSection(sectionId: string) {
    if (!editSectionForm.title.trim()) return
    const supabase = createClient()
    const { data } = await supabase.from('grace_sections').update({
      title: editSectionForm.title.trim(),
      section_date: editSectionForm.section_date || null,
      section_time: editSectionForm.section_time || null,
    }).eq('id', sectionId).select().single()
    if (data) setSections(prev => prev.map(s => s.id === sectionId ? data : s))
    setEditingSectionId(null)
  }

  const QUICK_NAMES = ['오전 예배', '저녁 집회', '오후 집회', '기도회', '강의', '소그룹', '교제', '수료 예배']

  function getAutoSectionName(dayNum: number, slotIdx: number, perDay: number) {
    const prefix = `${dayNum}일차`
    if (perDay === 1) return `${prefix} 예배`
    if (perDay === 2) return slotIdx === 0 ? `${prefix} 오전 예배` : `${prefix} 저녁 집회`
    const names = ['오전 예배', '오후 집회', '저녁 집회', '저녁 기도회', '새벽 기도', '특별 집회', '분임 토의', '마무리 예배', '수료 예배', '기념 촬영']
    return `${prefix} ${names[slotIdx] ?? `${slotIdx + 1}번째 순서`}`
  }

  async function handleBulkAddSections() {
    if (!event?.dates_start) return
    setSectionSaving(true)
    const start = new Date(event.dates_start)
    const end = event.dates_end ? new Date(event.dates_end) : start
    const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const supabase = createClient()
    let order = (sections[sections.length - 1]?.order ?? 0) + 1
    const rows = []
    for (let d = 0; d < days; d++) {
      const date = new Date(start)
      date.setDate(start.getDate() + d)
      const dateStr = date.toISOString().split('T')[0]
      for (let s = 0; s < autoPerDay; s++) {
        rows.push({ event_id: id, order: order++, title: getAutoSectionName(d + 1, s, autoPerDay), section_date: dateStr, section_time: null })
      }
    }
    const { data } = await supabase.from('grace_sections').insert(rows).select()
    if (data) setSections(prev => [...prev, ...data])
    setAddMode(null)
    setSectionSaving(false)
  }

  async function handleDeleteParticipant(participantId: string, name: string) {
    if (!confirm(`"${name}" 참여자를 삭제할까요?\n(작성한 기록도 함께 삭제됩니다)`)) return
    const supabase = createClient()
    await supabase.from('grace_entries').delete().eq('participant_id', participantId)
    await supabase.from('grace_participants').delete().eq('id', participantId)
    setParticipants(prev => prev.filter(p => p.id !== participantId))
  }

  async function handleCreatorRecord() {
    if (!event) return
    setCreatorJoining(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setCreatorJoining(false); return }

    const { data: profile } = await supabase.from('grace_users').select('name').eq('id', user.id).single()
    const creatorName = profile?.name?.trim() || user.email?.split('@')[0] || '리더'

    const creatorToken = `creator_${id}`

    // 이미 등록된 리더 참여자 확인
    let participant = participants.find(p => p.session_token === creatorToken)

    if (!participant) {
      // 서버 API로 등록 (RLS 우회)
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id, name: creatorName, subInfo: '리더', sessionToken: creatorToken }),
      })
      const json = await res.json()
      if (!res.ok || !json.participant) {
        alert(`기록 오류: ${json.error ?? res.status}`)
        setCreatorJoining(false)
        return
      }
      participant = json.participant
      setParticipants(prev => [...prev, json.participant])
    }

    if (participant) {
      localStorage.setItem(`grace_participant_${id}`, JSON.stringify({
        participantId: participant.id,
        name: participant.name,
        sessionToken: creatorToken,
      }))
      router.push(`/record/${id}`)
    }
    setCreatorJoining(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFAF5] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#E8D5A3] border-t-[#C9A84C] rounded-full animate-spin" />
      </div>
    )
  }

  if (!event) return null

  const totalRecords = participants.reduce((sum, p) => sum + p.record_count, 0)
  const maxRecords = participants.length * (sections.length || 1)
  const completionPct = maxRecords > 0 ? Math.round((totalRecords / maxRecords) * 100) : 0

  const TABS = [
    { key: 'overview' as const,      label: '개요' },
    { key: 'participants' as const,  label: `참여자 ${participants.length ? `(${participants.length})` : ''}` },
    { key: 'sections' as const,      label: `섹션 ${sections.length ? `(${sections.length})` : ''}` },
  ]

  const statusBadge = event.status === 'active'
    ? 'bg-emerald-50 text-emerald-600'
    : 'bg-[#F5EFE4] text-[#8C6E55]'

  return (
    <PageTransition>
    <div className="min-h-screen bg-[#FDFAF5]">

      {/* 헤더 — 모바일 최적화 */}
      <header className="bg-[#FDFAF5]/95 backdrop-blur border-b border-[#E8D5A3] px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => router.push('/dashboard')} className="text-[#8C6E55] hover:text-[#3D2B1F] text-lg leading-none p-1 -ml-1">←</button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-[#3D2B1F] truncate">{event.name}</h1>
            <p className="text-xs text-[#8C6E55]">{event.category} · {event.event_type === 'group' ? '팀 이벤트' : '개인 기록'}</p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusBadge}`}>
            {event.status === 'active' ? '진행중' : '완료'}
          </span>
          {event.event_type === 'group' && (
            <MBtn
              onClick={handleCreatorRecord}
              disabled={creatorJoining}
              className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-full text-white bg-[#C9A84C] hover:bg-[#A8853A] transition-colors disabled:opacity-50"
            >
              {creatorJoining ? '...' : '✏️ 기록'}
            </MBtn>
          )}
        </div>
      </header>

      {/* 탭 바 — 세그먼트 컨트롤 */}
      <div className="bg-[#FDFAF5] border-b border-[#E8D5A3] px-4 py-3">
        <div className="max-w-lg mx-auto">
          <div
            className="flex rounded-2xl p-1 gap-1"
            style={{ backgroundColor: '#EDE3CE' }}
          >
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex-1 py-2 px-2 text-sm rounded-xl transition-all duration-200 whitespace-nowrap font-medium"
                style={tab === t.key ? {
                  backgroundColor: '#fff',
                  color: '#A8853A',
                  fontWeight: 700,
                  boxShadow: '0 1px 4px rgba(169,133,58,0.18), 0 0 0 1px rgba(201,168,76,0.15)',
                } : {
                  backgroundColor: 'transparent',
                  color: '#8C6E55',
                  fontWeight: 500,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* ── 개요 탭 ── */}
        {tab === 'overview' && (<>

          {/* 통계 카드 (단체 이벤트만) */}
          {event.event_type === 'group' && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '참여자', value: participants.length, unit: '명' },
                { label: '섹션', value: sections.length, unit: '개' },
                { label: '완성률', value: completionPct, unit: '%' },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-[#E8D5A3] rounded-2xl p-4 text-center">
                  <p className="text-xs text-[#8C6E55] mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#3D2B1F] leading-none">{stat.value}</p>
                  <p className="text-xs text-[#8C6E55] mt-1">{stat.unit}</p>
                </div>
              ))}
            </div>
          )}

          {/* 기간 + 상태 */}
          <div className="bg-white border border-[#E8D5A3] rounded-2xl p-4 space-y-3">
            {event.dates_start && (
              <p className="text-sm text-[#3D2B1F]">
                📅 {event.dates_start}{event.dates_end && event.dates_end !== event.dates_start ? ` ~ ${event.dates_end}` : ''}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {event.status === 'active' ? (
                <>
                  {event.event_type === 'personal' && (
                    <MBtn
                      onClick={handleCreatorRecord}
                      disabled={creatorJoining}
                      className="flex-1 py-2.5 bg-[#C9A84C] text-white text-sm font-medium rounded-xl hover:bg-[#A8853A] transition-colors disabled:opacity-50"
                    >
                      {creatorJoining ? '이동 중...' : '✏️ 기록 작성하기'}
                    </MBtn>
                  )}
                  <MBtn
                    onClick={() => handleStatusChange('completed')}
                    className="px-4 py-2.5 border border-[#E8D5A3] text-[#8C6E55] text-sm rounded-xl hover:border-[#C9A84C] transition-colors"
                  >
                    이벤트 종료
                  </MBtn>
                </>
              ) : (
                <>
                  <MBtn
                    onClick={() => handleStatusChange('active')}
                    className="px-4 py-2.5 border border-[#E8D5A3] text-[#8C6E55] text-sm rounded-xl hover:border-[#C9A84C] transition-colors"
                  >
                    다시 활성화
                  </MBtn>
                  <a href={`/flipbook/${id}`}
                    className="px-4 py-2.5 bg-[#C9A84C] text-white text-sm font-medium rounded-xl hover:bg-[#A8853A] transition-colors">
                    📖 플립북 보기
                  </a>
                </>
              )}
            </div>
          </div>

          {/* QR 코드 — 모든 이벤트 타입 */}
          {event.qr_code_url && (
            <div className="bg-white border border-[#E8D5A3] rounded-2xl p-5">
              <h2 className="font-medium text-[#3D2B1F] mb-1">
                {event.event_type === 'group' ? '참여자 QR 코드' : '기록 링크'}
              </h2>
              <p className="text-xs text-[#8C6E55] mb-4">
                {event.status === 'active'
                  ? '화면을 보여주거나 링크를 공유하세요.'
                  : '이벤트가 진행 중일 때 접속할 수 있어요.'}
              </p>
              <div className="flex justify-center">
                <QRCodeDisplay url={event.qr_code_url} />
              </div>
            </div>
          )}
        </>)}

        {/* ── 참여자 탭 ── */}
        {tab === 'participants' && (<>
          {event.event_type !== 'group' ? (
            <div className="bg-white border border-[#E8D5A3] rounded-2xl p-8 text-center">
              <p className="text-[#8C6E55] text-sm">개인 기록은 참여자 관리가 필요 없어요.</p>
            </div>
          ) : !participants.length ? (
            <div className="bg-white border border-[#E8D5A3] rounded-2xl p-8 text-center">
              <p className="text-3xl mb-3">👥</p>
              <p className="text-[#8C6E55] text-sm">아직 참여자가 없어요.<br/>QR 코드를 공유해보세요.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#E8D5A3] rounded-2xl overflow-hidden">
              {/* 완성률 */}
              <div className="p-4 border-b border-[#F5EFE4]">
                <div className="flex justify-between text-xs text-[#8C6E55] mb-2">
                  <span>전체 완성률</span>
                  <span className="font-medium text-[#3D2B1F]">{completionPct}%</span>
                </div>
                <div className="h-2 bg-[#F5EFE4] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700 bg-[#C9A84C]"
                    style={{ width: `${completionPct}%` }} />
                </div>
              </div>
              {/* 참여자 목록 */}
              <div className="divide-y divide-[#F5EFE4]">
                {participants.map(p => {
                  const pct = sections.length > 0 ? Math.round((p.record_count / sections.length) * 100) : 0
                  return (
                    <div key={p.id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-medium text-[#3D2B1F] truncate">{p.name}</span>
                          {p.sub_info && <span className="text-xs text-[#8C6E55] shrink-0">({p.sub_info})</span>}
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-2">
                          <span className="text-xs text-[#8C6E55]">{p.record_count}/{sections.length || '?'}</span>
                          <button
                            onClick={() => handleDeleteParticipant(p.id, p.name)}
                            className="text-[#E8D5A3] hover:text-red-400 transition-colors text-base leading-none"
                          >×</button>
                        </div>
                      </div>
                      {sections.length > 0 && (
                        <div className="h-1.5 bg-[#F5EFE4] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500 bg-[#C9A84C]"
                            style={{ width: `${pct}%` }} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>)}

        {/* ── 섹션 탭 ── */}
        {tab === 'sections' && (<>

          {/* 플립북 연동 안내 */}
          <div className="bg-[#F5EFE4] border border-[#E8D5A3] rounded-2xl p-4">
            <p className="text-xs font-semibold text-[#A8853A] mb-1">📖 섹션 = 플립북의 챕터</p>
            <p className="text-xs text-[#8C6E55] leading-relaxed">
              섹션 하나가 플립북 두 페이지(사진 + 기록)로 완성됩니다.<br/>
              <span className="text-[#A8853A] font-medium">첫 번째 섹션의 사진이 표지 배경</span>이 되므로, 가장 인상적인 순서로 배치하세요.
            </p>
          </div>

          {/* 빈 상태 — 시작 선택지 */}
          {!sections.length && addMode === null && (
            <div className="bg-white border border-[#E8D5A3] rounded-2xl p-6 text-center space-y-4">
              <p className="text-sm font-medium text-[#3D2B1F]">섹션을 추가해서 일정을 구성하세요</p>
              <p className="text-xs text-[#8C6E55]">섹션이 있어야 참여자들이 사진과 기록을 남길 수 있어요.</p>
              <div className="flex gap-3">
                {event?.dates_start && (
                  <button
                    onClick={() => setAddMode('auto')}
                    className="flex-1 py-3 rounded-2xl border-2 border-[#C9A84C] bg-[#FDFAF5] text-sm font-medium text-[#A8853A]"
                  >
                    📅 날짜별 자동 생성
                  </button>
                )}
                <button
                  onClick={() => setAddMode('manual')}
                  className="flex-1 py-3 rounded-2xl border border-[#E8D5A3] bg-white text-sm font-medium text-[#8C6E55]"
                >
                  ✏️ 직접 추가
                </button>
              </div>
            </div>
          )}

          {/* 자동 생성 패널 */}
          {addMode === 'auto' && event?.dates_start && (() => {
            const start = new Date(event.dates_start!)
            const end = event.dates_end ? new Date(event.dates_end) : start
            const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
            const preview: string[] = []
            for (let d = 0; d < days; d++) {
              const date = new Date(start); date.setDate(start.getDate() + d)
              const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
              for (let s = 0; s < autoPerDay; s++) {
                preview.push(`${getAutoSectionName(d + 1, s, autoPerDay)} · ${dateStr}`)
              }
            }
            return (
              <div className="bg-white border border-[#E8D5A3] rounded-2xl p-4 space-y-4">
                <p className="text-xs font-medium text-[#8C6E55]">
                  이벤트 기간: <span className="text-[#3D2B1F]">{event.dates_start}{event.dates_end && event.dates_end !== event.dates_start ? ` ~ ${event.dates_end}` : ''}</span> · {days}일
                </p>
                <div>
                  <p className="text-xs text-[#8C6E55] mb-2">하루에 섹션 몇 개?</p>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={autoPerDay === 0 ? '' : autoPerDay}
                      onChange={e => {
                        const v = e.target.value
                        if (v === '') { setAutoPerDay(0); return }
                        const n = parseInt(v, 10)
                        if (!isNaN(n) && n >= 1 && n <= 20) setAutoPerDay(n)
                      }}
                      onBlur={e => { if (!e.target.value || Number(e.target.value) < 1) setAutoPerDay(1) }}
                      className="w-24 py-2.5 px-3 rounded-xl text-sm text-center border-2 border-[#C9A84C] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 font-medium text-[#3D2B1F]"
                      placeholder="숫자 입력"
                      inputMode="numeric"
                    />
                    <span className="text-sm text-[#8C6E55]">개</span>
                    <span className="text-xs text-[#C9B990]">· 최대 20개</span>
                  </div>
                </div>
                <div className="bg-[#FDFAF5] rounded-xl p-3 max-h-40 overflow-y-auto space-y-1">
                  {preview.map((p, i) => (
                    <p key={i} className="text-xs text-[#8C6E55]">
                      <span className="inline-block w-5 text-[#C9A84C] font-medium">{i + 1}</span> {p}
                    </p>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setAddMode(null)} className="px-4 py-2.5 text-sm text-[#8C6E55] border border-[#E8D5A3] rounded-xl">취소</button>
                  <MBtn onClick={handleBulkAddSections} disabled={sectionSaving}
                    className="flex-1 py-2.5 bg-[#C9A84C] text-white text-sm font-medium rounded-xl disabled:opacity-50">
                    {sectionSaving ? '생성 중...' : `${preview.length}개 섹션 생성하기`}
                  </MBtn>
                </div>
              </div>
            )
          })()}

          {/* 수동 추가 폼 */}
          {(addMode === 'manual' || sections.length > 0) && (
            <form onSubmit={handleAddSection} className="bg-white border border-[#E8D5A3] rounded-2xl p-4 space-y-3">
              <p className="text-xs font-medium text-[#8C6E55]">섹션 추가</p>
              {/* 빠른 이름 칩 */}
              <div className="flex flex-wrap gap-1.5">
                {QUICK_NAMES.map(name => (
                  <button key={name} type="button"
                    onClick={() => setSectionForm(f => ({ ...f, title: name }))}
                    className="px-2.5 py-1 text-xs rounded-full border border-[#E8D5A3] text-[#8C6E55] hover:border-[#C9A84C] hover:text-[#A8853A] transition-colors"
                    style={sectionForm.title === name ? { borderColor: '#C9A84C', color: '#A8853A', backgroundColor: '#F5EFE4' } : {}}>
                    {name}
                  </button>
                ))}
              </div>
              <input
                value={sectionForm.title}
                onChange={e => setSectionForm(f => ({ ...f, title: e.target.value }))}
                placeholder="직접 입력 (예: 1일차 저녁예배)"
                className={inputCls}
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-[#8C6E55] mb-1">날짜 (선택)</label>
                  <input type="date" value={sectionForm.section_date}
                    onChange={e => setSectionForm(f => ({ ...f, section_date: e.target.value }))}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-[#8C6E55] mb-1">시간 (선택)</label>
                  <input type="time" value={sectionForm.section_time}
                    onChange={e => setSectionForm(f => ({ ...f, section_time: e.target.value }))}
                    className={inputCls} />
                </div>
              </div>
              <MBtn type="submit" disabled={sectionSaving || !sectionForm.title.trim()}
                className="w-full py-2.5 bg-[#C9A84C] text-white text-sm font-medium rounded-xl hover:bg-[#A8853A] transition-colors disabled:opacity-50">
                {sectionSaving ? '추가 중...' : '+ 섹션 추가'}
              </MBtn>
            </form>
          )}

          {/* 섹션 목록 */}
          {sections.length > 0 && (
            <div className="bg-white border border-[#E8D5A3] rounded-2xl divide-y divide-[#F5EFE4]">
              {sections.map((s, i) => (
                <div key={s.id}>
                  {editingSectionId === s.id ? (
                    /* 인라인 수정 폼 */
                    <div className="px-4 py-3 space-y-2 bg-[#FDFAF5]">
                      <input
                        value={editSectionForm.title}
                        onChange={e => setEditSectionForm(f => ({ ...f, title: e.target.value }))}
                        className={inputCls}
                        autoFocus
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="date" value={editSectionForm.section_date}
                          onChange={e => setEditSectionForm(f => ({ ...f, section_date: e.target.value }))}
                          className={inputCls} />
                        <input type="time" value={editSectionForm.section_time}
                          onChange={e => setEditSectionForm(f => ({ ...f, section_time: e.target.value }))}
                          className={inputCls} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingSectionId(null)}
                          className="flex-1 py-2 text-xs text-[#8C6E55] border border-[#E8D5A3] rounded-xl">취소</button>
                        <button onClick={() => handleUpdateSection(s.id)}
                          className="flex-1 py-2 text-xs text-white rounded-xl font-medium"
                          style={{ backgroundColor: '#C9A84C' }}>저장</button>
                      </div>
                    </div>
                  ) : (
                    /* 일반 행 — 탭하면 수정 */
                    <div className="px-4 py-3 flex items-center gap-3">
                      <div className="shrink-0 flex flex-col items-center gap-0.5">
                        <span className="w-6 h-6 rounded-full bg-[#F5EFE4] text-[#A8853A] text-xs font-semibold flex items-center justify-center">
                          {i + 1}
                        </span>
                        {i === 0 && <span className="text-[9px] text-[#C9A84C] leading-none">표지</span>}
                      </div>
                      <div className="flex-1 min-w-0" onClick={() => startEditSection(s)} style={{ cursor: 'pointer' }}>
                        <p className="text-sm font-medium text-[#3D2B1F] truncate">{s.title}</p>
                        {(s.section_date || s.section_time) && (
                          <p className="text-xs text-[#8C6E55]">
                            {s.section_date}{s.section_date && s.section_time ? ' ' : ''}{s.section_time}
                          </p>
                        )}
                        <p className="text-[10px] text-[#C9B990] mt-0.5">탭하여 수정</p>
                      </div>
                      <button onClick={() => handleDeleteSection(s.id)}
                        className="text-[#E8D5A3] hover:text-red-400 transition-colors text-base leading-none shrink-0 px-1">×</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>)}

      </main>

      {/* 모바일 하단 여백 (safe area) */}
      <div className="h-8" />
    </div>
    </PageTransition>
  )
}

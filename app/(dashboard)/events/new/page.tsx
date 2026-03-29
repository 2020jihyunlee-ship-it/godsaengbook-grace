'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { EventType, GraceCategory } from '@/types'
import { PageTransition, MBtn, MCard } from '@/components/ui/motion'

const CATEGORIES: { value: GraceCategory; icon: string; label: string; desc: string }[] = [
  { value: '수련회',   icon: '⛺', label: '수련회',   desc: '교회 여름/겨울 수련회' },
  { value: '선교', icon: '✈️', label: '선교', desc: '단기선교 · 해외/국내' },
  { value: '캠프',     icon: '🌿', label: '캠프',     desc: '청소년 캠프 · 성경학교' },
  { value: '예배',     icon: '🕊️', label: '예배',     desc: '특별예배 · 부흥회 · 사경회' },
  { value: '모임',     icon: '🤝', label: '모임',     desc: '셀 · 소그룹 · 기도회' },
  { value: '개인',     icon: '📖', label: '개인 기록', desc: '개인 묵상 · 여정' },
]

function NewEventForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')
  const initialType: EventType | null =
    typeParam === 'personal' ? 'personal' : typeParam === 'team' ? 'group' : null

  const [eventType, setEventType] = useState<EventType | null>(initialType)
  const [form, setForm] = useState({
    name: '',
    category: '' as GraceCategory | '',
    dates_start: '',
    dates_end: '',
    participant_count: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!eventType || !form.category) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const payload = {
      creator_id: user.id,
      event_type: eventType,
      name: form.name,
      category: form.category,
      dates_start: form.dates_start || null,
      dates_end: form.dates_end || null,
      participant_count: form.participant_count ? parseInt(form.participant_count) : null,
      status: 'active',
    }

    const { data: event, error: err } = await supabase
      .from('grace_events').insert(payload).select().single()

    if (err || !event) {
      setError(err?.message ?? '이벤트 생성 중 오류가 발생했습니다.')
      setLoading(false)
      return
    }

    if (eventType === 'group') {
      const qrUrl = `${window.location.origin}/join/${event.id}`
      await supabase.from('grace_events').update({ qr_code_url: qrUrl }).eq('id', event.id)
    }

    router.push(`/events/${event.id}`)
  }

  const inputCls = "w-full px-3 py-2 border border-[#E8D5A3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 bg-[#FDFAF5]"

  // Step 1: 이벤트 유형 선택
  if (!eventType) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-[#FDFAF5] flex items-center justify-center px-4">
          <div className="w-full max-w-sm">
            <button onClick={() => router.back()} className="text-sm text-[#8C6E55] hover:text-[#3D2B1F] mb-6 block">← 뒤로</button>
            <h2 className="text-xl font-semibold text-[#3D2B1F] mb-2">어떤 이벤트인가요?</h2>
            <p className="text-sm text-[#8C6E55] mb-6">팀과 함께하거나, 혼자 기록해요</p>
            <div className="space-y-3">
              <MCard
                className="w-full bg-white border-2 border-[#E8D5A3] rounded-2xl p-5 text-left cursor-pointer hover:border-[#C9A84C] transition-colors"
                onClick={() => setEventType('group')}
              >
                <p className="text-xl mb-1">👥</p>
                <p className="font-semibold text-[#3D2B1F]">팀/단체 이벤트</p>
                <p className="text-sm text-[#8C6E55] mt-1">QR 코드로 참여자 초대<br/>수련회 · 선교여행 · 모임</p>
              </MCard>
              <MCard
                className="w-full bg-white border-2 border-[#E8D5A3] rounded-2xl p-5 text-left cursor-pointer hover:border-[#C9A84C] transition-colors"
                onClick={() => setEventType('personal')}
              >
                <p className="text-xl mb-1">👤</p>
                <p className="font-semibold text-[#3D2B1F]">개인 기록</p>
                <p className="text-sm text-[#8C6E55] mt-1">나만의 묵상·여정 기록<br/>플립북으로 소장</p>
              </MCard>
            </div>
          </div>
        </div>
      </PageTransition>
    )
  }

  // Step 2: 이벤트 정보 입력
  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FDFAF5] px-4 py-8">
        <div className="max-w-sm mx-auto">
          <button onClick={() => setEventType(null)} className="text-sm text-[#8C6E55] hover:text-[#3D2B1F] mb-4 block">← 뒤로</button>
          <h2 className="text-xl font-semibold text-[#3D2B1F] mb-1">
            {eventType === 'group' ? '팀 이벤트' : '개인 기록'} 만들기
          </h2>
          <p className="text-sm text-[#8C6E55] mb-6">
            {eventType === 'group' ? 'QR 코드로 참여자를 초대해요' : '나만의 플립북을 만들어요'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* 카테고리 */}
            <div className="bg-white border border-[#E8D5A3] rounded-2xl p-4">
              <p className="text-xs font-medium text-[#8C6E55] mb-3">카테고리 선택 *</p>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.filter(c => eventType === 'personal' ? c.value === '개인' || true : c.value !== '개인').map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: c.value }))}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      form.category === c.value
                        ? 'border-[#C9A84C] bg-[#F5EFE4]'
                        : 'border-[#E8D5A3] bg-white'
                    }`}
                  >
                    <div className="text-xl mb-1">{c.icon}</div>
                    <div className={`text-xs font-medium ${form.category === c.value ? 'text-[#A8853A]' : 'text-[#3D2B1F]'}`}>
                      {c.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="bg-white border border-[#E8D5A3] rounded-2xl p-4 space-y-3">
              <p className="text-xs font-medium text-[#8C6E55]">기본 정보</p>
              <div>
                <label className="block text-xs text-[#8C6E55] mb-1">이름 *</label>
                <input
                  name="name" value={form.name} onChange={handleChange} required
                  className={inputCls}
                  placeholder={eventType === 'group' ? '2026 여름 수련회' : '나의 묵상 여정'}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-[#8C6E55] mb-1">시작일</label>
                  <input type="date" name="dates_start" value={form.dates_start} onChange={handleChange} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-[#8C6E55] mb-1">종료일</label>
                  <input type="date" name="dates_end" value={form.dates_end} onChange={handleChange} className={inputCls} />
                </div>
              </div>
              {eventType === 'group' && (
                <div>
                  <label className="block text-xs text-[#8C6E55] mb-1">예상 참여 인원</label>
                  <input
                    type="number" name="participant_count" value={form.participant_count} onChange={handleChange}
                    className={inputCls} placeholder="30"
                  />
                </div>
              )}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <MBtn
              type="submit"
              disabled={loading || !form.category}
              className="w-full py-3 bg-[#C9A84C] text-white text-sm font-medium rounded-full hover:bg-[#A8853A] disabled:opacity-50 transition-colors"
            >
              {loading ? '생성 중...' : (eventType === 'group' ? 'QR 코드 만들기' : '기록 시작하기')}
            </MBtn>
          </form>
        </div>
      </div>
    </PageTransition>
  )
}

export default function NewEventPage() {
  return (
    <Suspense>
      <NewEventForm />
    </Suspense>
  )
}

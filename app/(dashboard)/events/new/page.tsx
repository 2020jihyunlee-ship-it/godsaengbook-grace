'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { EventType, InsightType } from '@/types'
import { PageTransition, MBtn, MCard } from '@/components/ui/motion'
import { THEMES, type ThemeId } from '@/lib/themes'

const THEME_OPTIONS: { id: ThemeId; label: string; desc: string }[] = [
  { id: 'luxe-cream', label: '럭스 크림', desc: '따뜻한 크림 · 골드 포인트' },
  { id: 'sacred',     label: '성스러운',  desc: '딥 네이비 · 로마 숫자' },
  { id: 'adventure',  label: '탐험',      desc: '자연 그린 · 스탬프 날짜' },
  { id: 'editorial',  label: '에디토리얼', desc: '블루 · 모던 레이아웃' },
  { id: 'archive',    label: '아카이브',  desc: '빈티지 세피아 · 손글씨' },
  { id: 'mission',    label: '미션',      desc: '화이트 · 오렌지 포인트' },
  { id: 'minimal',    label: '미니멀',    desc: '여백 중심 · 장식 없음' },
]

const CATEGORIES = [
  { value: '수련회', label: '수련회 — 교회 여름/겨울 수련회' },
  { value: '캠프', label: '캠프 — 영어·리더십·야외 활동 캠프' },
  { value: '교육', label: '교육 — 학교, 강의, 워크숍' },
  { value: '여행', label: '여행 — 단체/개인 국내외 여행' },
  { value: '해외탐방', label: '해외탐방 — 해외 문화·역사 탐방' },
  { value: '선교', label: '선교 — 국내외 선교·봉사 활동' },
  { value: '기타', label: '기타 — 그 외 모든 경험' },
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
    category: '수련회',
    theme: '' as ThemeId | '',
    insight_type: 'bible' as InsightType,
    dates_start: '',
    dates_end: '',
    participant_count: '',
    author_name: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!eventType) return
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
      theme: form.theme || null,
      insight_type: form.insight_type,
      dates_start: form.dates_start || null,
      dates_end: form.dates_end || null,
      participant_count: form.participant_count ? parseInt(form.participant_count) : null,
      author_name: form.author_name || null,
      status: 'draft',
    }

    const { data: event, error: err } = await supabase
      .from('events').insert(payload).select().single()

    if (err || !event) {
      setError(err?.message ?? '이벤트 생성 중 오류가 발생했습니다.')
      setLoading(false)
      return
    }

    if (eventType === 'group') {
      const qrUrl = `${window.location.origin}/join/${event.id}`
      await supabase.from('events').update({ qr_code_url: qrUrl }).eq('id', event.id)
    }

    router.push(`/events/${event.id}`)
  }

  // Step 1: 이벤트 유형 선택
  if (!eventType) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-brand-surface flex items-center justify-center px-4">
          <div className="w-full max-w-sm">
            <button onClick={() => router.back()} className="text-sm text-stone-400 hover:text-stone-700 mb-6 block">← 뒤로</button>
            <h2 className="text-xl font-bold text-stone-900 mb-6">어떤 이벤트인가요?</h2>
            <div className="space-y-3">
              <MCard
                className="w-full bg-white border border-stone-200 rounded-2xl p-5 text-left cursor-pointer hover:border-stone-400 transition-colors"
                onClick={() => setEventType('group')}
              >
                <p className="font-medium text-stone-900">단체 이벤트</p>
                <p className="text-sm text-stone-400 mt-1">수련회, 캠프, 교육 프로그램 등<br/>QR 코드로 참여자 초대</p>
              </MCard>
              <MCard
                className="w-full bg-white border border-stone-200 rounded-2xl p-5 text-left cursor-pointer hover:border-stone-400 transition-colors"
                onClick={() => setEventType('personal')}
              >
                <p className="font-medium text-stone-900">개인 기록</p>
                <p className="text-sm text-stone-400 mt-1">개인 여행, 일상 기록 등<br/>나만의 플립북 만들기</p>
              </MCard>
            </div>
          </div>
        </div>
      </PageTransition>
    )
  }

  const inputCls = "w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
  const sectionCls = "bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3"
  const sectionHeaderCls = "flex items-center gap-2 text-sm font-semibold text-stone-600 mb-3"

  // Step 2: 이벤트 정보 입력
  return (
    <PageTransition>
      <div className="min-h-screen bg-brand-surface px-4 py-8">
        <div className="max-w-sm mx-auto">
          <button onClick={() => setEventType(null)} className="text-sm text-stone-400 hover:text-stone-700 mb-4 block">← 뒤로</button>
          <h2 className="text-xl font-bold text-stone-900 mb-1">
            {eventType === 'group' ? '단체 이벤트' : '개인 기록'} 만들기
          </h2>
          <p className="text-xs text-stone-400 mb-6">
            {eventType === 'group' ? 'QR 코드로 참여자를 초대하고 함께 기록해요' : '나만의 특별한 경험을 플립북으로 남겨요'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* 섹션 1: 기본 정보 */}
            <div className={sectionCls}>
              <p className={sectionHeaderCls}>
                <span>📝</span> 기본 정보
              </p>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">이름 *</label>
                <input
                  name="name" value={form.name} onChange={handleChange} required
                  className={inputCls}
                  placeholder={eventType === 'group' ? '2026 여름 수련회' : '나의 제주 여행'}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">카테고리</label>
                <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">시작일</label>
                  <input type="date" name="dates_start" value={form.dates_start} onChange={handleChange} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">종료일</label>
                  <input type="date" name="dates_end" value={form.dates_end} onChange={handleChange} className={inputCls} />
                </div>
              </div>
            </div>

            {/* 섹션 2: 디자인 */}
            <div className={sectionCls}>
              <p className={sectionHeaderCls}>
                <span>🎨</span> 디자인
              </p>
              {eventType === 'group' && (
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">테마</label>
                  <select name="theme" value={form.theme} onChange={handleChange} className={inputCls}>
                    <option value="">카테고리 기본 테마</option>
                    {THEME_OPTIONS.map(t => (
                      <option key={t.id} value={t.id}>{t.label} — {t.desc}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">인사이트 방식</label>
                <select name="insight_type" value={form.insight_type} onChange={handleChange} className={inputCls}>
                  <option value="bible">성경 구절 (개역성경)</option>
                  <option value="general">명언 / 동기부여 문구</option>
                  <option value="user_choice">참여자가 선택</option>
                </select>
              </div>
            </div>

            {/* 섹션 3: 참여자 (단체만) */}
            {eventType === 'group' && (
              <div className={sectionCls}>
                <p className={sectionHeaderCls}>
                  <span>👥</span> 참여자
                </p>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">예상 참여 인원</label>
                  <input
                    type="number" name="participant_count" value={form.participant_count} onChange={handleChange}
                    className={inputCls} placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">리더 이름 (책 저자)</label>
                  <input
                    name="author_name" value={form.author_name} onChange={handleChange}
                    className={inputCls} placeholder="홍길동 목사님"
                  />
                </div>
              </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <MBtn
              type="submit" disabled={loading}
              className="w-full py-2.5 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? '생성 중...' : (eventType === 'group' ? '이벤트 만들기' : '기록 만들기')}
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

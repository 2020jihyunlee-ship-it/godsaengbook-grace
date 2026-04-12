'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageTransition } from '@/components/ui/motion'

const CATEGORY_ICON: Record<string, string> = {
  '수련회': '⛺', '선교': '✈️', '캠프': '🌿',
  '예배': '🕊️', '모임': '🤝', '개인': '📖',
}

export default function JoinPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  const [event, setEvent] = useState<{ id: string; name: string; category: string; dates_start: string | null; dates_end: string | null } | null>(null)
  const [notFound, setNotFound] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const subInfoRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // 이미 세션이 있으면 바로 기록 페이지로
    const raw = localStorage.getItem(`grace_participant_${eventId}`)
    if (raw) {
      router.replace(`/record/${eventId}`)
      return
    }

    async function loadEvent() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('grace_events')
        .select('id, name, category, dates_start, dates_end')
        .eq('id', eventId)
        .eq('event_type', 'group')
        .eq('status', 'active')
        .single()

      if (error || !data) { setNotFound(true); return }
      setEvent(data)
    }
    loadEvent()
  }, [eventId, router])

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    const name = nameRef.current?.value.trim() ?? ''
    const subInfo = subInfoRef.current?.value.trim() ?? ''
    if (!name) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const sessionToken = crypto.randomUUID()

    const { data: participant, error: err } = await supabase
      .from('grace_participants')
      .insert({
        event_id: eventId,
        name,
        sub_info: subInfo || null,
        session_token: sessionToken,
        record_count: 0,
      })
      .select()
      .single()

    if (err || !participant) {
      setError(err?.message ?? '참여 등록 중 오류가 발생했습니다.')
      setLoading(false)
      return
    }

    localStorage.setItem(`grace_participant_${eventId}`, JSON.stringify({
      participantId: participant.id,
      sessionToken,
      name: participant.name,
    }))

    router.push(`/record/${eventId}`)
  }

  const inputCls = "w-full px-4 py-3.5 border border-[#E8D5A3] rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 bg-white text-[#3D2B1F] placeholder-[#C9B990]"

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#FDFAF5] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-[#3D2B1F] font-medium">이벤트를 찾을 수 없어요.</p>
          <p className="text-[#8C6E55] text-sm mt-2">QR 코드를 다시 확인해주세요.<br/>이미 종료된 이벤트일 수 있어요.</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#FDFAF5] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#E8D5A3] border-t-[#C9A84C] rounded-full animate-spin" />
      </div>
    )
  }

  const icon = CATEGORY_ICON[event.category] ?? '📌'
  const dateStr = event.dates_start
    ? event.dates_start + (event.dates_end && event.dates_end !== event.dates_start ? ` ~ ${event.dates_end}` : '')
    : null

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FDFAF5] flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">

          {/* 이벤트 정보 카드 */}
          <div className="bg-white border border-[#E8D5A3] rounded-3xl p-6 mb-6 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#F5EFE4] flex items-center justify-center text-3xl mx-auto mb-4">
              {icon}
            </div>
            <h1 className="text-xl font-semibold text-[#3D2B1F] mb-1">{event.name}</h1>
            <p className="text-sm text-[#8C6E55]">
              {event.category}{dateStr ? ` · ${dateStr}` : ''}
            </p>
          </div>

          {/* 참여 폼 */}
          <div className="bg-white border border-[#E8D5A3] rounded-3xl p-6 shadow-sm">
            <h2 className="font-semibold text-[#3D2B1F] mb-1">참여하기</h2>
            <p className="text-xs text-[#8C6E55] mb-5">이름을 입력하면 나만의 기록이 시작돼요.</p>

            <form onSubmit={handleJoin} className="space-y-3">
              <div>
                <label className="block text-xs text-[#8C6E55] mb-1.5">이름 *</label>
                <input
                  ref={nameRef}
                  type="text"
                  required
                  placeholder="홍길동"
                  autoFocus
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs text-[#8C6E55] mb-1.5">
                  소속 / 학년 <span className="text-[#C9B990]">(선택)</span>
                </label>
                <input
                  ref={subInfoRef}
                  type="text"
                  placeholder="1청년부 / 순장 등"
                  className={inputCls}
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#C9A84C] text-white text-base font-semibold rounded-2xl hover:bg-[#A8853A] disabled:opacity-50 transition-colors mt-2"
                style={{ fontSize: '16px' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    등록 중...
                  </span>
                ) : '기록 시작하기'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-[#C9B990] mt-6">
            갓생북 은혜 — 소중한 기억을, 기록되는 은혜로
          </p>
        </div>
      </div>
    </PageTransition>
  )
}

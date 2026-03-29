'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageTransition, CtaBtn } from '@/components/ui/motion'

interface EventInfo {
  id: string
  name: string
  category: string
  dates_start: string | null
  dates_end: string | null
  author_name: string | null
}

export default function JoinPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  const [event, setEvent] = useState<EventInfo | null>(null)
  const [notFound, setNotFound] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const subInfoRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadEvent() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('events')
        .select('id, name, category, dates_start, dates_end, author_name')
        .eq('id', eventId)
        .eq('event_type', 'group')
        .single()

      if (error || !data) {
        setNotFound(true)
        return
      }
      setEvent(data)
    }
    loadEvent()
  }, [eventId])

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
      .from('participants')
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

    localStorage.setItem(`participant_${eventId}`, JSON.stringify({
      participantId: participant.id,
      sessionToken,
      name: participant.name,
    }))

    router.push(`/record/${eventId}`)
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-2xl mb-3">🔍</p>
          <p className="text-stone-700 font-medium">이벤트를 찾을 수 없어요.</p>
          <p className="text-stone-400 text-sm mt-1">QR 코드를 다시 확인해주세요.</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <PageTransition>
    <div className="min-h-screen bg-brand-surface flex items-center justify-center px-4">
        <div className="w-full max-w-sm">

          {/* 이벤트 정보 */}
          <div className="text-center mb-8">
            <p className="text-3xl mb-3">📖</p>
            <h1 className="text-xl font-bold text-stone-900">{event.name}</h1>
            <p className="text-sm text-stone-400 mt-1">
              {event.category}
              {event.dates_start && (
                ' · ' + event.dates_start + (event.dates_end && event.dates_end !== event.dates_start ? ' ~ ' + event.dates_end : '')
              )}
            </p>
            {event.author_name && (
              <p className="text-sm text-stone-500 mt-0.5">{event.author_name}</p>
            )}
          </div>

          {/* 참여 폼 */}
          <div className="bg-white rounded-2xl border border-stone-100 p-6">
            <h2 className="font-semibold text-stone-900 mb-4">참여하기</h2>
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  이름 <span className="text-red-400">*</span>
                </label>
                <input
                  ref={nameRef}
                  type="text"
                  required
                  placeholder="홍길동"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/40 text-stone-900"
                  style={{ fontSize: '16px', color: '#1c1917' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  소속 / 학년 <span className="text-stone-300 font-normal">(선택)</span>
                </label>
                <input
                  ref={subInfoRef}
                  type="text"
                  placeholder="청년부 / 중3 등"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/40 text-stone-900"
                  style={{ fontSize: '16px', color: '#1c1917' }}
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <CtaBtn
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-primary text-white text-sm font-medium rounded-xl hover:bg-brand-primary/90 disabled:opacity-40 transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    등록 중...
                  </span>
                ) : '참여 시작하기'}
              </CtaBtn>
            </form>
          </div>

          <p className="text-center text-xs text-stone-300 mt-6">
            갓생북 — 휘발되는 기억을, 기록되는 성장으로
          </p>
        </div>
      </div>
    </PageTransition>
  )
}

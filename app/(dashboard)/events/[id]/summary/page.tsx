'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageTransition, CtaBtn, MBtn } from '@/components/ui/motion'

interface EventInfo {
  name: string
  category: string
  dates_start: string | null
  dates_end: string | null
  participant_count: number | null
}

export default function SummaryPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [event, setEvent] = useState<EventInfo | null>(null)
  const [summary, setSummary] = useState('')
  const [summaryId, setSummaryId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: ev } = await supabase
        .from('grace_events')
        .select('name, category, dates_start, dates_end, participant_count')
        .eq('id', id)
        .eq('creator_id', user.id)
        .single()
      if (!ev) { router.push('/dashboard'); return }
      setEvent(ev)

      const { data: content } = await supabase
        .from('grace_group_contents')
        .select('id, content_text')
        .eq('event_id', id)
        .eq('content_type', 'summary')
        .maybeSingle()
      if (content) {
        setSummaryId(content.id)
        setSummary(content.content_text ?? '')
      }
    }
    load()
  }, [id, router])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError('')
    const supabase = createClient()

    if (summaryId) {
      const { error: err } = await supabase
        .from('grace_group_contents')
        .update({ content_text: summary })
        .eq('id', summaryId)
      if (err) { setError('저장 실패: ' + err.message); setSaving(false); return }
    } else {
      const { data, error: err } = await supabase
        .from('grace_group_contents')
        .insert({ event_id: id, content_type: 'summary', content_text: summary })
        .select('id')
        .single()
      if (err || !data) { setError('저장 실패: ' + (err?.message ?? '')); setSaving(false); return }
      setSummaryId(data.id)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleDownloadPdf() {
    if (!printRef.current) return
    setPdfLoading(true)
    const html2pdf = (await import('html2pdf.js')).default
    const opt = {
      margin: [15, 20, 15, 20] as [number, number, number, number],
      filename: `${event?.name ?? '갓생북'}_총평.pdf`,
      image: { type: 'jpeg' as const, quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    }
    await html2pdf().set(opt).from(printRef.current).save()
    setPdfLoading(false)
  }

  const dateStr = event?.dates_start
    ? event.dates_end && event.dates_end !== event.dates_start
      ? `${event.dates_start} ~ ${event.dates_end}`
      : event.dates_start
    : null

  return (
    <PageTransition>
      <div className="min-h-screen bg-brand-surface pb-10">
        <header className="bg-white border-b border-stone-100 px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.push(`/events/${id}`)} className="text-stone-400 hover:text-stone-700 text-sm">
            ← 이벤트
          </button>
          <h1 className="text-base font-bold text-stone-900">마무리 총평</h1>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <p className="text-sm text-stone-500 mb-4">
              이벤트를 마무리하는 리더의 총평을 작성하세요. 저장 후 PDF로 출력할 수 있습니다.
            </p>
            <textarea
              value={summary}
              onChange={e => { setSummary(e.target.value); setSaved(false) }}
              rows={14}
              placeholder="참가자들에게 전하고 싶은 말, 이번 이벤트의 의미, 앞으로의 다짐 등을 자유롭게 작성해 주세요."
              className="w-full text-sm text-stone-700 leading-relaxed border border-stone-200 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#6B1FAD]/40 resize-none placeholder:text-stone-300"
              style={{ fontFamily: "'Noto Serif KR', Georgia, serif" }}
            />
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <CtaBtn
                onClick={handleSave}
                disabled={saving || !summary.trim()}
                className="px-4 py-2 bg-[#6B1FAD] text-white text-sm rounded-lg hover:bg-[#6B1FAD]/90 disabled:opacity-40 transition-colors"
              >
                {saving ? '저장 중...' : saved ? '✓ 저장됨' : '저장'}
              </CtaBtn>
              {summary && (
                <MBtn
                  onClick={handleDownloadPdf}
                  disabled={pdfLoading}
                  className="px-4 py-2 border border-stone-200 text-stone-600 text-sm rounded-lg hover:bg-brand-surface disabled:opacity-40 transition-colors"
                >
                  {pdfLoading ? 'PDF 생성 중...' : '📄 PDF 다운로드'}
                </MBtn>
              )}
              <span className="text-xs text-stone-400 ml-auto">{summary.length}자</span>
            </div>
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          </div>

          {/* PDF 렌더용 히든 영역 */}
          {summary && event && (
            <div className="overflow-hidden h-0">
              <div
                ref={printRef}
                style={{
                  fontFamily: "'Noto Serif KR', Georgia, serif",
                  width: '170mm',
                  padding: '0',
                  color: '#1c1917',
                  backgroundColor: '#fff',
                }}
              >
                <div style={{ minHeight: '60mm', paddingBottom: '10mm', borderBottom: '1px solid #e7e5e4', marginBottom: '12mm' }}>
                  <p style={{ fontSize: '10px', color: '#a8a29e', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {event.category}
                  </p>
                  <h1 style={{ fontSize: '22px', fontWeight: 700, lineHeight: 1.4, marginBottom: '6px' }}>
                    {event.name}
                  </h1>
                  {dateStr && <p style={{ fontSize: '11px', color: '#78716c' }}>{dateStr}</p>}
                  {event.participant_count && (
                    <p style={{ fontSize: '11px', color: '#78716c' }}>{event.participant_count}명 참여</p>
                  )}
                </div>

                <div>
                  <p style={{ fontSize: '11px', color: '#a8a29e', letterSpacing: '2px', marginBottom: '8px' }}>
                    마무리 총평
                  </p>
                  <p style={{ fontSize: '13px', lineHeight: 2.1, color: '#292524', whiteSpace: 'pre-wrap' }}>
                    {summary}
                  </p>
                </div>

                <div style={{ marginTop: '20mm', paddingTop: '6mm', borderTop: '1px solid #e7e5e4', textAlign: 'center' }}>
                  <p style={{ fontSize: '9px', color: '#d6d3d1', letterSpacing: '2px' }}>갓생북</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </PageTransition>
  )
}

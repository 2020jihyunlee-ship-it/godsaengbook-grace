'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageTransition, CtaBtn, MBtn, TypingCursor } from '@/components/ui/motion'

interface EventInfo {
  name: string
  category: string
  dates_start: string | null
  dates_end: string | null
  author_name: string | null
  participant_count: number | null
}

export default function SummaryPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [event, setEvent] = useState<EventInfo | null>(null)
  const [summary, setSummary] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: ev } = await supabase
        .from('events').select('name, category, dates_start, dates_end, author_name, participant_count')
        .eq('id', id).single()
      if (ev) setEvent(ev)

      const { data: book } = await supabase
        .from('books').select('summary').eq('event_id', id).single()
      if (book?.summary) setSummary(book.summary)
    }
    load()
  }, [id])

  async function handleGenerate() {
    setGenerating(true)
    setError('')
    const res = await fetch('/api/ai/generate-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: id }),
    })
    const data = await res.json()
    if (!res.ok || data.error) {
      setError(data.error ?? 'AI 생성 중 오류가 발생했습니다.')
    } else {
      setSummary(data.summary)
    }
    setGenerating(false)
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

          {/* 생성 컨트롤 */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <p className="text-sm text-stone-500 mb-4">
              참가자들이 작성한 에세이를 분석해 리더의 마무리 총평을 AI가 생성합니다.
              생성 후 직접 수정하거나 PDF로 저장할 수 있어요.
            </p>
            <div className="flex gap-2 flex-wrap">
              <CtaBtn
                onClick={handleGenerate}
                disabled={generating}
                className="px-4 py-2 bg-brand-primary text-white text-sm rounded-lg hover:bg-brand-primary/90 disabled:opacity-40 transition-colors"
              >
                {generating ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    AI 총평 생성 중<TypingCursor />
                  </span>
                ) : summary ? '✨ 다시 생성' : '✨ AI 총평 생성'}
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
            </div>
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          </div>

          {/* 총평 미리보기 + 편집 */}
          {summary && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-stone-900">총평 미리보기</h2>
                <span className="text-xs text-stone-400">{summary.length}자</span>
              </div>
              <textarea
                value={summary}
                onChange={e => setSummary(e.target.value)}
                rows={14}
                className="w-full text-sm text-stone-700 leading-relaxed border border-stone-200 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 resize-none"
                style={{ fontFamily: "'Noto Serif KR', Georgia, serif" }}
              />
              <p className="text-xs text-stone-400 mt-2">직접 수정 후 PDF로 저장하세요.</p>
            </div>
          )}

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
                  {event.author_name && <p style={{ fontSize: '11px', color: '#78716c' }}>{event.author_name}</p>}
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

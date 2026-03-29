'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageTransition, CtaBtn, MBtn } from '@/components/ui/motion'

export default function SchedulePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [eventName, setEventName] = useState('')
  const [step, setStep] = useState<'input' | 'select'>('input')
  const [rawText, setRawText] = useState('')
  const [lines, setLines] = useState<{ text: string; checked: boolean }[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: event } = await supabase
        .from('events').select('name').eq('id', id).single()
      if (event) setEventName(event.name)

      const { data: secs } = await supabase
        .from('sections').select('*').eq('event_id', id).order('order')
      if (secs?.length) {
        // 기존 섹션이 있으면 바로 선택 단계로
        setLines(secs.map(s => ({ text: s.book_title, checked: true })))
        setStep('select')
      }
    }
    load()
  }, [id])

  function shouldCheck(line: string): boolean {
    // 날짜/일차 헤더
    if (/^\d+일차/.test(line) || /^day\s*\d+/i.test(line) || /^\d+차시/.test(line)) return false
    // 식사
    if (['식사', '조식', '중식', '석식'].some(k => line.includes(k))) return false
    // 이동·행정 (예배/특강/미션 포함된 줄은 유지)
    const travelWords = ['이동', '체크인', '체크아웃', '수속', '짐 정리', '짐정리', '입국', '출국', '탑승', '공항 도착', '공항 출발']
    if (travelWords.some(k => line.includes(k)) && !['예배', '특강', '미션', '집회'].some(k => line.includes(k))) return false
    return true
  }

  function handleParse() {
    const parsed = rawText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .map(l => ({ text: l, checked: shouldCheck(l) }))
    setLines(parsed)
    setStep('select')
  }

  function toggleLine(i: number) {
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, checked: !l.checked } : l))
  }

  function toggleAll(checked: boolean) {
    setLines(prev => prev.map(l => ({ ...l, checked })))
  }

  const selected = lines.filter(l => l.checked)

  async function handleSave() {
    if (!selected.length) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('sections').delete().eq('event_id', id)
    await supabase.from('sections').insert(
      selected.map((l, i) => ({
        event_id: id,
        order: i + 1,
        original_title: l.text,
        book_title: l.text,
        date: null,
        time: null,
        description: null,
      }))
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); router.push(`/events/${id}`) }, 1000)
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-brand-surface px-4 py-8">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => step === 'select' ? setStep('input') : router.push(`/events/${id}`)}
            className="text-sm text-stone-400 hover:text-stone-700 mb-6 block"
          >
            ← {step === 'select' ? '다시 입력' : '이벤트로 돌아가기'}
          </button>

          <h2 className="text-xl font-bold text-stone-900 mb-1">목차 설정</h2>
          <p className="text-sm text-stone-400 mb-6">{eventName}</p>

          {/* ── 1단계: 텍스트 입력 ── */}
          {step === 'input' && (
            <>
              <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-3">
                <p className="text-sm font-medium text-stone-700 mb-1">일정 또는 목차 붙여넣기</p>
                <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 mb-3 text-xs text-amber-800 space-y-1">
                  <p className="font-medium">✅ 포함되는 항목: 강의, 예배, 미션, 집회, 특강, 활동, 토의 등</p>
                  <p className="font-medium">❌ 자동 제외: 날짜 헤더(1일차), 식사, 이동, 체크인, 수속, 짐 정리</p>
                  <p className="text-amber-600">전체 일정표를 그대로 붙여넣으면 다음 단계에서 자동으로 분류됩니다.</p>
                </div>
                <textarea
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  rows={16}
                  placeholder={'예)\n1강 — 기도의 힘\n2강 — 말씀 묵상법\n3강 — 공동체 생활\n\n날짜, 시간 등이 섞여 있어도 됩니다.\n다음 단계에서 필요한 것만 선택할 수 있습니다.'}
                  className="w-full text-sm text-stone-800 placeholder:text-stone-300 border border-stone-200 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 resize-none leading-relaxed"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <CtaBtn
                onClick={handleParse}
                disabled={!rawText.trim()}
                className="w-full py-3 bg-brand-primary text-white text-sm font-medium rounded-xl hover:bg-brand-primary/90 disabled:opacity-40 transition-colors"
              >
                다음 — 목차 항목 선택 →
              </CtaBtn>
            </>
          )}

          {/* ── 2단계: 항목 선택 ── */}
          {step === 'select' && (
            <>
              <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden mb-3">
                <div className="flex items-center justify-between px-5 py-3 border-b border-stone-50">
                  <p className="text-sm font-medium text-stone-700">목차에 포함할 항목 선택</p>
                  <div className="flex gap-3">
                    <button onClick={() => toggleAll(true)} className="text-xs text-brand-primary">전체 선택</button>
                    <button onClick={() => toggleAll(false)} className="text-xs text-stone-400">전체 해제</button>
                  </div>
                </div>

                <ul className="divide-y divide-stone-50">
                  {lines.map((line, i) => (
                    <li
                      key={i}
                      onClick={() => toggleLine(i)}
                      className="flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors"
                      style={{ backgroundColor: line.checked ? '#FAFAF9' : '#fff' }}
                    >
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors"
                        style={{
                          backgroundColor: line.checked ? '#1A4F8A' : 'transparent',
                          border: line.checked ? 'none' : '1.5px solid #d6d3d1',
                        }}
                      >
                        {line.checked && <span className="text-white text-xs leading-none">✓</span>}
                      </div>
                      <span className="text-sm flex-1" style={{ color: line.checked ? '#1c1917' : '#a8a29e' }}>
                        {line.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-stone-400 text-right mb-3">{selected.length}개 선택됨</p>

              <CtaBtn
                onClick={handleSave}
                disabled={saving || saved || !selected.length}
                className="w-full py-3 bg-brand-primary text-white text-sm font-medium rounded-xl hover:bg-brand-primary/90 disabled:opacity-40 transition-colors"
              >
                {saved ? '✓ 저장됐습니다!' : saving ? '저장 중...' : `목차 저장 (${selected.length}개)`}
              </CtaBtn>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  )
}

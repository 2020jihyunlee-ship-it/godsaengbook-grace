'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

// ── 색상 헬퍼 ──
function getRuleColor(cat?: string) {
  return cat && ['선교', '해외탐방'].some(k => cat.includes(k)) ? '#C07838' : '#C8A84B'
}
function getQuoteColors(cat?: string) {
  return cat && ['선교', '해외탐방'].some(k => cat.includes(k))
    ? { bg: '#FBF4EC', text: '#884010', ref: '#A05820' }
    : { bg: '#FBF8EE', text: '#8A6820', ref: '#B09040' }
}
function getBodyColor(cat?: string) {
  return cat && ['선교', '해외탐방'].some(k => cat.includes(k)) ? '#7A4010' : '#555'
}

// ── 페이지 타입 ──
interface CoverData { type: 'cover'; title: string; sub: string; date: string; category: string }
interface TocData   { type: 'toc';   items: string[]; category: string }
interface PhotoData { type: 'photo'; photo: string; caption: string; date: string; category: string; pageNum: number }
interface EssayData { type: 'essay'; category: string; title: string; body: string; verse: string; ref: string; pageNum: number }
type PageData = CoverData | TocData | PhotoData | EssayData

// ── 스프레드 데이터 ──
const SPREADS: { left: PageData; right: PageData }[] = [
  {
    left: { type: 'cover', title: '2025 여름 수련회', sub: '우리가 함께 만든 기록', date: '2025. 07. 20 — 07. 22', category: '수련회' },
    right: { type: 'toc', category: '수련회', items: ['수련회 · 첫째 날', '수련회 · 선교 아프리카', '성경학교 · 언더우드기념관', '셀 모임 · 목요일'] },
  },
  {
    left:  { type: 'photo', photo: '/sample-retreat.png',      caption: '수련회 · 첫째 날',         date: '2025. 07. 20', category: '수련회', pageNum: 3 },
    right: { type: 'essay', category: '수련회', title: '수련회 · 첫째 날',         body: '강의를 들으며 얼마나 하나님을 의지하지 않고 살았는지 깨달았다. 바쁜 일상 속에서 스스로 모든 걸 해결하려 했던 시간들이 떠올랐다. 저녁 예배 마지막 찬양을 부르며 눈물이 났다. 이유를 정확히 설명할 수는 없지만, 오랫동안 잃어버렸던 무언가를 되찾는 기분이었다.', verse: '내가 산을 향하여 눈을 들리라 나의 도움이 어디서 올까', ref: '시편 121:1', pageNum: 4 },
  },
  {
    left:  { type: 'photo', photo: '/sample-mission.png',      caption: '선교 · 아프리카',          date: '2025. 07. 21', category: '선교', pageNum: 5 },
    right: { type: 'essay', category: '선교',   title: '선교 · 아프리카',          body: '붉은 흙 위에서 아이들과 예배드렸다. 언어도 문화도 달랐지만 같은 하나님을 향해 손을 들었다. 한 아이가 내 손을 꼭 잡았을 때, 말이 통하지 않아도 마음이 닿을 수 있다는 걸 온몸으로 느꼈다. 선교란 내가 전달하러 가는 것이 아니라, 함께 받는 것이기도 하다는 걸 처음 알았다.', verse: '가서 모든 민족을 제자로 삼아', ref: '마태복음 28:19', pageNum: 6 },
  },
  {
    left:  { type: 'photo', photo: '/sample-bible-school.png', caption: '성경학교 · 언더우드기념관', date: '2025. 07. 21', category: '수련회', pageNum: 7 },
    right: { type: 'essay', category: '수련회', title: '성경학교 · 언더우드기념관', body: '100년 전 이 땅에 복음을 심은 헌신이 오늘 내 신앙의 뿌리임을 기념관 앞에서 실감했다. 낯선 땅에서 알지 못하는 이들을 위해 전부를 내어놓은 결단이 지금의 나를 있게 했다. 내가 받은 신앙이 그냥 주어진 것이 아님을, 처음으로 무게 있게 느꼈다.', verse: '믿음의 선진들이 증거하는 것은', ref: '히브리서 12:1', pageNum: 8 },
  },
  {
    left:  { type: 'photo', photo: '/sample-cell.png',         caption: '셀 모임 · 목요일',         date: '2025. 07. 22', category: '수련회', pageNum: 9 },
    right: { type: 'essay', category: '모임',   title: '셀 모임 · 목요일',         body: '서로의 이야기를 들으며 내가 혼자가 아니라는 걸 다시 확인했다. 누군가의 솔직한 고백이 내 마음 깊은 곳을 건드렸다. 세상에서는 늘 완벽한 척 살아야 할 것 같은데, 이 자리에서만큼은 약함을 내려놓을 수 있어서 좋았다. 이 공동체가 있어 감사하다.', verse: '두세 사람이 내 이름으로 모인 곳에 나도 있느니라', ref: '마태복음 18:20', pageNum: 10 },
  },
]

const FLAT: PageData[] = SPREADS.flatMap(s => [s.left, s.right])

// ── 개별 페이지 렌더러 ──
function RenderPage({ data, compact = false }: { data: PageData; compact?: boolean }) {
  if (data.type === 'cover') {
    return (
      <div style={{
        width: '100%', height: '100%', position: 'relative',
        background: 'linear-gradient(150deg, #1A0533 0%, #2D0A5A 55%, #120230 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle, rgba(107,31,173,0.25) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.6), transparent)' }} />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: compact ? '24px 20px' : '32px 28px' }}>
          <div style={{ fontSize: compact ? 8 : 9, letterSpacing: '0.2em', color: 'rgba(201,168,76,0.7)', marginBottom: 18 }}>GOD-SAENG BOOK · GRACE</div>
          <div style={{ width: 1, height: 22, background: 'rgba(201,168,76,0.4)', marginBottom: 16 }} />
          <h1 style={{ fontFamily: "'Gowun Batang', serif", fontSize: compact ? 18 : 22, fontWeight: 500, color: '#fff', lineHeight: 1.35, textAlign: 'center', margin: 0 }}>{data.title}</h1>
          <p style={{ fontFamily: "'Gowun Batang', serif", fontSize: compact ? 10 : 11, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginTop: 10, marginBottom: 16 }}>{data.sub}</p>
          <div style={{ width: 36, height: 0.5, background: 'rgba(201,168,76,0.4)', marginBottom: 14 }} />
          <div style={{ fontSize: compact ? 9 : 10, color: 'rgba(255,255,255,0.35)', textAlign: 'center', letterSpacing: '0.06em', lineHeight: 1.8 }}>
            <p style={{ margin: 0 }}>{data.date}</p>
            <p style={{ margin: 0 }}>{data.category}</p>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 14, fontSize: 7.5, color: 'rgba(255,255,255,0.12)', letterSpacing: '0.12em' }}>MEMORY BOOK</div>
      </div>
    )
  }

  if (data.type === 'toc') {
    return (
      <div style={{ width: '100%', height: '100%', background: '#FAFAF8', display: 'flex', flexDirection: 'column', padding: compact ? '28px 22px' : '36px 30px', overflow: 'hidden' }}>
        <div style={{ fontSize: compact ? 9 : 10, letterSpacing: '0.18em', color: '#C8A84B', marginBottom: compact ? 18 : 24, fontFamily: "'Inter', sans-serif" }}>CONTENTS</div>
        {data.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', padding: `${compact ? 9 : 11}px 0`, borderBottom: '0.5px solid #EBEBEB' }}>
            <span style={{ fontSize: compact ? 10 : 11, color: '#AAA', minWidth: 22, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
            <span style={{ fontSize: compact ? 12 : 13, color: '#1A1A1A', fontFamily: "'Gowun Batang', serif", flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item}</span>
            <span style={{ fontSize: compact ? 10 : 11, color: '#AAA', flexShrink: 0, marginLeft: 8 }}>{(i + 1) * 2 + 1}</span>
          </div>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: 16, fontSize: 9, color: '#CCC', textAlign: 'center', letterSpacing: '0.06em' }}>갓생북 은혜 · Grace</div>
      </div>
    )
  }

  if (data.type === 'photo') {
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
        <img src={data.photo} alt={data.caption} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 30%, rgba(0,0,0,0.82) 100%)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>GOD-SAENG BOOK</div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: compact ? '16px 18px' : '20px 22px', zIndex: 2 }}>
          <div style={{ fontSize: compact ? 9 : 10, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', marginBottom: 5 }}>{data.date}</div>
          <div style={{ fontSize: compact ? 13 : 15, fontWeight: 600, color: '#fff', fontFamily: "'Gowun Batang', serif", textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{data.caption}</div>
        </div>
        <div style={{ position: 'absolute', bottom: 16, right: 18, fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>P.{String(data.pageNum).padStart(2, '0')}</div>
      </div>
    )
  }

  // essay
  const ruleClr = getRuleColor(data.category)
  const qClr = getQuoteColors(data.category)
  const bodyClr = getBodyColor(data.category)
  return (
    <div style={{ width: '100%', height: '100%', background: '#FFFFFF', display: 'flex', flexDirection: 'column', padding: compact ? '28px 22px 40px' : '32px 28px 44px', overflow: 'hidden', position: 'relative' }}>
      <div style={{ fontSize: 10, color: '#999', letterSpacing: '0.14em', marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>{data.category}</div>
      <div style={{ fontFamily: "'Gowun Batang', serif", fontSize: compact ? 16 : 19, fontWeight: 500, color: '#1A1A1A', lineHeight: 1.35, marginBottom: 14, wordBreak: 'keep-all' }}>{data.title}</div>
      <div style={{ width: 28, height: 1.5, background: ruleClr, marginBottom: 18, flexShrink: 0 }} />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <p style={{ fontFamily: "'Gowun Batang', serif", fontSize: compact ? 12.5 : 13.5, color: bodyClr, lineHeight: 2, wordBreak: 'keep-all', margin: 0 }}>{data.body}</p>
      </div>
      <div style={{ marginTop: 18, padding: '14px 16px', borderRadius: 4, background: qClr.bg, flexShrink: 0 }}>
        <p style={{ fontFamily: "'Gowun Batang', serif", fontSize: compact ? 11 : 12, fontStyle: 'italic', lineHeight: 1.8, color: qClr.text, margin: 0 }}>&ldquo;{data.verse}&rdquo;</p>
        <p style={{ fontSize: compact ? 10 : 10.5, color: qClr.ref, marginTop: 6, marginBottom: 0, letterSpacing: '0.04em' }}>— {data.ref}</p>
      </div>
      <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, fontSize: 9, color: '#BBB', textAlign: 'center', letterSpacing: '0.06em' }}>P.{String(data.pageNum).padStart(2, '0')}</div>
    </div>
  )
}

// ── 모바일: 단일 페이지 3D 플립 ──
function MobileFlipbook() {
  const [cur, setCur] = useState(0)
  const [animClass, setAnimClass] = useState('')
  const [busy, setBusy] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const go = useCallback((dir: 1 | -1) => {
    if (busy) return
    const next = cur + dir
    if (next < 0 || next >= FLAT.length) return
    setBusy(true)
    setAnimClass(dir === 1 ? 'flip-fwd' : 'flip-bwd')
    setTimeout(() => {
      setCur(next)
      setAnimClass('')
      setBusy(false)
    }, 480)
  }, [busy, cur])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <style>{`
        @keyframes flipFwd { from { transform: rotateY(0deg) } to { transform: rotateY(-180deg) } }
        @keyframes flipBwd { from { transform: rotateY(0deg) } to { transform: rotateY(180deg) } }
        .flip-fwd { transform-origin: left center; animation: flipFwd 0.48s cubic-bezier(0.4,0,0.2,1) forwards; }
        .flip-bwd { transform-origin: right center; animation: flipBwd 0.48s cubic-bezier(0.4,0,0.2,1) forwards; }
      `}</style>

      {/* 페이지 카드 */}
      <div style={{ width: 'min(320px, calc(100vw - 40px))', aspectRatio: '3 / 4.2', perspective: '1400px' }}>
        <div
          className={animClass}
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
          onTouchEnd={e => {
            if (touchStartX.current === null) return
            const dx = e.changedTouches[0].clientX - touchStartX.current
            if (dx < -40) go(1)
            else if (dx > 40) go(-1)
            touchStartX.current = null
          }}
          style={{ width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 36px rgba(0,0,0,0.22)', backfaceVisibility: 'hidden' }}
        >
          <RenderPage data={FLAT[cur]} compact />
        </div>
      </div>

      {/* 네비게이션 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 'min(320px, calc(100vw - 40px))' }}>
        <button onClick={() => go(-1)} disabled={cur === 0 || busy} style={{ flex: 1, padding: '12px 0', borderRadius: 14, border: '1px solid rgba(201,168,76,0.4)', background: '#fff', color: '#C9A84C', fontSize: 15, fontWeight: 700, cursor: cur === 0 ? 'default' : 'pointer', opacity: cur === 0 ? 0.25 : 1 }}>←</button>
        <div style={{ flex: 2, display: 'flex', gap: 5, justifyContent: 'center', flexWrap: 'wrap' }}>
          {FLAT.map((_, i) => (
            <div key={i} onClick={() => !busy && setCur(i)} style={{ width: i === cur ? 14 : 5, height: 5, borderRadius: 3, background: i === cur ? '#C9A84C' : '#E8D5A3', transition: 'all 0.2s', cursor: 'pointer' }} />
          ))}
        </div>
        <button onClick={() => go(1)} disabled={cur === FLAT.length - 1 || busy} style={{ flex: 1, padding: '12px 0', borderRadius: 14, border: '1px solid rgba(201,168,76,0.4)', background: '#fff', color: '#C9A84C', fontSize: 15, fontWeight: 700, cursor: cur === FLAT.length - 1 ? 'default' : 'pointer', opacity: cur === FLAT.length - 1 ? 0.25 : 1 }}>→</button>
      </div>
      <p style={{ fontSize: 11, color: '#AAA', letterSpacing: '0.04em' }}>← 스와이프해서 넘기기 →</p>
    </div>
  )
}

// ── 데스크탑: 두 페이지 펼침 ──
function DesktopSpread() {
  const [idx, setIdx] = useState(0)

  const prev = () => setIdx(i => Math.max(0, i - 1))
  const next = () => setIdx(i => Math.min(SPREADS.length - 1, i + 1))

  const spread = SPREADS[idx]

  // 책 높이: 너비의 1.42 비율 (A4 근사)
  const bookW = Math.min(680, typeof window !== 'undefined' ? window.innerWidth - 80 : 680)
  const bookH = Math.floor(bookW * 0.71) // 각 페이지는 bookW/2 너비, 1.42 비율

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* 펼침 북 */}
      <div style={{
        width: bookW, height: bookH,
        display: 'flex', borderRadius: 4, overflow: 'hidden',
        boxShadow: '0 8px 48px rgba(0,0,0,0.18)',
        border: '0.5px solid rgba(0,0,0,0.1)',
      }}>
        {/* 좌 페이지 */}
        <div style={{ flex: 1, height: '100%', position: 'relative', overflow: 'hidden', borderRight: '1px solid rgba(0,0,0,0.08)' }}>
          <RenderPage data={spread.left} />
        </div>
        {/* 가운데 바인딩 그림자 */}
        <div style={{
          width: 12, height: '100%', flexShrink: 0,
          background: 'linear-gradient(90deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 40%, rgba(0,0,0,0.02) 60%, rgba(0,0,0,0.08) 100%)',
          pointerEvents: 'none',
        }} />
        {/* 우 페이지 */}
        <div style={{ flex: 1, height: '100%', position: 'relative', overflow: 'hidden' }}>
          <RenderPage data={spread.right} />
        </div>
      </div>

      {/* 네비게이션 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={prev} disabled={idx === 0} style={{ border: '0.5px solid #CCC', background: '#fff', color: '#555', padding: '8px 22px', borderRadius: 8, fontSize: 12, cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.25 : 1, fontFamily: 'inherit' }}>← 이전</button>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {SPREADS.map((_, i) => (
            <div key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 16 : 6, height: 6, borderRadius: 3, background: i === idx ? '#C9A84C' : '#E8D5A3', transition: 'all 0.2s', cursor: 'pointer' }} />
          ))}
        </div>
        <button onClick={next} disabled={idx === SPREADS.length - 1} style={{ border: '0.5px solid #CCC', background: '#fff', color: '#555', padding: '8px 22px', borderRadius: 8, fontSize: 12, cursor: idx === SPREADS.length - 1 ? 'default' : 'pointer', opacity: idx === SPREADS.length - 1 ? 0.25 : 1, fontFamily: 'inherit' }}>다음 →</button>
      </div>
    </div>
  )
}

// ── 메인 컴포넌트 ──
export default function LandingFlipbook() {
  const [isMobile, setIsMobile] = useState(true) // SSR safe: default mobile

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 600)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return isMobile ? <MobileFlipbook /> : <DesktopSpread />
}

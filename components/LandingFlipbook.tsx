'use client'

import { useState, useRef } from 'react'

const CATEGORY = '수련회'

const PAGES = [
  {
    type: 'cover' as const,
    title: '2025 여름 수련회',
    participant: '갓생북 은혜 교회',
    date: '2025. 07. 20 — 07. 22',
    category: '수련회',
    pageNum: 1,
  },
  {
    type: 'photo' as const,
    photo: '/sample-retreat.png',
    caption: '수련회 · 첫째 날',
    date: '2025. 07. 20',
    pageNum: 2,
  },
  {
    type: 'essay' as const,
    category: '수련회',
    title: '수련회 · 첫째 날',
    body: '강의를 들으며 얼마나 하나님을 의지하지 않고 살았는지 깨달았다. 오늘이 다시 시작의 계기가 될 것 같다.',
    verse: '내가 산을 향하여 눈을 들리라 나의 도움이 어디서 올까',
    ref: '시편 121:1',
    pageNum: 3,
  },
  {
    type: 'photo' as const,
    photo: '/sample-mission.png',
    caption: '선교 · 아프리카',
    date: '2025. 07. 21',
    pageNum: 4,
  },
  {
    type: 'essay' as const,
    category: '선교',
    title: '선교 · 아프리카',
    body: '붉은 흙 위에서 아이들과 예배드렸다. 언어도 문화도 달랐지만 같은 하나님을 향해 손을 들었다.',
    verse: '가서 모든 민족을 제자로 삼아',
    ref: '마태복음 28:19',
    pageNum: 5,
  },
  {
    type: 'photo' as const,
    photo: '/sample-bible-school.png',
    caption: '성경학교 · 언더우드기념관',
    date: '2025. 07. 21',
    pageNum: 6,
  },
  {
    type: 'essay' as const,
    category: '수련회',
    title: '성경학교 · 언더우드기념관',
    body: '100년 전 이 땅에 복음을 심은 헌신이 오늘 내 신앙의 뿌리임을 기념관 앞에서 실감했다.',
    verse: '믿음의 선진들이 증거하는 것은',
    ref: '히브리서 12:1',
    pageNum: 7,
  },
  {
    type: 'photo' as const,
    photo: '/sample-cell.png',
    caption: '셀 모임 · 목요일',
    date: '2025. 07. 22',
    pageNum: 8,
  },
  {
    type: 'essay' as const,
    category: '모임',
    title: '셀 모임 · 목요일',
    body: '서로의 이야기를 들으며 내가 혼자가 아니라는 걸 다시 확인했다. 이 공동체가 감사하다.',
    verse: '두세 사람이 내 이름으로 모인 곳에 나도 있느니라',
    ref: '마태복음 18:20',
    pageNum: 9,
  },
]

function getRuleColor(category?: string) {
  if (category === '선교') return '#C07838'
  return '#C8A84B'
}

function getQuoteColors(category?: string) {
  if (category === '선교') return { bg: '#FBF4EC', text: '#884010', ref: '#A05820' }
  return { bg: '#FBF8EE', text: '#8A6820', ref: '#B09040' }
}

function getBodyColor(category?: string) {
  if (category === '선교') return '#7A4010'
  return '#555'
}

function CoverPage({ page }: { page: typeof PAGES[number] & { type: 'cover' } }) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      borderRadius: '4px',
      background: 'linear-gradient(150deg, #1A0533 0%, #2D0A5A 55%, #120230 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* 배경 원형 글로우 */}
      <div style={{
        position: 'absolute',
        width: '280px', height: '280px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(107,31,173,0.25) 0%, transparent 70%)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
      }} />

      {/* 상단 장식선 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.6), transparent)',
      }} />

      {/* 콘텐츠 */}
      <div style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 28px',
      }}>
        {/* 브랜드 */}
        <div style={{
          fontSize: '9px', letterSpacing: '0.2em',
          color: 'rgba(201,168,76,0.7)',
          fontFamily: "'Inter', sans-serif",
          marginBottom: '20px',
        }}>
          GOD-SAENG BOOK · GRACE
        </div>

        {/* 세로 구분선 */}
        <div style={{
          width: '1px', height: '24px',
          backgroundColor: 'rgba(201,168,76,0.4)',
          marginBottom: '18px',
        }} />

        {/* 이벤트 제목 */}
        <h1 style={{
          fontFamily: "'Noto Serif KR', serif",
          fontSize: '22px',
          fontWeight: 500,
          color: '#FFFFFF',
          lineHeight: 1.35,
          textAlign: 'center',
          marginBottom: '10px',
          margin: 0,
        }}>
          {page.title}
        </h1>

        {/* 참여자/교회 */}
        <p style={{
          fontFamily: "'Noto Serif KR', serif",
          fontSize: '11px',
          color: 'rgba(255,255,255,0.55)',
          textAlign: 'center',
          marginTop: '10px',
          marginBottom: '18px',
        }}>
          {page.participant}
        </p>

        {/* 가로 구분선 */}
        <div style={{
          width: '36px', height: '0.5px',
          backgroundColor: 'rgba(201,168,76,0.4)',
          marginBottom: '14px',
        }} />

        {/* 날짜 + 카테고리 */}
        <div style={{
          fontSize: '10px',
          color: 'rgba(255,255,255,0.35)',
          textAlign: 'center',
          letterSpacing: '0.06em',
          lineHeight: 1.8,
        }}>
          <p style={{ margin: 0 }}>{page.date}</p>
          <p style={{ margin: 0 }}>{page.category}</p>
        </div>
      </div>

      {/* 하단 워터마크 */}
      <div style={{
        position: 'absolute', bottom: '14px',
        fontSize: '7.5px', color: 'rgba(255,255,255,0.12)',
        letterSpacing: '0.12em',
        fontFamily: "'Inter', sans-serif",
      }}>
        MEMORY BOOK
      </div>
    </div>
  )
}

function PhotoPage({ page }: { page: typeof PAGES[number] & { type: 'photo' } }) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      borderRadius: '4px',
    }}>
      <img
        src={page.photo}
        alt={page.caption}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {/* 그라데이션 오버레이 */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 30%, rgba(0,0,0,0.82) 100%)',
      }} />
      {/* GOD-SAENG BOOK 워터마크 */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '9px', letterSpacing: '0.2em',
        color: 'rgba(255,255,255,0.35)',
        fontFamily: "'Inter', sans-serif",
        whiteSpace: 'nowrap',
      }}>
        GOD-SAENG BOOK
      </div>
      {/* 하단 캡션 */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 22px', zIndex: 2 }}>
        {page.date && (
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', marginBottom: '5px' }}>
            {page.date}
          </div>
        )}
        <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', fontFamily: "'Noto Serif KR', serif", textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
          {page.caption}
        </div>
      </div>
      {/* 페이지 번호 */}
      <div style={{
        position: 'absolute', bottom: '16px', right: '18px',
        fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em',
      }}>
        P.{String(page.pageNum).padStart(2, '0')}
      </div>
    </div>
  )
}

function EssayPage({ page }: { page: typeof PAGES[number] & { type: 'essay' } }) {
  const ruleClr = getRuleColor(page.category)
  const qClr = getQuoteColors(page.category)
  const bodyClr = getBodyColor(page.category)

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 28px 44px',
      overflow: 'hidden',
      borderRadius: '4px',
    }}>
      {/* 섹션 태그 */}
      <div style={{
        fontSize: '10px',
        color: '#999',
        letterSpacing: '0.14em',
        marginBottom: '12px',
        fontFamily: "'Inter', sans-serif",
      }}>
        {page.category}
      </div>

      {/* 제목 */}
      <div style={{
        fontFamily: "'Noto Serif KR', serif",
        fontSize: '19px',
        fontWeight: 500,
        color: '#1A1A1A',
        lineHeight: 1.35,
        marginBottom: '14px',
        wordBreak: 'keep-all',
      }}>
        {page.title}
      </div>

      {/* 골드 구분선 */}
      <div style={{
        width: '28px', height: '1.5px',
        backgroundColor: ruleClr,
        marginBottom: '18px',
        flexShrink: 0,
      }} />

      {/* 본문 */}
      <div style={{ flex: 1 }}>
        <p style={{
          fontFamily: "'Noto Serif KR', serif",
          fontSize: '13.5px',
          color: bodyClr,
          lineHeight: 2,
          wordBreak: 'keep-all',
          margin: 0,
        }}>
          {page.body}
        </p>
      </div>

      {/* 성경 말씀 박스 */}
      <div style={{
        padding: '14px 16px',
        borderRadius: '4px',
        backgroundColor: qClr.bg,
        flexShrink: 0,
        marginTop: '18px',
      }}>
        <p style={{
          fontFamily: "'Noto Serif KR', serif",
          fontSize: '12px',
          fontStyle: 'italic',
          lineHeight: 1.8,
          color: qClr.text,
          margin: 0,
        }}>
          &ldquo;{page.verse}&rdquo;
        </p>
        <p style={{
          fontSize: '10.5px',
          color: qClr.ref,
          marginTop: '6px',
          letterSpacing: '0.04em',
          marginBottom: 0,
        }}>
          — {page.ref}
        </p>
      </div>

      {/* 페이지 번호 */}
      <div style={{
        position: 'absolute',
        bottom: '14px', left: 0, right: 0,
        textAlign: 'center',
        fontSize: '8.5px',
        color: '#BBB',
        letterSpacing: '0.06em',
        fontFamily: "'Inter', sans-serif",
      }}>
        P.{String(page.pageNum).padStart(2, '0')}
      </div>
    </div>
  )
}

export default function LandingFlipbook() {
  const [idx, setIdx] = useState(0)
  const touchStartX = useRef<number | null>(null)

  function prev() { setIdx(i => Math.max(0, i - 1)) }
  function next() { setIdx(i => Math.min(PAGES.length - 1, i + 1)) }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -40) next()
    else if (dx > 40) prev()
    touchStartX.current = null
  }

  const page = PAGES[idx]

  // 페이지 비율: A4 근사 (3:4.2)
  const W = 320
  const H = Math.floor(W * 1.38)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', paddingBottom: '8px' }}>
      {/* 페이지 카드 */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          width: W,
          height: H,
          maxWidth: 'calc(100vw - 40px)',
          aspectRatio: `${W} / ${H}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative',
          touchAction: 'pan-y',
        }}
      >
        {page.type === 'cover'
          ? <CoverPage page={page as typeof PAGES[number] & { type: 'cover' }} />
          : page.type === 'photo'
          ? <PhotoPage page={page as typeof PAGES[number] & { type: 'photo' }} />
          : <EssayPage page={page as typeof PAGES[number] & { type: 'essay' }} />
        }
      </div>

      {/* 네비게이션 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={prev}
          disabled={idx === 0}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid #E8D5A3',
            color: '#8C6E55',
            fontSize: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: idx === 0 ? 'default' : 'pointer',
            opacity: idx === 0 ? 0.35 : 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >‹</button>

        {/* 페이지 인디케이터 */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {PAGES.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === idx ? 16 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === idx ? '#C9A84C' : '#E8D5A3',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={idx === PAGES.length - 1}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid #E8D5A3',
            color: '#8C6E55',
            fontSize: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: idx === PAGES.length - 1 ? 'default' : 'pointer',
            opacity: idx === PAGES.length - 1 ? 0.35 : 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >›</button>
      </div>
    </div>
  )
}

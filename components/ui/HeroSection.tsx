'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

interface HeroSectionProps {
  title: string
  category: string
  coverPhotoUrl: string | null
  datesStart: string | null
  datesEnd: string | null
  authorName: string | null
  participantName?: string
}

const FALLBACK_GRADIENT = 'var(--hero-fallback, linear-gradient(160deg, #1A1A2E 0%, #1A4F8A 60%, #0d3060 100%))'

export default function HeroSection({
  title,
  category,
  coverPhotoUrl,
  datesStart,
  datesEnd,
  authorName,
  participantName,
}: HeroSectionProps) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  // 섹션 기준 스크롤 추적
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  // 배경: 스크롤 40% 속도로 느리게 이동 (parallax)
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])

  const dateStr = datesStart
    ? datesEnd && datesEnd !== datesStart
      ? `${datesStart} – ${datesEnd}`
      : datesStart
    : null

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        height: '100svh',
        minHeight: '560px',
        overflow: 'hidden',
      }}
    >
      {/* ── 배경 이미지 (parallax) ── */}
      <motion.div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          // 위아래 여유 확보해야 parallax 이동 시 빈 공간 안 생김
          height: '140%',
          top: '-20%',
          y: reduce ? 0 : bgY,
        }}
      >
        {coverPhotoUrl ? (
          <img
            src={coverPhotoUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: FALLBACK_GRADIENT }} />
        )}
      </motion.div>

      {/* ── 다크 오버레이 ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--hero-overlay, linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.65) 100%))',
        }}
      />

      {/* ── 상단 골드 선 ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(184,151,90,0.8), transparent)',
        }}
      />

      {/* ── 콘텐츠 ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'clamp(2rem, 5vw, 3.5rem)',
        }}
      >
        {/* 상단 eyebrow */}
        <motion.p
          initial={reduce ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '11px',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'rgba(184,151,90,0.9)',
            fontStyle: 'italic',
          }}
        >
          {category}
        </motion.p>

        {/* 중앙 — 제목 */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
          style={{ textAlign: 'center' }}
        >
          {/* 골드 장식 */}
          <div
            aria-hidden
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(184,151,90,0.7))' }} />
            <div style={{ width: '4px', height: '4px', background: 'rgba(184,151,90,0.8)', transform: 'rotate(45deg)', flexShrink: 0 }} />
            <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, rgba(184,151,90,0.7), transparent)' }} />
          </div>

          <h1
            style={{
              fontFamily: "'Noto Serif KR', serif",
              fontSize: 'clamp(28px, 7vw, 64px)',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              textShadow: '0 2px 24px rgba(0,0,0,0.4)',
              wordBreak: 'keep-all',
            }}
          >
            {title}
          </h1>

          {participantName && (
            <p
              style={{
                fontFamily: "'Noto Serif KR', serif",
                fontSize: 'clamp(13px, 2vw, 16px)',
                color: 'rgba(255,255,255,0.65)',
                marginTop: '1rem',
              }}
            >
              {participantName}
            </p>
          )}
        </motion.div>

        {/* 하단 — 날짜 + 장소 */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {dateStr && (
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(16px, 3vw, 22px)',
                  fontWeight: 600,
                  color: '#B8975A',
                  letterSpacing: '0.05em',
                  marginBottom: '4px',
                }}
              >
                {dateStr}
              </p>
            )}
            {authorName && (
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(13px, 2vw, 16px)',
                  color: 'rgba(184,151,90,0.75)',
                  fontStyle: 'italic',
                }}
              >
                {authorName}
              </p>
            )}
          </div>

          {/* 스크롤 힌트 */}
          <motion.div
            animate={reduce ? {} : { y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              opacity: 0.5,
            }}
            aria-hidden
          >
            <div style={{ width: '1px', height: '28px', background: 'linear-gradient(to bottom, transparent, #B8975A)' }} />
            <div style={{ width: '4px', height: '4px', borderRight: '1px solid #B8975A', borderBottom: '1px solid #B8975A', transform: 'rotate(45deg)' }} />
          </motion.div>
        </motion.div>
      </div>

      {/* ── 하단 골드 선 ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(184,151,90,0.4), transparent)',
        }}
      />
    </section>
  )
}

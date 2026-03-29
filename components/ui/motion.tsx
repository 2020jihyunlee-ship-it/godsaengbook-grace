'use client'

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import React from 'react'

// ── 공통 transition 설정 ───────────────────────────────────────────
const FAST = { duration: 0.15 }
const MEDIUM = { duration: 0.25, ease: 'easeOut' as const }

// ── 1. 페이지 진입 — fadeIn + slideUp (400ms) ──────────────────────
export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
    </motion.div>
  )
}

// ── 2. 일반 버튼 — hover scale + shadow ──────────────────────────────
export function MBtn({
  children,
  className,
  style,
  type,
  disabled,
  onClick,
  form,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const reduce = useReducedMotion()
  const active = !reduce && !disabled
  return (
    <motion.button
      className={className}
      style={style}
      type={type}
      disabled={disabled}
      form={form}
      onClick={onClick as React.MouseEventHandler}
      whileHover={active ? { scale: 1.02, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' } : undefined}
      whileTap={active ? { scale: 0.97 } : undefined}
      transition={FAST}
      {...(rest as object)}
    >
      {children}
    </motion.button>
  )
}

// ── 3. CTA 버튼 — pulse + hover scale ────────────────────────────────
//    globals.css 에 .cta-pulse 키프레임 추가됨
export function CtaBtn({
  children,
  className,
  style,
  type,
  disabled,
  onClick,
  form,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const reduce = useReducedMotion()
  const active = !reduce && !disabled
  return (
    <motion.button
      className={`${className ?? ''}${active ? ' cta-pulse' : ''}`}
      style={style}
      type={type}
      disabled={disabled}
      form={form}
      onClick={onClick as React.MouseEventHandler}
      whileHover={active ? { scale: 1.02, boxShadow: '0 4px 20px rgba(26,79,138,0.28)' } : undefined}
      whileTap={active ? { scale: 0.97 } : undefined}
      transition={FAST}
      {...(rest as object)}
    >
      {children}
    </motion.button>
  )
}

// ── 4. 카드 — hover float up ──────────────────────────────────────────
export function MCard({
  children,
  className,
  style,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      style={style}
      onClick={onClick}
      whileHover={reduce ? undefined : { y: -3, boxShadow: '0 8px 28px rgba(0,0,0,0.09)' }}
      transition={MEDIUM}
    >
      {children}
    </motion.div>
  )
}

// ── 5. 타이핑 커서 — AI 생성 중 깜빡임 ──────────────────────────────
export function TypingCursor() {
  const reduce = useReducedMotion()
  return (
    <motion.span
      aria-hidden
      className="inline-block w-px h-3.5 bg-current align-middle mx-0.5 rounded-full"
      animate={reduce ? undefined : { opacity: [1, 0, 1] }}
      transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
    />
  )
}

// ── 6. 성공 체크 — 제출 완료 ─────────────────────────────────────────
export function SuccessCheck({ show }: { show: boolean }) {
  const reduce = useReducedMotion()
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          key="check"
          initial={reduce ? { opacity: 1 } : { scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 520, damping: 22 }}
          className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs ml-1.5"
          style={{ backgroundColor: '#22c55e', fontSize: '10px' }}
        >
          ✓
        </motion.span>
      )}
    </AnimatePresence>
  )
}

// ── 7. 컨페티 — 소감 저장 완료 ───────────────────────────────────────
const CONFETTI_COLORS = ['#F4A228', '#1A4F8A', '#E65100', '#22c55e', '#a855f7', '#ec4899']

export function Confetti({ show }: { show: boolean }) {
  const reduce = useReducedMotion()
  if (reduce || !show) return null
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-50"
      style={{ bottom: '96px', left: '50%', transform: 'translateX(-50%)' }}
    >
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * 360
        const r = 44 + (i % 4) * 14
        const x = Math.cos((angle * Math.PI) / 180) * r
        const y = Math.sin((angle * Math.PI) / 180) * r
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-sm"
            style={{ backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length] }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
            animate={{ x, y: y - 50, opacity: 0, scale: 0.1, rotate: 280 }}
            transition={{ duration: 0.75, ease: 'easeOut', delay: i * 0.028 }}
          />
        )
      })}
    </div>
  )
}

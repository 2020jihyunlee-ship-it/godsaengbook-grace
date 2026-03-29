'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'
import { THEME_LIST, type ThemeId } from '@/lib/themes'

interface ThemePickerProps {
  currentThemeId: ThemeId
  onSelect: (id: ThemeId) => void
}

export default function ThemePicker({ currentThemeId, onSelect }: ThemePickerProps) {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()

  return (
    <div style={{ position: 'relative' }}>
      {/* 트리거 버튼 */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          fontFamily: "var(--font-sans, 'Noto Sans KR', sans-serif)",
          fontSize: '11px',
          color: 'var(--color-accent)',
          opacity: 0.75,
          letterSpacing: '0.05em',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
        }}
      >
        테마 변경
      </button>

      {/* 드롭다운 패널 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              zIndex: 100,
              background: 'var(--color-bg)',
              border: '1px solid var(--color-divider)',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              minWidth: '160px',
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: '10px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                marginBottom: '4px',
              }}
            >
              테마 선택
            </p>

            {THEME_LIST.map(theme => (
              <button
                key={theme.id}
                onClick={() => {
                  onSelect(theme.id)
                  setOpen(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: currentThemeId === theme.id ? 'var(--color-accent-soft)' : 'none',
                  border: currentThemeId === theme.id ? '1px solid var(--color-divider)' : '1px solid transparent',
                  borderRadius: '6px',
                  padding: '7px 10px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                {/* 스와치 3색 */}
                <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                  {theme.swatch.map((color, i) => (
                    <div
                      key={i}
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '2px',
                        backgroundColor: color,
                        border: '1px solid rgba(0,0,0,0.08)',
                      }}
                    />
                  ))}
                </div>

                {/* 테마명 */}
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: '12px',
                    color: 'var(--color-text)',
                    fontWeight: currentThemeId === theme.id ? 600 : 400,
                  }}
                >
                  {theme.label}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 바깥 클릭 닫기 */}
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  )
}

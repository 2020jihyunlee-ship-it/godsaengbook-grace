'use client'

import { useState, useEffect, useCallback } from 'react'
import { type ThemeId, getThemeByCategory, applyTheme, THEMES } from '@/lib/themes'

interface UseThemeReturn {
  themeId: ThemeId
  theme: typeof THEMES[ThemeId]
  changeTheme: (id: ThemeId) => void
  isOverridden: boolean
  resetToDefault: () => void
}

export function useTheme(eventId: string, category: string, eventTheme?: string | null): UseThemeReturn {
  const storageKey = `theme_${eventId}`
  const defaultThemeId = (eventTheme && THEMES[eventTheme as ThemeId])
    ? eventTheme as ThemeId
    : getThemeByCategory(category)

  const [themeId, setThemeId] = useState<ThemeId>(() => {
    // 단체 이벤트 지정 테마가 있으면 무조건 그걸 사용
    if (eventTheme && THEMES[eventTheme as ThemeId]) return eventTheme as ThemeId
    if (typeof window === 'undefined') return defaultThemeId
    const saved = localStorage.getItem(storageKey) as ThemeId | null
    return saved && THEMES[saved] ? saved : defaultThemeId
  })

  const [isOverridden, setIsOverridden] = useState(() => {
    if (eventTheme) return false  // 생성자 고정 테마는 오버라이드 아님
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem(storageKey)
    return !!saved && saved !== defaultThemeId
  })

  // 카테고리/eventTheme 로드 후 자동 적용
  useEffect(() => {
    if (eventTheme && THEMES[eventTheme as ThemeId]) {
      setThemeId(eventTheme as ThemeId)
      return
    }
    if (!category) return
    const saved = localStorage.getItem(storageKey) as ThemeId | null
    if (!saved || !THEMES[saved]) {
      setThemeId(defaultThemeId)
    }
  }, [category, eventTheme, defaultThemeId, storageKey])

  // 마운트/변경 시 테마 적용
  useEffect(() => {
    applyTheme(themeId)
  }, [themeId])

  const changeTheme = useCallback((id: ThemeId) => {
    setThemeId(id)
    setIsOverridden(id !== defaultThemeId)
    localStorage.setItem(storageKey, id)
    applyTheme(id)
  }, [storageKey, defaultThemeId])

  const resetToDefault = useCallback(() => {
    setThemeId(defaultThemeId)
    setIsOverridden(false)
    localStorage.removeItem(storageKey)
    applyTheme(defaultThemeId)
  }, [defaultThemeId, storageKey])

  return {
    themeId,
    theme: THEMES[themeId],
    changeTheme,
    isOverridden,
    resetToDefault,
  }
}

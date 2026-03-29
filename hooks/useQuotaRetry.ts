'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const RETRY_SECONDS = 62
const MAX_RETRIES = 2

export function useQuotaRetry(onRetry: () => void) {
  const [countdown, setCountdown] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [gaveUp, setGaveUp] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const retryRef = useRef(onRetry)
  retryRef.current = onRetry

  const startCountdown = useCallback(() => {
    setAttempts(prev => {
      const next = prev + 1
      if (next > MAX_RETRIES) {
        setGaveUp(true)
        return next
      }
      if (timerRef.current) clearInterval(timerRef.current)
      setCountdown(RETRY_SECONDS)
      timerRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(timerRef.current!)
            timerRef.current = null
            retryRef.current()
            return 0
          }
          return c - 1
        })
      }, 1000)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setCountdown(0)
    setAttempts(0)
    setGaveUp(false)
  }, [])

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  return { countdown, startCountdown, reset, isWaiting: countdown > 0, gaveUp }
}

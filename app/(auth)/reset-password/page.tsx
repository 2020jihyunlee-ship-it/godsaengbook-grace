'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PageTransition, MBtn } from '@/components/ui/motion'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // PKCE flow: /auth/confirm 에서 코드 교환 → /update-password로 이동
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm`,
    })

    if (error) {
      setError('이메일 전송 중 오류가 발생했어요. 다시 시도해주세요.')
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center bg-brand-surface px-4">
          <div className="w-full max-w-sm text-center">
            <p className="text-4xl mb-4">📬</p>
            <h2 className="text-xl font-bold text-stone-900 mb-2">이메일을 확인해주세요</h2>
            <p className="text-stone-500 text-sm mb-6">
              <strong>{email}</strong>로 비밀번호 재설정 링크를 보냈어요.
            </p>
            <Link href="/login" className="text-[#6B1FAD] text-sm font-medium hover:underline">
              로그인으로 돌아가기 →
            </Link>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-brand-surface px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img src="/logo.svg" alt="갓생북" className="w-12 h-12 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-[#6B1FAD]">비밀번호 찾기</h1>
            <p className="text-stone-500 mt-1 text-sm">가입한 이메일로 재설정 링크를 보내드려요</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1FAD]/40"
                placeholder="hello@example.com"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <MBtn
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
              style={{ backgroundColor: '#6B1FAD' }}
            >
              {loading ? '전송 중...' : '재설정 링크 보내기'}
            </MBtn>
          </form>

          <p className="text-center text-sm text-stone-500 mt-4">
            <Link href="/login" className="text-[#6B1FAD] font-medium hover:underline">
              ← 로그인으로 돌아가기
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  )
}

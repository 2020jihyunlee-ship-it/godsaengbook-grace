'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PageTransition, MBtn } from '@/components/ui/motion'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const linkExpired = searchParams.get('error') === 'link_expired'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-brand-surface px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img src="/logo.svg" alt="갓생북" className="w-12 h-12 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-brand-primary">갓생북</h1>
            <p className="text-stone-500 mt-1 text-sm">휘발되는 기억을, 기록되는 성장으로</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                placeholder="hello@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                placeholder="••••••••"
              />
            </div>

            <div className="flex justify-end">
              <Link href="/reset-password" className="text-xs text-stone-400 hover:text-brand-primary">
                비밀번호를 잊으셨나요?
              </Link>
            </div>

            {linkExpired && (
              <p className="text-amber-600 text-sm bg-amber-50 rounded-lg px-3 py-2">
                재설정 링크가 만료됐어요. 다시 요청해주세요.{' '}
                <Link href="/reset-password" className="underline font-medium">비밀번호 찾기 →</Link>
              </p>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <MBtn
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? '로그인 중...' : '로그인'}
            </MBtn>
          </form>

          <p className="text-center text-sm text-stone-500 mt-4">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-brand-primary font-medium hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

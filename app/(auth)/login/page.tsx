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
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7FE] px-4">
        <div className="w-full max-w-sm">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-[#1A0533]">
              갓생북 <span className="text-[#6B1FAD]">은혜</span>
            </h1>
            <p className="text-[#6B4E8A] mt-1 text-sm">교회 공동체를 위한 무료 기록 플립북</p>
          </div>

          <form
            onSubmit={handleLogin}
            className="bg-white rounded-2xl shadow-sm border border-[#D8C2EF] p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-[#1A0533] mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#D8C2EF] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1FAD]/30 bg-[#FAF7FE]"
                placeholder="hello@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A0533] mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#D8C2EF] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1FAD]/30 bg-[#FAF7FE]"
                placeholder="••••••••"
              />
            </div>

            <div className="flex justify-end">
              <Link href="/reset-password" className="text-xs text-[#6B4E8A] hover:text-[#6B1FAD]">
                비밀번호를 잊으셨나요?
              </Link>
            </div>

            {linkExpired && (
              <p className="text-amber-600 text-sm bg-amber-50 rounded-lg px-3 py-2">
                재설정 링크가 만료됐어요.{' '}
                <Link href="/reset-password" className="underline font-medium">비밀번호 찾기 →</Link>
              </p>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <MBtn
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#6B1FAD] text-white text-sm font-medium rounded-lg hover:bg-[#5A1590] disabled:opacity-50 transition-colors"
            >
              {loading ? '로그인 중...' : '로그인'}
            </MBtn>
          </form>

          <p className="text-center text-sm text-[#6B4E8A] mt-4">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-[#6B1FAD] font-medium hover:underline">
              무료 회원가입
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

'use client'

import { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PageTransition, MBtn } from '@/components/ui/motion'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultType = searchParams.get('type') === 'team' ? 'team' : 'personal'

  const [accountType, setAccountType] = useState<'personal' | 'team'>(defaultType as 'personal' | 'team')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, account_type: accountType } },
    })

    if (error) {
      setError(error.message === 'User already registered'
        ? '이미 가입된 이메일입니다.'
        : '회원가입 중 오류가 발생했습니다.')
      setLoading(false)
      return
    }

    if (data.session) {
      router.push('/dashboard')
      router.refresh()
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
              <strong>{email}</strong>로 인증 링크를 보냈어요.<br />
              메일함을 확인하고 링크를 클릭하면 바로 시작할 수 있어요.
            </p>
            <Link href="/login" className="text-brand-primary text-sm font-medium hover:underline">
              로그인 페이지로 →
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
            <h1 className="text-2xl font-bold text-brand-primary">갓생북</h1>
            <p className="text-stone-500 mt-1 text-sm">휘발되는 기억을, 기록되는 성장으로</p>
          </div>

          {/* 계정 타입 선택 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => setAccountType('personal')}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                accountType === 'personal'
                  ? 'border-brand-primary bg-orange-50'
                  : 'border-stone-200 bg-white'
              }`}
            >
              <p className="text-xl mb-1">👤</p>
              <p className={`text-sm font-semibold ${accountType === 'personal' ? 'text-brand-primary' : 'text-stone-700'}`}>
                개인으로
              </p>
              <p className="text-xs text-stone-400 mt-0.5">여행기·포토북·에세이</p>
            </button>
            <button
              type="button"
              onClick={() => setAccountType('team')}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                accountType === 'team'
                  ? 'border-brand-primary bg-orange-50'
                  : 'border-stone-200 bg-white'
              }`}
            >
              <p className="text-xl mb-1">👥</p>
              <p className={`text-sm font-semibold ${accountType === 'team' ? 'text-brand-primary' : 'text-stone-700'}`}>
                팀/단체로
              </p>
              <p className="text-xs text-stone-400 mt-0.5">수련회·행사·소감집</p>
            </button>
          </div>

          <form onSubmit={handleSignup} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">이름</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                placeholder="홍길동"
              />
            </div>
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
                minLength={6}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                placeholder="6자 이상"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <MBtn
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? '가입 중...' : '회원가입'}
            </MBtn>
          </form>

          <p className="text-center text-sm text-stone-500 mt-4">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-brand-primary font-medium hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}

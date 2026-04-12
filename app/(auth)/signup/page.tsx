'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  const [churchName, setChurchName] = useState('')
  const [marketingConsent, setMarketingConsent] = useState(false)
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
      options: {
        data: {
          name,
          church_name: churchName,
          account_type: accountType,
          marketing_consent: marketingConsent,
        },
      },
    })

    if (error) {
      setError(
        error.message === 'User already registered'
          ? '이미 가입된 이메일입니다.'
          : '회원가입 중 오류가 발생했습니다.'
      )
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
        <div className="min-h-screen flex items-center justify-center bg-[#FAF7FE] px-4">
          <div className="w-full max-w-sm text-center">
            <p className="text-5xl mb-4">📬</p>
            <h2 className="text-xl font-semibold text-[#1A0533] mb-2">이메일을 확인해주세요</h2>
            <p className="text-[#6B4E8A] text-sm mb-6 leading-relaxed">
              <strong>{email}</strong>로 인증 링크를 보냈어요.<br />
              메일함을 확인하고 링크를 클릭하면 바로 시작할 수 있어요.
            </p>
            <Link href="/login" className="text-[#6B1FAD] text-sm font-medium hover:underline">
              로그인 페이지로 →
            </Link>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7FE] px-4 py-10">
        <div className="w-full max-w-sm">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-[#1A0533]">
              갓생북 <span className="text-[#6B1FAD]">은혜</span>
            </h1>
            <p className="text-[#6B4E8A] mt-1 text-sm">교회 공동체를 위한 무료 기록 플립북</p>
          </div>

          {/* 계정 타입 선택 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { value: 'personal', icon: '👤', label: '개인으로', desc: '혼자 묵상·기록' },
              { value: 'team', icon: '👥', label: '팀/단체로', desc: '수련회·선교·모임' },
            ].map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setAccountType(t.value as 'personal' | 'team')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  accountType === t.value
                    ? 'border-[#6B1FAD] bg-[#F0E8FA]'
                    : 'border-[#D8C2EF] bg-white'
                }`}
              >
                <p className="text-xl mb-1">{t.icon}</p>
                <p className={`text-sm font-semibold ${accountType === t.value ? 'text-[#5A1590]' : 'text-[#1A0533]'}`}>
                  {t.label}
                </p>
                <p className="text-xs text-[#6B4E8A] mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>

          {/* 폼 */}
          <form
            onSubmit={handleSignup}
            className="bg-white rounded-2xl shadow-sm border border-[#D8C2EF] p-6 space-y-4"
          >
            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-[#1A0533] mb-1">이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#D8C2EF] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1FAD]/30 bg-[#FAF7FE]"
                placeholder="홍길동"
              />
            </div>

            {/* 소속 교회 */}
            <div>
              <label className="block text-sm font-medium text-[#1A0533] mb-1">
                소속 교회 <span className="text-[#6B4E8A] font-normal">(선택)</span>
              </label>
              <input
                type="text"
                value={churchName}
                onChange={(e) => setChurchName(e.target.value)}
                className="w-full px-3 py-2 border border-[#D8C2EF] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1FAD]/30 bg-[#FAF7FE]"
                placeholder="예) 한국중앙교회"
              />
            </div>

            {/* 이메일 */}
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

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-[#1A0533] mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-[#D8C2EF] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1FAD]/30 bg-[#FAF7FE]"
                placeholder="6자 이상"
              />
            </div>

            {/* 마케팅 수신 동의 */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-0.5 accent-[#6B1FAD]"
              />
              <span className="text-xs text-[#6B4E8A] leading-relaxed">
                갓생북 은혜의 새 기능 및 업데이트 소식을 이메일로 받겠습니다.{' '}
                <span className="text-[#5A1590]">(선택)</span>
              </span>
            </label>

            <p className="text-xs text-[#6B4E8A]">
              서비스 공지를 위해 이메일 주소는 수집됩니다.
            </p>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <MBtn
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#6B1FAD] text-white text-sm font-medium rounded-lg hover:bg-[#5A1590] disabled:opacity-50 transition-colors"
            >
              {loading ? '가입 중...' : '무료로 시작하기'}
            </MBtn>
          </form>

          <p className="text-center text-sm text-[#6B4E8A] mt-4">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-[#6B1FAD] font-medium hover:underline">
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

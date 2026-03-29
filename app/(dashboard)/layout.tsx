'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard', label: '이벤트 목록', icon: '📋' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F5F4F0' }}>

      {/* 사이드바 — PC만 표시 */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-white border-r border-stone-100 min-h-screen sticky top-0 h-screen">
        {/* 로고 */}
        <div className="px-5 py-5 border-b border-stone-100">
          <p className="font-bold text-stone-900" style={{ fontFamily: "'Noto Serif KR', serif", fontSize: '16px' }}>
            갓생북
          </p>
          <p className="text-xs text-stone-400 mt-0.5">관리자</p>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                style={{
                  backgroundColor: isActive ? '#FFF8EC' : 'transparent',
                  color: isActive ? '#1A4F8A' : '#78716c',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* 하단 계정 */}
        <div className="px-3 py-4 border-t border-stone-100">
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-400 hover:text-stone-700 hover:bg-stone-50 w-full transition-colors">
              <span>↩</span>
              로그아웃
            </button>
          </form>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 min-w-0">
        {children}
      </div>

    </div>
  )
}

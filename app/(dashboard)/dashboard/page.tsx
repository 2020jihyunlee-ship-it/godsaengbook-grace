import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Event } from '@/types'
import { PageTransition, MBtn } from '@/components/ui/motion'
import { EventCard } from '@/components/ui/EventCard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users').select('*').eq('id', user.id).single()

  const { data: events } = await supabase
    .from('events').select('*').eq('creator_id', user.id).order('created_at', { ascending: false })

  const isPersonal = (profile?.account_type ?? 'personal') === 'personal'
  const newHref = isPersonal ? '/events/new?type=personal' : '/events/new'

  return (
    <PageTransition>
      <div className="min-h-screen bg-brand-surface">

        {/* 모바일 전용 헤더 */}
        <header className="md:hidden bg-white border-b border-stone-100 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="w-7 h-7" />
            <h1 className="text-lg font-bold text-brand-primary">갓생북</h1>
          </div>
          <form action="/auth/signout" method="post">
            <button className="text-sm text-stone-500 hover:text-stone-900">로그아웃</button>
          </form>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                {profile?.name ?? user.email} 님의 {isPersonal ? '기록' : '이벤트'}
              </h2>
              <p className="text-stone-500 text-sm mt-0.5">
                {isPersonal ? '개인' : '팀/단체'} · 크레딧 {profile?.credits ?? 0}개 남음
              </p>
            </div>
            <MBtn className="px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary/90 transition-colors">
              <Link href={newHref}>{isPersonal ? '+ 새 기록' : '+ 새 이벤트'}</Link>
            </MBtn>
          </div>

          {!events?.length ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center">
              <p className="text-4xl mb-4">{isPersonal ? '📖' : '🎉'}</p>
              <p className="text-stone-400 text-sm mb-4">
                {isPersonal ? '아직 만든 기록이 없어요.' : '아직 생성된 이벤트가 없어요.'}
              </p>
              <MBtn className="inline-block px-5 py-2.5 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary/90 transition-colors">
                <Link href={newHref}>{isPersonal ? '첫 기록 만들기' : '첫 이벤트 만들기'}</Link>
              </MBtn>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event: Event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { GraceEvent } from '@/types'
import { PageTransition, MBtn } from '@/components/ui/motion'

const CATEGORY_ICON: Record<string, string> = {
  '수련회': '⛺',
  '선교': '✈️',
  '캠프': '🌿',
  '예배': '🕊️',
  '모임': '🤝',
  '개인': '📖',
}

function EventCard({ event }: { event: GraceEvent }) {
  const icon = CATEGORY_ICON[event.category] ?? '📌'
  const start = event.dates_start ? new Date(event.dates_start).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : null
  const end = event.dates_end ? new Date(event.dates_end).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : null

  return (
    <Link href={`/events/${event.id}`}>
      <div className="bg-white border border-[#E8D5A3] rounded-2xl p-4 hover:border-[#C9A84C] hover:shadow-sm transition-all flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#F5EFE4] flex items-center justify-center text-2xl flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[#3D2B1F] truncate">{event.name}</p>
          <p className="text-xs text-[#8C6E55] mt-0.5">
            {event.category}
            {start && ` · ${start}${end && end !== start ? ` ~ ${end}` : ''}`}
          </p>
        </div>
        <div className="flex-shrink-0">
          {event.event_type === 'group' && event.qr_code_url && (
            <span className="text-xs bg-[#F5EFE4] text-[#A8853A] border border-[#E8D5A3] px-2 py-0.5 rounded-full">QR</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('grace_users').select('*').eq('id', user.id).single()

  const { data: events } = await supabase
    .from('grace_events')
    .select('*')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })

  const displayName = profile?.name ?? user.email?.split('@')[0] ?? '리더'

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FDFAF5]">

        {/* 헤더 */}
        <header className="bg-[#FDFAF5]/95 backdrop-blur border-b border-[#E8D5A3] px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <h1 className="font-serif text-lg font-semibold text-[#3D2B1F]">
            갓생북 <span className="text-[#C9A84C]">은혜</span>
          </h1>
          <form action="/auth/signout" method="post">
            <button className="text-xs text-[#8C6E55] hover:text-[#3D2B1F] transition-colors">로그아웃</button>
          </form>
        </header>

        <main className="max-w-lg mx-auto px-4 py-8">

          {/* 인사 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-[#3D2B1F]">
                {displayName} 님
              </h2>
              <p className="text-sm text-[#8C6E55] mt-0.5">
                {profile?.church_name ?? '갓생북 은혜에 오신 것을 환영해요'}
              </p>
            </div>
            <Link href="/events/new">
              <MBtn className="px-4 py-2 bg-[#C9A84C] text-white text-sm font-medium rounded-full hover:bg-[#A8853A] transition-colors">
                + 새 이벤트
              </MBtn>
            </Link>
          </div>

          {/* 이벤트 목록 */}
          {!events?.length ? (
            <div className="bg-white border border-[#E8D5A3] rounded-2xl p-10 text-center">
              <p className="text-4xl mb-4">✦</p>
              <p className="text-[#8C6E55] text-sm mb-5">
                아직 만든 이벤트가 없어요.<br />
                수련회, 선교여행, 셀 모임을 시작해보세요.
              </p>
              <Link href="/events/new">
                <MBtn className="inline-block px-6 py-2.5 bg-[#C9A84C] text-white text-sm font-medium rounded-full hover:bg-[#A8853A] transition-colors">
                  첫 이벤트 만들기
                </MBtn>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event: GraceEvent) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  )
}

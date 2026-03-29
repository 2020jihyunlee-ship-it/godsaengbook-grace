'use client'

import Link from 'next/link'
import { MCard } from './motion'
import type { Event } from '@/types'

const statusLabel = { draft: '초안', active: '진행중', completed: '완료' }
const statusColor: Record<string, string> = {
  active: 'bg-green-50 text-green-600',
  completed: 'bg-stone-100 text-stone-500',
  draft: 'bg-amber-50 text-amber-600',
}

export function EventCard({ event }: { event: Event }) {
  return (
    <MCard className="bg-white rounded-2xl border border-stone-100">
      <Link href={`/events/${event.id}`} className="block p-5 hover:border-stone-300 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-stone-900">{event.name}</p>
            <p className="text-sm text-stone-400 mt-0.5">
              {event.event_type === 'group' ? '단체 이벤트' : '개인 기록'} · {event.category}
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${statusColor[event.status]}`}>
            {statusLabel[event.status]}
          </span>
        </div>
      </Link>
    </MCard>
  )
}

import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import ShareFlipbook from './ShareFlipbook'
import type { GraceEntry } from '@/types'

export const dynamic = 'force-dynamic'

export default async function SharePage({ params }: { params: { participantId: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { participantId } = params

  const [{ data: participant }, { data: entries }] = await Promise.all([
    supabase.from('grace_participants').select('id, name, event_id').eq('id', participantId).single(),
    supabase.from('grace_entries').select('*').eq('participant_id', participantId),
  ])

  if (!participant) notFound()

  const [{ data: event }, { data: sections }] = await Promise.all([
    supabase.from('grace_events').select('id, name, category, dates_start, dates_end').eq('id', participant.event_id).single(),
    supabase.from('grace_sections').select('*').eq('event_id', participant.event_id).order('order'),
  ])

  if (!event || !sections) notFound()

  const entriesMap: Record<string, GraceEntry> = {}
  entries?.forEach((e: GraceEntry) => { if (e.section_id) entriesMap[e.section_id] = e })

  return (
    <ShareFlipbook
      event={event}
      sections={sections}
      entries={entriesMap}
      participantName={participant.name}
    />
  )
}

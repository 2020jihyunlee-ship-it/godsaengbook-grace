import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { participantId, eventId, sectionId, bodyText, bibleVerse, quoteText, photoUrl, isDraft } = body

  if (!participantId || !eventId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 기존 엔트리 조회 (Supabase 체이닝은 새 객체 반환 → 반드시 재할당)
  let query = supabase
    .from('grace_entries')
    .select('id')
    .eq('participant_id', participantId)
    .eq('event_id', eventId)

  if (sectionId) {
    query = query.eq('section_id', sectionId)
  } else {
    query = query.is('section_id', null)
  }

  const { data: existing } = await query.maybeSingle()

  const payload = {
    event_id: eventId,
    section_id: sectionId ?? null,
    participant_id: participantId,
    body_text: bodyText ?? null,
    bible_verse: bibleVerse ?? null,
    quote_text: quoteText ?? null,
    photo_url: photoUrl ?? null,
    is_draft: isDraft ?? false,
    updated_at: new Date().toISOString(),
  }

  let savedEntry = null
  if (existing) {
    const { data, error } = await supabase
      .from('grace_entries')
      .update(payload)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    savedEntry = data
  } else {
    const { data, error } = await supabase
      .from('grace_entries')
      .insert(payload)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    savedEntry = data
  }

  // 완료된 기록 수 갱신 (is_draft=false 일 때)
  if (!isDraft && savedEntry) {
    const { data: allEntries } = await supabase
      .from('grace_entries')
      .select('id, is_draft')
      .eq('participant_id', participantId)
      .not('section_id', 'is', null)
    const count = (allEntries ?? []).filter(e => !e.is_draft).length
    await supabase
      .from('grace_participants')
      .update({ record_count: count })
      .eq('id', participantId)
  }

  return NextResponse.json({ entry: savedEntry })
}

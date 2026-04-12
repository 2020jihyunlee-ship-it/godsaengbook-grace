import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const { eventId, name, subInfo, sessionToken } = await request.json()

  if (!eventId || !name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 이벤트 활성 여부 확인
  const { data: event } = await supabase
    .from('grace_events')
    .select('id, status')
    .eq('id', eventId)
    .eq('status', 'active')
    .single()

  if (!event) {
    return NextResponse.json({ error: '이벤트를 찾을 수 없거나 종료되었습니다.' }, { status: 404 })
  }

  const token = sessionToken ?? crypto.randomUUID()

  // 이미 같은 session_token이 있으면 기존 것 반환
  if (sessionToken) {
    const { data: existing } = await supabase
      .from('grace_participants')
      .select('*')
      .eq('event_id', eventId)
      .eq('session_token', sessionToken)
      .maybeSingle()
    if (existing) return NextResponse.json({ participant: existing })
  }

  const { data: participant, error } = await supabase
    .from('grace_participants')
    .insert({
      event_id: eventId,
      name,
      sub_info: subInfo || null,
      session_token: token,
      record_count: 0,
    })
    .select()
    .single()

  if (error || !participant) {
    return NextResponse.json({ error: error?.message ?? '참여 등록 오류' }, { status: 500 })
  }

  return NextResponse.json({ participant })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/events/[id] — 이벤트 상태 변경
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const body = await req.json()
  const { status } = body

  if (!['draft', 'active', 'completed'].includes(status)) {
    return NextResponse.json({ error: '유효하지 않은 상태값' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('events')
    .update({ status })
    .eq('id', id)
    .eq('creator_id', user.id)
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: '업데이트 실패' }, { status: 500 })
  return NextResponse.json({ event: data })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/events/[id]/contents — 공지 또는 단체 사진 업로드
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  // creator 확인
  const { data: event } = await supabase
    .from('events').select('id').eq('id', id).eq('creator_id', user.id).single()
  if (!event) return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  const formData = await req.formData()
  const contentType = formData.get('content_type') as string
  const contentText = formData.get('content_text') as string | null
  const file = formData.get('file') as File | null

  if (!['notice', 'photo'].includes(contentType)) {
    return NextResponse.json({ error: '유효하지 않은 content_type' }, { status: 400 })
  }

  let fileUrl: string | null = null

  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    const path = `group/${id}/${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('photos').upload(path, file, { upsert: false })
    if (!uploadErr) {
      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path)
      fileUrl = urlData.publicUrl
    }
  }

  const { data, error } = await supabase
    .from('group_contents')
    .insert({ event_id: id, content_type: contentType, content_text: contentText || null, file_url: fileUrl })
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: '저장 실패' }, { status: 500 })
  return NextResponse.json({ content: data })
}

// DELETE /api/events/[id]/contents?content_id=xxx
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const contentId = req.nextUrl.searchParams.get('content_id')
  if (!contentId) return NextResponse.json({ error: 'content_id 필요' }, { status: 400 })

  const { data: event } = await supabase
    .from('events').select('id').eq('id', id).eq('creator_id', user.id).single()
  if (!event) return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  await supabase.from('group_contents').delete().eq('id', contentId).eq('event_id', id)
  return NextResponse.json({ ok: true })
}

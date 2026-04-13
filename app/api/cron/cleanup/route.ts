import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Vercel Cron은 Authorization: Bearer <CRON_SECRET> 헤더를 붙여 호출합니다.
// 환경변수 CRON_SECRET을 Vercel 대시보드에 등록해야 합니다.
export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 이벤트 종료일 기준 30일 경과한 이벤트 조회
  // dates_end 없으면 dates_start, 둘 다 없으면 created_at 기준
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  const cutoffIso = cutoff.toISOString().slice(0, 10) // YYYY-MM-DD

  const { data: events, error: evErr } = await supabase
    .from('grace_events')
    .select('id, toc_photo_url, dates_end, dates_start, created_at')
    .or(
      `dates_end.lte.${cutoffIso},` +
      `and(dates_end.is.null,dates_start.lte.${cutoffIso}),` +
      `and(dates_end.is.null,dates_start.is.null,created_at.lte.${cutoff.toISOString()})`
    )

  if (evErr) {
    console.error('[cleanup] fetch events error:', evErr.message)
    return NextResponse.json({ error: evErr.message }, { status: 500 })
  }

  if (!events || events.length === 0) {
    return NextResponse.json({ deleted: 0, message: '삭제할 이벤트 없음' })
  }

  const deletedIds: string[] = []
  const errors: string[] = []

  for (const event of events) {
    try {
      // 1. 이 이벤트의 모든 사진 URL 수집
      const { data: entries } = await supabase
        .from('grace_entries')
        .select('photo_url')
        .eq('event_id', event.id)
        .not('photo_url', 'is', null)

      const photoUrls: string[] = []
      if (event.toc_photo_url) photoUrls.push(event.toc_photo_url)
      entries?.forEach(e => { if (e.photo_url) photoUrls.push(e.photo_url) })

      // 2. Storage 파일 삭제 (URL → 경로 추출)
      if (photoUrls.length > 0) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const bucketPrefix = `${supabaseUrl}/storage/v1/object/public/photos/`
        const storagePaths = photoUrls
          .filter(url => url.startsWith(bucketPrefix))
          .map(url => url.slice(bucketPrefix.length))

        if (storagePaths.length > 0) {
          await supabase.storage.from('photos').remove(storagePaths)
        }
      }

      // 3. DB 레코드 삭제 (cascade 없는 경우 순서대로)
      await supabase.from('grace_entries').delete().eq('event_id', event.id)
      await supabase.from('grace_participants').delete().eq('event_id', event.id)
      await supabase.from('grace_sections').delete().eq('event_id', event.id)
      await supabase.from('grace_events').delete().eq('id', event.id)

      deletedIds.push(event.id)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      errors.push(`${event.id}: ${msg}`)
      console.error('[cleanup] event', event.id, msg)
    }
  }

  console.log(`[cleanup] deleted ${deletedIds.length} events, errors: ${errors.length}`)
  return NextResponse.json({ deleted: deletedIds.length, ids: deletedIds, errors })
}

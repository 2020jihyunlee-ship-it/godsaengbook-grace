import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/update-password'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      const u = data.user
      await supabase.from('grace_users').upsert({
        id: u.id,
        email: u.email,
        name: u.user_metadata?.name ?? null,
        church_name: u.user_metadata?.church_name ?? null,
        marketing_consent: u.user_metadata?.marketing_consent ?? false,
      }, { onConflict: 'id' })
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 코드가 없거나 교환 실패 → 로그인으로
  return NextResponse.redirect(`${origin}/login?error=link_expired`)
}

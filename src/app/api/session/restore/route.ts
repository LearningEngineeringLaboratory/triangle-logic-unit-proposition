import { NextRequest, NextResponse } from 'next/server'
import { supabase, setAppUser } from '@/lib/supabase'
import type { ApiResponse, RestoreSessionResponse, SessionData } from '@/lib/types'

const SESSION_TTL_MS = 24 * 60 * 60 * 1000

export async function POST(req: NextRequest) {
  const session_id = req.cookies.get('session_id')?.value

  if (!session_id) {
    return NextResponse.json<ApiResponse<RestoreSessionResponse>>({ success: true, data: { isReturningUser: false } })
  }

  const since = new Date(Date.now() - SESSION_TTL_MS).toISOString()

  const { data, error } = await supabase
    .from('sessions')
    .select('session_id, user_id, created_at, last_activity, users!inner(name, email, user_id)')
    .eq('session_id', session_id)
    .gte('last_activity', since)
    .maybeSingle()

  if (error) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: 'db_error' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json<ApiResponse<RestoreSessionResponse>>({ success: true, data: { isReturningUser: false } })
  }

  const session: SessionData = {
    session_id: data.session_id,
    user_id: data.user_id,
    created_at: data.created_at,
    last_activity: data.last_activity,
  }

  await setAppUser(data.user_id)
  await supabase
    .from('sessions')
    .update({ last_activity: new Date().toISOString() })
    .eq('session_id', data.session_id)

  return NextResponse.json<ApiResponse<RestoreSessionResponse>>({
    success: true,
    data: {
      session,
      user: (data as unknown as { users: { name: string; email: string; user_id: string } }).users,
      isReturningUser: true,
    },
  })
}



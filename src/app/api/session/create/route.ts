import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { ApiResponse, CreateSessionRequestBody, CreateSessionResponse, SessionData } from '@/lib/types'
import { setAppUser } from '@/lib/supabase'
import { ulid } from 'ulid'

const SESSION_TTL_MS = 24 * 60 * 60 * 1000

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CreateSessionRequestBody
  const user_id = body?.user_id
  if (!user_id) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: 'invalid_request' }, { status: 400 })
  }

  const session_id = ulid()
  const now = new Date().toISOString()

  await setAppUser(user_id)
  const { error } = await supabase
    .from('sessions')
    .insert({ session_id, user_id, created_at: now, last_activity: now })

  if (error) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: 'db_error' }, { status: 500 })
  }

  const session: SessionData = { session_id, user_id, created_at: now, last_activity: now }

  const res = NextResponse.json<ApiResponse<CreateSessionResponse>>({ success: true, data: { session } })
  // HttpOnly Cookie に保存
  res.cookies.set('session_id', session_id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  })
  return res
}



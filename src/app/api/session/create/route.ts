import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { generateUlid, setSessionId } from '@/lib/session'

interface CreateSessionBody {
  user_id: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateSessionBody

    if (!body.user_id) {
      return NextResponse.json(
        { success: false, error: 'user_id is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // ユーザーの存在確認
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', body.user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'user_not_found' },
        { status: 404 }
      )
    }

    // セッションを作成
    const sessionId = generateUlid()
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        session_id: sessionId,
        user_id: body.user_id,
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
      })
      .select('session_id, user_id, created_at, last_activity')
      .single()

    if (sessionError) {
      console.error('Session creation error:', sessionError)
      return NextResponse.json(
        { success: false, error: 'session_creation_failed' },
        { status: 500 }
      )
    }

    // CookieにセッションIDを設定
    await setSessionId(sessionId)

    return NextResponse.json({
      success: true,
      data: {
        session_id: session.session_id,
        user_id: session.user_id,
        created_at: session.created_at,
        last_activity: session.last_activity,
      },
    })
  } catch (err) {
    console.error('Create session route error:', err)
    return NextResponse.json(
      { success: false, error: 'server_error' },
      { status: 500 }
    )
  }
}


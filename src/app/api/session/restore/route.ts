import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { getSessionId } from '@/lib/session'

export async function POST() {
  try {
    const sessionId = await getSessionId()

    if (!sessionId) {
      return NextResponse.json({
        success: true,
        data: null,
      })
    }

    const supabase = getSupabaseAdmin()

    // セッションの有効性をチェック（24時間以内）
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select(
        `
        session_id,
        user_id,
        created_at,
        last_activity,
        users!inner(user_id, name, email)
        `
      )
      .eq('session_id', sessionId)
      .gte('last_activity', twentyFourHoursAgo)
      .single()

    if (sessionError || !session) {
      // セッションが無効または期限切れ
      return NextResponse.json({
        success: true,
        data: null,
      })
    }

    // セッションの最終活動日時を更新
    await supabase
      .from('sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('session_id', sessionId)

    // usersは配列として返される可能性があるため、型安全にアクセス
    const user = Array.isArray(session.users) ? session.users[0] : session.users

    if (!user) {
      return NextResponse.json({
        success: true,
        data: null,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        session_id: session.session_id,
        user_id: session.user_id,
        created_at: session.created_at,
        last_activity: session.last_activity,
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
        },
      },
    })
  } catch (err) {
    console.error('Restore session route error:', err)
    return NextResponse.json(
      { success: false, error: 'server_error' },
      { status: 500 }
    )
  }
}


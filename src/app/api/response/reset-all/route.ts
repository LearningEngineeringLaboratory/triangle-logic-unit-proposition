import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { getSessionId } from '@/lib/session'

export async function POST() {
  try {
    const sessionId = await getSessionId()

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'session_not_found',
      }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()

    // セッションIDからuser_idを取得
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('user_id')
      .eq('session_id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'session_not_found' },
        { status: 401 }
      )
    }

    // 全クリア済み問題のResponseデータを削除
    const { error: deleteError } = await supabase
      .from('responses')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', session.user_id)
      .eq('is_completed', true)

    if (deleteError) {
      console.error('Response delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'delete_failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { message: 'All completed responses reset successfully' },
    })
  } catch (err) {
    console.error('Reset all responses route error:', err)
    return NextResponse.json(
      { success: false, error: 'server_error' },
      { status: 500 }
    )
  }
}


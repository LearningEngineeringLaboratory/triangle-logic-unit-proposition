import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { getSessionId } from '@/lib/session'

export async function GET() {
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

    // クリア済み問題のリストを取得
    const { data: responses, error: responseError } = await supabase
      .from('responses')
      .select('problem_id, is_completed')
      .eq('session_id', sessionId)
      .eq('user_id', session.user_id)
      .eq('is_completed', true)

    if (responseError) {
      console.error('Response query error:', responseError)
      return NextResponse.json(
        { success: false, error: 'query_failed' },
        { status: 500 }
      )
    }

    // problem_idのセットに変換
    const completedProblemIds = new Set(
      (responses || []).map(r => r.problem_id)
    )

    return NextResponse.json({
      success: true,
      data: {
        completedProblemIds: Array.from(completedProblemIds),
      },
    })
  } catch (err) {
    console.error('Completion status route error:', err)
    return NextResponse.json(
      { success: false, error: 'server_error' },
      { status: 500 }
    )
  }
}


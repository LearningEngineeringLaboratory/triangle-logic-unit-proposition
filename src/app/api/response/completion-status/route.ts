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

    // クリア済み問題のリストを取得（attemptsテーブルから）
    // status = 'completed' のattemptを取得
    const { data: attempts, error: attemptError } = await supabase
      .from('attempts')
      .select('problem_id, status')
      .eq('session_id', sessionId)
      .eq('user_id', session.user_id)
      .eq('status', 'completed')

    if (attemptError) {
      console.error('Attempt query error:', attemptError)
      return NextResponse.json(
        { success: false, error: 'query_failed' },
        { status: 500 }
      )
    }

    // problem_idのセットに変換（重複を除去）
    const completedProblemIds = new Set(
      (attempts || []).map(a => a.problem_id)
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


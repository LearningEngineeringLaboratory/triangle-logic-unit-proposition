import { NextResponse, NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { getSessionId } from '@/lib/session'

export async function GET(req: NextRequest) {
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

    // クエリパラメータからsetIdを取得
    const { searchParams } = new URL(req.url)
    const setId = searchParams.get('setId')

    // クリア済み問題のリストを取得（attemptsテーブルから）
    // status = 'completed' のattemptを取得
    let attemptsQuery = supabase
      .from('attempts')
      .select('problem_id, status')
      .eq('session_id', sessionId)
      .eq('user_id', session.user_id)
      .eq('status', 'completed')

    const { data: attempts, error: attemptError } = await attemptsQuery

    if (attemptError) {
      console.error('Attempt query error:', attemptError)
      return NextResponse.json(
        { success: false, error: 'query_failed' },
        { status: 500 }
      )
    }

    // problem_idのセットに変換（重複を除去）
    let completedProblemIds = new Set(
      (attempts || []).map(a => a.problem_id)
    )

    // setIdが指定されている場合、その問題セットに属する問題のみをフィルタリング
    if (setId) {
      const { data: problemSetItems, error: setError } = await supabase
        .from('problem_set_items')
        .select('problem_id')
        .eq('set_id', setId)

      if (setError) {
        console.error('Problem set items query error:', setError)
        return NextResponse.json(
          { success: false, error: 'query_failed' },
          { status: 500 }
        )
      }

      const problemIdsInSet = new Set(
        (problemSetItems || []).map(item => item.problem_id)
      )

      // 完了した問題IDと問題セット内の問題IDの積集合を取得
      completedProblemIds = new Set(
        Array.from(completedProblemIds).filter(id => problemIdsInSet.has(id))
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        completedProblemIds: Array.from(completedProblemIds),
        completedCount: completedProblemIds.size,
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


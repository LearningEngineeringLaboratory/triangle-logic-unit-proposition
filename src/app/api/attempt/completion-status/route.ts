import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { getSessionId } from '@/lib/session'

export async function GET(req: NextRequest) {
  try {
    const sessionId = await getSessionId()

    if (!sessionId) {
      return NextResponse.json({
        success: true,
        data: {
          completedProblemIds: [],
          completedCount: 0,
        },
      })
    }

    const supabase = getSupabaseAdmin()

    // セッションIDからuser_idを取得
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('user_id')
      .eq('session_id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({
        success: true,
        data: {
          completedProblemIds: [],
          completedCount: 0,
        },
      })
    }

    // クエリパラメータからsetIdとsystemTypeを取得（オプション）
    const { searchParams } = new URL(req.url)
    const setId = searchParams.get('setId')
    const systemType = searchParams.get('systemType') || 'triangle_logic' // デフォルト: triangle_logic

    // systemTypeの検証
    if (systemType !== 'triangle_logic' && systemType !== 'logical_symbol') {
      return NextResponse.json(
        { success: false, error: 'invalid_system_type' },
        { status: 400 }
      )
    }

    let completedAttemptsQuery = supabase
      .from('attempts')
      .select('problem_id')
      .eq('user_id', session.user_id)
      .eq('system_type', systemType)
      .eq('status', 'completed')

    // setIdが指定されている場合、そのセットに含まれる問題のみを対象にする
    if (setId) {
      const { data: problemSetItems } = await supabase
        .from('problem_set_items')
        .select('problem_id')
        .eq('set_id', setId)

      if (problemSetItems && problemSetItems.length > 0) {
        const problemIds = problemSetItems.map(item => item.problem_id)
        completedAttemptsQuery = completedAttemptsQuery.in('problem_id', problemIds)
      } else {
        // セットに問題が存在しない場合は空の結果を返す
        return NextResponse.json({
          success: true,
          data: {
            completedProblemIds: [],
            completedCount: 0,
          },
        })
      }
    }

    const { data: completedAttempts, error: attemptsError } = await completedAttemptsQuery

    if (attemptsError) {
      console.error('Error fetching completed attempts:', attemptsError)
      return NextResponse.json(
        { success: false, error: 'query_failed' },
        { status: 500 }
      )
    }

    // 完了した問題IDの一意なリストを取得
    const completedProblemIds = Array.from(
      new Set(completedAttempts?.map(attempt => attempt.problem_id) || [])
    )

    return NextResponse.json({
      success: true,
      data: {
        completedProblemIds,
        completedCount: completedProblemIds.length,
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

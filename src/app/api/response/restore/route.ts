import { NextRequest, NextResponse } from 'next/server'
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

    const { searchParams } = new URL(req.url)
    const problemId = searchParams.get('problem_id')

    if (!problemId) {
      return NextResponse.json(
        { success: false, error: 'problem_id is required' },
        { status: 400 }
      )
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

    // Responseデータを取得
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .select('state, current_step, is_completed')
      .eq('session_id', sessionId)
      .eq('user_id', session.user_id)
      .eq('problem_id', problemId)
      .single()

    if (responseError || !response) {
      // Responseデータがない場合は、初期状態を返す
      return NextResponse.json({
        success: true,
        data: null,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        state: response.state,
        current_step: response.current_step,
        is_completed: response.is_completed,
      },
    })
  } catch (err) {
    console.error('Restore response route error:', err)
    return NextResponse.json(
      { success: false, error: 'server_error' },
      { status: 500 }
    )
  }
}


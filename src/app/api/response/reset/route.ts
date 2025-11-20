import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { getSessionId } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    const sessionId = await getSessionId()

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'session_not_found',
      }, { status: 401 })
    }

    const body = await req.json()
    const { problem_id } = body

    if (!problem_id) {
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

    // Responseデータを削除
    const { error: deleteError } = await supabase
      .from('responses')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', session.user_id)
      .eq('problem_id', problem_id)

    if (deleteError) {
      console.error('Response delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'delete_failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Response reset successfully' },
    })
  } catch (err) {
    console.error('Reset response route error:', err)
    return NextResponse.json(
      { success: false, error: 'server_error' },
      { status: 500 }
    )
  }
}


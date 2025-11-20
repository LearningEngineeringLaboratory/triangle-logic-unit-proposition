import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

interface FinishAttemptBody {
  attempt_id: string
  success: boolean
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as FinishAttemptBody

    if (!body.attempt_id) {
      return NextResponse.json(
        { success: false, error: 'attempt_id is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // attemptを完了状態に更新
    const { data: attempt, error: updateError } = await supabase
      .from('attempts')
      .update({
        finished_at: new Date().toISOString(),
        status: body.success ? 'completed' : 'abandoned',
      })
      .eq('attempt_id', body.attempt_id)
      .select('attempt_id, status, finished_at')
      .single()

    if (updateError) {
      console.error('Attempt finish error:', updateError)
      return NextResponse.json(
        { success: false, error: 'attempt_update_failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: attempt,
    })
  } catch (err) {
    console.error('Finish attempt route error:', err)
    return NextResponse.json(
      { success: false, error: 'server_error' },
      { status: 500 }
    )
  }
}


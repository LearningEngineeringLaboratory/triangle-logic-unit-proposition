import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

interface UpdateStepBody {
  attempt_id: string
  current_step: number
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as UpdateStepBody

    if (!body.attempt_id || body.current_step === undefined) {
      return NextResponse.json(
        { success: false, error: 'attempt_id and current_step are required' },
        { status: 400 }
      )
    }

    if (body.current_step < 1) {
      return NextResponse.json(
        { success: false, error: 'current_step must be >= 1' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // attemptのcurrent_stepを更新
    const { data: attempt, error: updateError } = await supabase
      .from('attempts')
      .update({
        current_step: body.current_step,
      })
      .eq('attempt_id', body.attempt_id)
      .select('attempt_id, current_step')
      .single()

    if (updateError) {
      console.error('Attempt update step error:', updateError)
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
    console.error('Update step route error:', err)
    return NextResponse.json(
      { success: false, error: 'server_error' },
      { status: 500 }
    )
  }
}


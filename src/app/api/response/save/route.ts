import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { getSessionId } from '@/lib/session'
import { generateUlid } from '@/lib/session'

interface SaveResponseBody {
  session_id: string
  user_id: string
  problem_id: string
  problem_number: number
  state: Record<string, unknown>
  current_step: number
  is_completed: boolean
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SaveResponseBody

    if (!body.session_id || !body.user_id || !body.problem_id) {
      return NextResponse.json(
        { success: false, error: 'session_id, user_id, and problem_id are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // 既存のレコードを確認
    const { data: existingResponse } = await supabase
      .from('responses')
      .select('response_id')
      .eq('session_id', body.session_id)
      .eq('user_id', body.user_id)
      .eq('problem_id', body.problem_id)
      .single()

    if (existingResponse) {
      // 既存のレコードを更新
      const { error: updateError } = await supabase
        .from('responses')
        .update({
          state: body.state,
          current_step: body.current_step,
          is_completed: body.is_completed,
          updated_at: new Date().toISOString(),
        })
        .eq('response_id', existingResponse.response_id)

      if (updateError) {
        console.error('Response update error:', updateError)
        return NextResponse.json(
          { success: false, error: 'update_failed' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: { response_id: existingResponse.response_id },
      })
    } else {
      // 新規レコードを作成
      const responseId = generateUlid()
      const { error: insertError } = await supabase
        .from('responses')
        .insert({
          response_id: responseId,
          session_id: body.session_id,
          user_id: body.user_id,
          problem_id: body.problem_id,
          problem_number: body.problem_number || 1,
          state: body.state,
          current_step: body.current_step || 1,
          is_completed: body.is_completed || false,
        })

      if (insertError) {
        console.error('Response insert error:', insertError)
        return NextResponse.json(
          { success: false, error: 'insert_failed' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: { response_id: responseId },
      })
    }
  } catch (err) {
    console.error('Save response route error:', err)
    return NextResponse.json(
      { success: false, error: 'server_error' },
      { status: 500 }
    )
  }
}


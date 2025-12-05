import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { generateUlid } from '@/lib/session'
import { mapUiToDbState } from '@/lib/utils'
import { StepsState, NodeValues } from '@/lib/types'

interface SaveResponseBody {
  session_id: string
  user_id: string
  problem_id: string
  problem_number: number
  state: StepsState
  current_step: number
  is_completed: boolean
  node_values?: NodeValues
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

    // 既存のresponseを検索
    const { data: existingResponse, error: searchError } = await supabase
      .from('responses')
      .select('response_id')
      .eq('session_id', body.session_id)
      .eq('user_id', body.user_id)
      .eq('problem_id', body.problem_id)
      .single()

    // ステートをDB形式に変換（ノードの文字列表現も含めて保存）
    const dbState = mapUiToDbState(body.state, body.node_values)

    if (!searchError && existingResponse) {
      // 既存のresponseを更新
      const { error: updateError } = await supabase
        .from('responses')
        .update({
          state: dbState,
          current_step: body.current_step,
          is_completed: body.is_completed,
          updated_at: new Date().toISOString(),
        })
        .eq('response_id', existingResponse.response_id)

      if (updateError) {
        console.error('Response update error:', updateError)
        return NextResponse.json(
          { success: false, error: 'response_update_failed' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: { response_id: existingResponse.response_id },
      })
    } else {
      // 新しいresponseを作成
      const responseId = generateUlid()
      const { data: response, error: insertError } = await supabase
        .from('responses')
        .insert({
          response_id: responseId,
          session_id: body.session_id,
          user_id: body.user_id,
          problem_id: body.problem_id,
          problem_number: body.problem_number,
          state: dbState,
          current_step: body.current_step,
          is_completed: body.is_completed,
        })
        .select('response_id')
        .single()

      if (insertError) {
        console.error('Response creation error:', insertError)
        return NextResponse.json(
          { success: false, error: 'response_creation_failed' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: response,
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


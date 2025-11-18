import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

interface LogBody {
  session_id?: string
  user_id?: string
  problem_id?: string
  step?: 1 | 2 | 3 | 4 | 5
  is_correct?: boolean
  kind?: string
  payload?: unknown
  client_ts?: string
}

interface EventInsert {
  session_id: string | null
  user_id: string | null
  problem_id: string | null
  kind: string
  payload: {
    step?: 1 | 2 | 3 | 4 | 5
    is_correct?: boolean
    detail: unknown
  }
  client_ts: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LogBody
    const supabase = getSupabaseAdmin()
    // 研究用の簡易ログ保存: eventsへappend（スキーマに合わせて調整）
    const eventPayload: EventInsert = {
      session_id: body.session_id ?? null,
      user_id: body.user_id ?? null,
      problem_id: body.problem_id ?? null,
      kind: body.kind ?? 'check_step_client',
      payload: {
        step: body.step,
        is_correct: body.is_correct,
        detail: body.payload ?? null,
      },
      client_ts: body.client_ts ?? new Date().toISOString(),
    }

    const { error } = await supabase.from('events').insert(eventPayload)
    if (error) {
      return NextResponse.json({ success: false, error: 'log_insert_failed' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('log route error', err)
    return NextResponse.json({ success: false, error: 'server_error' }, { status: 500 })
  }
}



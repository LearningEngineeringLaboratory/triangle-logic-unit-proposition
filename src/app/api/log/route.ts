import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { generateUlid } from '@/lib/session'

interface LogBody {
  session_id?: string
  user_id?: string
  attempt_id?: string
  problem_id?: string
  step?: 1 | 2 | 3 | 4 | 5
  is_correct?: boolean
  kind?: string
  payload?: unknown
  state?: unknown // イベント送信時の問題の全ての回答状況（全ステップの回答状態をJSONB形式で保存）
  client_ts?: string
  idempotency_key?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LogBody

    // 必須パラメータのチェック
    if (!body.session_id || !body.user_id) {
      return NextResponse.json(
        { success: false, error: 'session_id and user_id are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // シーケンス番号を取得（セッション内で最大のseq + 1）
    const { data: maxSeqData } = await supabase
      .from('events')
      .select('seq')
      .eq('session_id', body.session_id)
      .order('seq', { ascending: false })
      .limit(1)
      .single()

    const nextSeq = maxSeqData?.seq ? maxSeqData.seq + 1 : 1

    // attempt_idが指定されていない場合は、進行中のattempt_idを取得（問題関連イベントの場合のみ）
    // 注意: 完了済みのattempt_idは使用しない（過去のattemptと混同を防ぐため）
    let attemptId = body.attempt_id
    if (!attemptId && body.problem_id) {
      const { data: latestAttempt, error: attemptError } = await supabase
        .from('attempts')
        .select('attempt_id')
        .eq('session_id', body.session_id)
        .eq('user_id', body.user_id)
        .eq('problem_id', body.problem_id)
        .eq('status', 'in_progress')
        .order('started_at', { ascending: false })
        .limit(1)
        .single()

      if (!attemptError && latestAttempt) {
        attemptId = latestAttempt.attempt_id
      } else {
        // 進行中のattemptがない場合、attempt_idはnullとして記録
        // これは問題が完了した後の操作や、attemptが存在しない場合に発生する可能性がある
        console.warn('[warn] No in_progress attempt found for problem-related event:', { 
          kind: body.kind, 
          problem_id: body.problem_id,
          session_id: body.session_id,
          user_id: body.user_id,
          note: 'Event will be recorded with attempt_id=null'
        })
      }
    }

    // 問題非関連イベントではattempt_idはNULL許可（attempt_idが無くてもOK）

    // 冪等性キーの生成（指定されていない場合）
    const idempotencyKey = body.idempotency_key || `${body.session_id}-${nextSeq}-${Date.now()}`

    // イベントを挿入
    const eventId = generateUlid()
    const eventData = {
      event_id: eventId,
      session_id: body.session_id,
      user_id: body.user_id,
      attempt_id: attemptId || null, // 問題非関連イベントではNULL許可
      seq: nextSeq,
      kind: body.kind || 'unknown',
      payload: body.payload || null,
      state: body.state || null, // イベント送信時の問題の全ての回答状況
      client_ts: body.client_ts ? new Date(body.client_ts).toISOString() : null,
      server_ts: new Date().toISOString(),
      idempotency_key: idempotencyKey,
    }
    
    console.log('[debug] Inserting event:', { kind: eventData.kind, session_id: eventData.session_id, user_id: eventData.user_id, attempt_id: eventData.attempt_id })
    
    const { error: insertError } = await supabase.from('events').insert(eventData)

    if (insertError) {
      // 重複エラーの場合は成功として扱う（冪等性）
      if (insertError.code === '23505') {
        // UNIQUE制約違反（idempotency_key）
        console.log('[info] Duplicate event ignored:', idempotencyKey)
        return NextResponse.json({ success: true, message: 'duplicate_ignored' })
      }
      console.error('[error] Event insert error:', insertError, 'Event data:', eventData)
      return NextResponse.json(
        { success: false, error: 'log_insert_failed', details: insertError.message },
        { status: 500 }
      )
    }
    
    console.log('[success] Event inserted:', eventId)

    // セッションの最終活動日時を更新
    await supabase
      .from('sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('session_id', body.session_id)

    return NextResponse.json({ success: true, data: { event_id: eventId, seq: nextSeq } })
  } catch (err) {
    console.error('log route error:', err)
    return NextResponse.json(
      { success: false, error: 'server_error' },
      { status: 500 }
    )
  }
}



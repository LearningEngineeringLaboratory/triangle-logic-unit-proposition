'use client'

import { getUserIdClient } from './session-client'

/**
 * ログ送信用のコンテキスト情報を取得
 */
function getLogContext() {
  return {
    sessionId: null, // HttpOnly Cookieは読み取れない
    userId: getUserIdClient(),
  }
}

/**
 * 汎用ログ送信関数（events_logical_symbolテーブル用）
 */
async function logEventLogicalSymbol(params: {
  sessionId?: string
  userId?: string
  attemptId?: string
  problemId?: string
  kind: string
  payload?: unknown
  state?: unknown
  idempotencyKey?: string
}): Promise<void> {
  if (!params.sessionId || !params.userId) {
    console.warn('[logEventLogicalSymbol] Skipping log - missing sessionId or userId:', { 
      kind: params.kind,
      sessionId: params.sessionId, 
      userId: params.userId 
    })
    return
  }

  try {
    await fetch('/api/log-logical-symbol', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: params.sessionId,
        user_id: params.userId,
        attempt_id: params.attemptId,
        problem_id: params.problemId,
        kind: params.kind,
        payload: params.payload ?? null,
        state: params.state ?? null,
        client_ts: new Date().toISOString(),
        idempotency_key: params.idempotencyKey,
      }),
    })
  } catch {
    // 研究用途のため、失敗時は黙殺
  }
}

/**
 * ドロップダウン選択イベントを記録（比較実験用）
 */
export async function logSelectDropdownLogicalSymbol(params: {
  controlId: string
  value: string
  attemptId?: string
  problemId?: string
  sessionId?: string
  userId?: string
  state?: unknown
}) {
  const context = getLogContext()
  await logEventLogicalSymbol({
    sessionId: params.sessionId ?? context.sessionId ?? undefined,
    userId: params.userId ?? context.userId ?? undefined,
    attemptId: params.attemptId,
    problemId: params.problemId,
    kind: 'select_dropdown',
    payload: {
      control_id: params.controlId,
      value: params.value,
    },
    state: params.state,
  })
}

/**
 * 答え合わせイベントを記録（比較実験用）
 */
export async function logCheckAnswerLogicalSymbol(params: {
  step: 1 | 2
  isCorrect: boolean
  attemptId?: string
  problemId?: string
  sessionId?: string
  userId?: string
  payload?: unknown
  state?: unknown
}) {
  const context = getLogContext()
  await logEventLogicalSymbol({
    sessionId: params.sessionId ?? context.sessionId ?? undefined,
    userId: params.userId ?? context.userId ?? undefined,
    attemptId: params.attemptId,
    problemId: params.problemId,
    kind: 'check_answer',
    payload: {
      step: params.step,
      is_correct: params.isCorrect,
      result: params.payload,
    },
    state: params.state,
  })
}

/**
 * ステップ遷移イベントを記録（比較実験用）
 */
export async function logStepNavigationLogicalSymbol(params: {
  fromStep: number
  toStep: number
  attemptId?: string
  problemId?: string
  sessionId?: string
  userId?: string
}) {
  const context = getLogContext()
  await logEventLogicalSymbol({
    sessionId: params.sessionId ?? context.sessionId ?? undefined,
    userId: params.userId ?? context.userId ?? undefined,
    attemptId: params.attemptId,
    problemId: params.problemId,
    kind: 'step_navigation',
    payload: {
      from_step: params.fromStep,
      to_step: params.toStep,
    },
  })
}


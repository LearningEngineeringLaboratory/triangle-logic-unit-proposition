'use client'

import { logEvent } from './utils'
import { getUserIdClient } from './session-client'

/**
 * ログ送信用のコンテキスト情報を取得
 * 注意: HttpOnly CookieはJavaScriptから読み取れないため、sessionIdはnullになる可能性がある
 * 呼び出し側で明示的にsessionIdとuserIdを渡すことを推奨
 */
function getLogContext() {
  // HttpOnly CookieはJavaScriptから読み取れないため、userIdのみ取得
  // sessionIdは呼び出し側で明示的に渡す必要がある
  return {
    sessionId: null, // HttpOnly Cookieは読み取れない
    userId: getUserIdClient(),
  }
}

/**
 * ユーザー登録イベントを記録
 */
export async function logUserRegistered(params: { name: string; email: string; userId: string }) {
  const context = getLogContext()
  await logEvent({
    sessionId: context.sessionId ?? undefined,
    userId: params.userId,
    kind: 'user_registered',
    payload: {
      name: params.name,
      email: params.email,
    },
  })
}

/**
 * セッション作成イベントを記録
 */
export async function logSessionCreated(params: { sessionId: string; userId: string }) {
  await logEvent({
    sessionId: params.sessionId,
    userId: params.userId,
    kind: 'session_created',
    payload: {
      session_id: params.sessionId,
      user_id: params.userId,
    },
  })
}

/**
 * セッション復帰イベントを記録
 */
export async function logSessionRestored(params: { sessionId: string; userId: string }) {
  await logEvent({
    sessionId: params.sessionId,
    userId: params.userId,
    kind: 'session_restored',
    payload: {
      session_id: params.sessionId,
      user_id: params.userId,
    },
  })
}

/**
 * 試行開始イベントを記録
 */
export async function logAttemptStarted(params: {
  attemptId: string
  problemId: string
  sessionId?: string
  userId?: string
}) {
  const context = getLogContext()
  await logEvent({
    sessionId: params.sessionId ?? context.sessionId ?? undefined,
    userId: params.userId ?? context.userId ?? undefined,
    attemptId: params.attemptId,
    problemId: params.problemId,
    kind: 'attempt_started',
    payload: {
      problem_id: params.problemId,
    },
  })
}

/**
 * 試行終了イベントを記録
 */
export async function logAttemptFinished(params: {
  attemptId: string
  problemId: string
  success: boolean
  sessionId?: string
  userId?: string
}) {
  const context = getLogContext()
  await logEvent({
    sessionId: params.sessionId ?? context.sessionId ?? undefined,
    userId: params.userId ?? context.userId ?? undefined,
    attemptId: params.attemptId,
    problemId: params.problemId,
    kind: 'attempt_finished',
    payload: {
      problem_id: params.problemId,
      success: params.success,
    },
  })
}

/**
 * ドロップダウン選択イベントを記録
 */
export async function logSelectDropdown(params: {
  controlId: string
  value: string
  attemptId?: string
  problemId?: string
  sessionId?: string
  userId?: string
  state?: unknown // イベント送信時の問題の全ての回答状況（全ステップの回答状態をJSONB形式で保存）
}) {
  console.log('[logSelectDropdown] Called with:', { controlId: params.controlId, value: params.value, attemptId: params.attemptId, problemId: params.problemId, sessionId: params.sessionId, userId: params.userId })
  const context = getLogContext()
  try {
    await logEvent({
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
    console.log('[logSelectDropdown] Successfully logged:', params.controlId)
  } catch (err) {
    console.error('[logSelectDropdown] Error:', err)
    throw err
  }
}

/**
 * リンク作成イベントを記録
 */
export async function logLinkCreated(params: {
  fromNode: string
  toNode: string
  fromLabel?: string
  toLabel?: string
  attemptId?: string
  problemId?: string
  sessionId?: string
  userId?: string
  state?: unknown // イベント送信時の問題の全ての回答状況（全ステップの回答状態をJSONB形式で保存）
}) {
  const context = getLogContext()
  await logEvent({
    sessionId: params.sessionId ?? context.sessionId ?? undefined,
    userId: params.userId ?? context.userId ?? undefined,
    attemptId: params.attemptId,
    problemId: params.problemId,
    kind: 'link_created',
    payload: {
      from_node_id: params.fromNode,
      from_node_label: params.fromLabel ?? params.fromNode,
      to_node_id: params.toNode,
      to_node_label: params.toLabel ?? params.toNode,
    },
    state: params.state,
  })
}

/**
 * リンク削除イベントを記録
 */
export async function logLinkDeleted(params: {
  fromNode: string
  toNode: string
  fromLabel?: string
  toLabel?: string
  attemptId?: string
  problemId?: string
  sessionId?: string
  userId?: string
  state?: unknown // イベント送信時の問題の全ての回答状況（全ステップの回答状態をJSONB形式で保存）
}) {
  const context = getLogContext()
  await logEvent({
    sessionId: params.sessionId ?? context.sessionId ?? undefined,
    userId: params.userId ?? context.userId ?? undefined,
    attemptId: params.attemptId,
    problemId: params.problemId,
    kind: 'link_deleted',
    payload: {
      from_node_id: params.fromNode,
      from_node_label: params.fromLabel ?? params.fromNode,
      to_node_id: params.toNode,
      to_node_label: params.toLabel ?? params.toNode,
    },
    state: params.state,
  })
}

/**
 * リンクを不要としてマーク
 */
export async function logLinkMarkedInactive(params: {
  linkId: string
  fromNode?: string
  toNode?: string
  fromLabel?: string
  toLabel?: string
  attemptId?: string
  problemId?: string
  sessionId?: string
  userId?: string
  state?: unknown // イベント送信時の問題の全ての回答状況（全ステップの回答状態をJSONB形式で保存）
}) {
  const context = getLogContext()
  await logEvent({
    sessionId: params.sessionId ?? context.sessionId ?? undefined,
    userId: params.userId ?? context.userId ?? undefined,
    attemptId: params.attemptId,
    problemId: params.problemId,
    kind: 'link_marked_inactive',
    payload: {
      link_id: params.linkId,
      from_node_id: params.fromNode,
      from_node_label: params.fromLabel ?? params.fromNode,
      to_node_id: params.toNode,
      to_node_label: params.toLabel ?? params.toNode,
      active: false,
    },
    state: params.state,
  })
}

/**
 * リンクを必要としてマーク
 */
export async function logLinkMarkedActive(params: {
  linkId: string
  fromNode?: string
  toNode?: string
  fromLabel?: string
  toLabel?: string
  attemptId?: string
  problemId?: string
  sessionId?: string
  userId?: string
  state?: unknown // イベント送信時の問題の全ての回答状況（全ステップの回答状態をJSONB形式で保存）
}) {
  const context = getLogContext()
  await logEvent({
    sessionId: params.sessionId ?? context.sessionId ?? undefined,
    userId: params.userId ?? context.userId ?? undefined,
    attemptId: params.attemptId,
    problemId: params.problemId,
    kind: 'link_marked_active',
    payload: {
      link_id: params.linkId,
      from_node_id: params.fromNode,
      from_node_label: params.fromLabel ?? params.fromNode,
      to_node_id: params.toNode,
      to_node_label: params.toLabel ?? params.toNode,
      active: true,
    },
    state: params.state,
  })
}

/**
 * ステップ完了イベントを記録
 */
export async function logStepCompleted(params: {
  step: 1 | 2 | 3 | 4 | 5
  isCorrect: boolean
  attemptId?: string
  problemId?: string
  payload?: unknown
}) {
  const context = getLogContext()
  await logEvent({
    sessionId: context.sessionId ?? undefined,
    userId: context.userId ?? undefined,
    attemptId: params.attemptId,
    problemId: params.problemId,
    kind: 'step_completed',
    payload: {
      step: params.step,
      is_correct: params.isCorrect,
      result: params.payload,
    },
  })
}

/**
 * ノード作成イベントを記録
 */
export async function logCreateNode(params: {
  nodeId: string
  nodeLabel: string
  attemptId?: string
  problemId?: string
  sessionId?: string
  userId?: string
  state?: unknown // イベント送信時の問題の全ての回答状況（全ステップの回答状態をJSONB形式で保存）
}) {
  const context = getLogContext()
  await logEvent({
    sessionId: params.sessionId ?? context.sessionId ?? undefined,
    userId: params.userId ?? context.userId ?? undefined,
    attemptId: params.attemptId,
    problemId: params.problemId,
    kind: 'create_node',
    payload: {
      node_id: params.nodeId,
      node_label: params.nodeLabel,
    },
    state: params.state,
  })
}

/**
 * ステップ遷移イベントを記録
 */
export async function logStepNavigation(params: {
  fromStep: number
  toStep: number
  attemptId?: string
  problemId?: string
}) {
  const context = getLogContext()
  await logEvent({
    sessionId: context.sessionId ?? undefined,
    userId: context.userId ?? undefined,
    attemptId: params.attemptId,
    problemId: params.problemId,
    kind: 'step_navigation',
    payload: {
      from_step: params.fromStep,
      to_step: params.toStep,
    },
  })
}

/**
 * 継続確認ダイアログ表示イベントを記録
 */
export async function logContinueDialogShown(params: {
  problemNumber: number
  currentStep: number
  userId: string
}) {
  const context = getLogContext()
  await logEvent({
    sessionId: context.sessionId ?? undefined,
    userId: params.userId,
    kind: 'continue_dialog_shown',
    payload: {
      problem_number: params.problemNumber,
      current_step: params.currentStep,
    },
  })
}

/**
 * 継続方法選択イベントを記録
 */
export async function logContinueSelected(params: {
  choice: 'continue' | 'restart' | 'previousProblem'
  problemNumber: number
  currentStep: number
  userId: string
}) {
  const context = getLogContext()
  await logEvent({
    sessionId: context.sessionId ?? undefined,
    userId: params.userId,
    kind: 'continue_selected',
    payload: {
      choice: params.choice,
      problem_number: params.problemNumber,
      current_step: params.currentStep,
    },
  })
}


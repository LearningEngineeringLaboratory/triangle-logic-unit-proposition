import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// UI <-> DB マッピングユーティリティ（可変ステップ数対応）

import { StepsState, Step1State, Step2State, Step2Answer, Step3State, Step4State, Step5State, TriangleLink, CorrectAnswers } from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function mapUiToDbState(ui: StepsState) {
  const db: Record<string, unknown> = {}
  
  Object.entries(ui).forEach(([stepKey, step]) => {
    if (!step) return
    const stepNumber = stepKey.replace('step', '')
    
    const base: Record<string, unknown> = {
      is_passed: step.isPassed,
    }
    
    if (stepNumber === '1') {
      const state = step as Step1State
      base.antecedent = state.antecedent
      base.consequent = state.consequent
    } else if (stepNumber === '2') {
      const state = step as Step2State
      if (state.links?.length) {
        base.links = state.links
      }
    } else if (stepNumber === '3') {
      const state = step as Step3State
      base.inference_type = state.inferenceType
      base.validity = state.validity
      base.verification = state.verification
    } else if (stepNumber === '4') {
      const state = step as Step4State
      if (state.links?.length) {
        base.links = state.links
      }
    } else if (stepNumber === '5') {
      const state = step as Step5State
      if (state.premises?.length) {
        base.premises = state.premises
      }
    }
    
    db[stepKey] = base
  })

  return db
}

export function mapDbToUiState(db: Record<string, unknown>): StepsState {
  const ui: StepsState = {}
  
  Object.entries(db).forEach(([stepKey, rawValue]) => {
    if (!isRecord(rawValue)) return
    const stepNumber = stepKey.replace('step', '')
    
    const base = {
      isPassed: Boolean(rawValue.is_passed),
    }
    
    switch (stepNumber) {
      case '1':
        ui.step1 = {
          ...base,
          antecedent: String(rawValue.antecedent ?? ''),
          consequent: String(rawValue.consequent ?? ''),
        }
        break
      case '2':
        ui.step2 = {
          ...base,
          links: Array.isArray(rawValue.links) ? (rawValue.links as TriangleLink[]) : [],
        }
        break
      case '3':
        ui.step3 = {
          ...base,
          inferenceType: String(rawValue.inference_type ?? ''),
          validity: typeof rawValue.validity === 'boolean' ? rawValue.validity : null,
          verification: typeof rawValue.verification === 'boolean' ? rawValue.verification : null,
        }
        break
      case '4':
        ui.step4 = {
          ...base,
          links: Array.isArray(rawValue.links) ? (rawValue.links as Step4State['links']) : [],
        }
        break
      case '5':
        ui.step5 = {
          ...base,
          premises: Array.isArray(rawValue.premises) ? (rawValue.premises as Step5State['premises']) : [],
        }
        break
      default:
        break
    }
  })

  return ui
}

// ---- クライアント側答え合わせユーティリティ ----

export function normalizeValidity(v: unknown): boolean | null {
  if (typeof v === 'boolean') return v
  if (v === '妥当') return true
  if (v === '非妥当') return false
  return null
}

export function normalizeStateFragment(stepNumber: 1 | 2 | 3, incoming: unknown) {
  if (!isRecord(incoming)) return {}
  if (stepNumber === 1) {
    return incoming
  }
  if (stepNumber === 2) {
    if ('link_directions' in incoming || !('linkDirections' in incoming)) {
      return incoming
    }
    if ('linkDirections' in incoming || 'impossible' in incoming) {
      const links = isRecord(incoming.linkDirections) ? incoming.linkDirections : undefined
      return {
        impossible: Boolean(incoming.impossible),
        link_directions: links
          ? {
              'antecedent-link': Boolean((links as Record<string, unknown>).antecedentLink),
              'consequent-link': Boolean((links as Record<string, unknown>).consequentLink),
            }
          : undefined,
      }
    }
    return incoming
  }
  if (stepNumber === 3) {
    if ('inference_type' in incoming || (typeof incoming?.validity === 'boolean' && !('inferenceType' in incoming))) {
      return incoming
    }
    if ('inferenceType' in incoming || 'validity' in incoming) {
      return {
        inference_type: incoming.inferenceType,
        validity: normalizeValidity(incoming.validity),
      }
    }
    return incoming
  }
  return {}
}

export function isStepCorrect(correctAnswers: CorrectAnswers | undefined, stepNumber: 1 | 2 | 3, state: Step1State | Step2State | Step3State | undefined): boolean {
  // 新仕様: correct_answers.stepN に正解データをフラットに格納
  const correct = correctAnswers?.[`step${stepNumber}` as const]
  const incoming = normalizeStateFragment(stepNumber, state)

  if (stepNumber === 1) {
    const fragment = incoming as Partial<Step1State>
    const expected = correct as { antecedent?: string; consequent?: string } | undefined
    return Boolean(
      fragment?.antecedent === expected?.antecedent &&
      fragment?.consequent === expected?.consequent
    )
  }

  if (stepNumber === 2) {
    const fragment = incoming as {
      antecedent?: string
      consequent?: string
      links?: TriangleLink[]
    }
    const expected = correct as Step2Answer | TriangleLink[] | undefined
    // 新スキーマ: step2 はリンク配列のみ
    const correctLinks: TriangleLink[] = Array.isArray(expected)
      ? expected as TriangleLink[]
      : Array.isArray(expected?.links)
        ? expected.links ?? []
        : []
    const uiLinks = Array.isArray(fragment?.links) ? fragment?.links ?? [] : []

    const getNodeValue = (nodeId: string) => {
      if (nodeId === 'antecedent') return String(fragment?.antecedent ?? '')
      if (nodeId === 'consequent') return String(fragment?.consequent ?? '')
      // premiseノードの値は、リンクから取得する必要がある（premiseフィールドは削除されたため）
      if (typeof nodeId === 'string' && nodeId.startsWith('premise-')) {
        // リンクからpremiseノードの値を取得
        const premiseLink = uiLinks.find(link => link.from === nodeId || link.to === nodeId)
        if (premiseLink) {
          // リンクのfromまたはtoがpremiseノードの場合、そのノードIDを返す
          return nodeId
        }
        return ''
      }
      return nodeId
    }

    const uiLinksWithValues = uiLinks.map(link => ({
      from: getNodeValue(link.from),
      to: getNodeValue(link.to)
    }))

    const linksMatch = correctLinks.every(correctLink =>
      uiLinksWithValues.some(uiLink =>
        uiLink.from === correctLink.from && uiLink.to === correctLink.to
      )
    ) && correctLinks.length === uiLinksWithValues.length

    return Boolean(linksMatch)
  }

  if (stepNumber === 3) {
    const fragment = incoming as Partial<Step3State> & { inference_type?: string }
    const expected = correct as { inference_type?: string; validity?: boolean; verification?: boolean } | undefined
    const left = {
      inference_type: fragment?.inferenceType ?? fragment?.inference_type,
      validity: normalizeValidity(fragment?.validity),
      verification: typeof fragment?.verification === 'boolean' ? fragment.verification : undefined,
    }
    const right = {
      inference_type: expected?.inference_type,
      validity: normalizeValidity(expected?.validity),
      verification: expected?.verification,
    }
    const verificationMatches = right.verification === undefined || left.verification === right.verification
    return Boolean(left.inference_type === right.inference_type && left.validity === right.validity && verificationMatches)
  }

  return false
}

export async function logClientCheck(params: {
  sessionId?: string
  userId?: string
  problemId?: string
  step: 1 | 2 | 3 | 4 | 5
  isCorrect: boolean
  payload?: unknown
}) {
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: params.sessionId,
        user_id: params.userId,
        problem_id: params.problemId,
        step: params.step,
        is_correct: params.isCorrect,
        kind: 'check_answer',
        payload: params.payload ?? null,
        client_ts: new Date().toISOString(),
      }),
    })
  } catch {
    // 研究用途のため、失敗時は黙殺
  }
}

/**
 * 汎用ログ送信関数
 */
export async function logEvent(params: {
  sessionId?: string
  userId?: string
  attemptId?: string
  problemId?: string
  kind: string
  payload?: unknown
  idempotencyKey?: string
}): Promise<void> {
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: params.sessionId,
        user_id: params.userId,
        attempt_id: params.attemptId,
        problem_id: params.problemId,
        kind: params.kind,
        payload: params.payload ?? null,
        client_ts: new Date().toISOString(),
        idempotency_key: params.idempotencyKey,
      }),
    })
  } catch {
    // 研究用途のため、失敗時は黙殺
  }
}

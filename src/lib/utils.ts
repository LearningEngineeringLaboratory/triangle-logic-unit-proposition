import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// UI <-> DB マッピングユーティリティ（可変ステップ数対応）

import { StepsState, StepState } from './types'

interface UiStepsState {
  [stepKey: string]: StepState
}

export function mapUiToDbState(ui: UiStepsState) {
  const db: any = {}
  
  // 各ステップを動的に処理
  Object.keys(ui).forEach(stepKey => {
    const step = ui[stepKey]
    const stepNumber = stepKey.replace('step', '')
    
    db[stepKey] = {
      is_passed: step.isPassed,
    }
    
    // ステップ固有のフィールドをマッピング
    if (stepNumber === '1') {
      db[stepKey].antecedent = step.antecedent
      db[stepKey].consequent = step.consequent
    } else if (stepNumber === '2') {
      if (step.impossible) {
        db[stepKey].impossible = true
      } else {
        db[stepKey].impossible = false
        if (step.premise) db[stepKey].premise = step.premise
        if (step.linkDirections) {
          db[stepKey].link_directions = {
            "antecedent-link": step.linkDirections.antecedentLink,
            "consequent-link": step.linkDirections.consequentLink,
          }
        }
      }
    } else if (stepNumber === '3') {
      db[stepKey].inference_type = step.inferenceType
      db[stepKey].validity = step.validity
    }
    // 将来的に4ステップ以上に対応する場合はここに追加
  })

  return db
}

export function mapDbToUiState(db: any): UiStepsState {
  const ui: UiStepsState = {}
  
  // 各ステップを動的に処理
  Object.keys(db).forEach(stepKey => {
    const stepData = db[stepKey]
    const stepNumber = stepKey.replace('step', '')
    
    ui[stepKey] = {
      isPassed: !!stepData?.is_passed,
    }
    
    // ステップ固有のフィールドをマッピング
    if (stepNumber === '1') {
      ui[stepKey] = {
        ...ui[stepKey],
        antecedent: stepData?.antecedent ?? '',
        consequent: stepData?.consequent ?? '',
      }
    } else if (stepNumber === '2') {
      ui[stepKey] = {
        ...ui[stepKey],
        impossible: !!stepData?.impossible,
        premise: stepData?.premise ?? '',
        linkDirections: stepData?.link_directions
          ? {
              antecedentLink: !!stepData.link_directions["antecedent-link"],
              consequentLink: !!stepData.link_directions["consequent-link"],
            }
          : { antecedentLink: true, consequentLink: true },
      }
    } else if (stepNumber === '3') {
      ui[stepKey] = {
        ...ui[stepKey],
        inferenceType: stepData?.inference_type ?? '',
        validity: stepData?.validity ?? null,
      }
    }
    // 将来的に4ステップ以上に対応する場合はここに追加
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

export function normalizeStateFragment(stepNumber: 1 | 2 | 3, incoming: any) {
  if (!incoming) return {}
  if (stepNumber === 1) {
    if ('antecedent' in incoming && 'consequent' in incoming) return incoming
    return incoming
  }
  if (stepNumber === 2) {
    if ('link_directions' in incoming || ('premise' in incoming && !('linkDirections' in incoming))) {
      return incoming
    }
    if ('linkDirections' in incoming || 'impossible' in incoming) {
      const links = incoming.linkDirections
      return {
        impossible: !!incoming.impossible,
        premise: incoming.premise,
        link_directions: links
          ? {
              'antecedent-link': !!links.antecedentLink,
              'consequent-link': !!links.consequentLink,
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
}

export function isStepCorrect(correctAnswers: any, stepNumber: 1 | 2 | 3, state: any): boolean {
  // 新仕様: correct_answers.stepN に正解データをフラットに格納
  const correct = correctAnswers?.[`step${stepNumber}`]
  const incoming = normalizeStateFragment(stepNumber, state)

  if (stepNumber === 1) {
    return Boolean(
      incoming?.antecedent === correct?.antecedent &&
      incoming?.consequent === correct?.consequent
    )
  }

  if (stepNumber === 2) {
    // Step2の正誤判定（新しいReactFlowベースの構造）
    const correctLinks = correct?.links || []
    const correctPremise = correct?.premise
    
    // premiseの比較（データベースの"Qである"は実際の選択肢に置き換える）
    let premiseMatch = false
    if (correctPremise === "Qである") {
      // "Qである"は実際の選択肢に置き換える（問題に応じて調整）
      premiseMatch = incoming?.premise === "哺乳類である"
    } else {
      premiseMatch = incoming?.premise === correctPremise
    }
    
    // linksの比較（fromとtoの順序を考慮）
    const normalizeLinks = (links: any[]) => {
      return links.map(link => ({
        from: link.from,
        to: link.to
      })).sort((a, b) => {
        if (a.from !== b.from) return a.from.localeCompare(b.from)
        return a.to.localeCompare(b.to)
      })
    }
    
    const incLinks = normalizeLinks(incoming?.links || [])
    const corLinks = normalizeLinks(correctLinks)
    
    return Boolean(
      premiseMatch && 
      JSON.stringify(incLinks) === JSON.stringify(corLinks)
    )
  }

  if (stepNumber === 3) {
    const left = {
      inference_type: incoming?.inference_type,
      validity: normalizeValidity(incoming?.validity),
    }
    const right = {
      inference_type: correct?.inference_type,
      validity: normalizeValidity(correct?.validity),
    }
    return Boolean(left.inference_type === right.inference_type && left.validity === right.validity)
  }

  return false
}

export async function logClientCheck(params: {
  sessionId?: string
  userId?: string
  problemId?: string
  step: 1 | 2 | 3
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
        kind: 'check_step_client',
        payload: params.payload ?? null,
        client_ts: new Date().toISOString(),
      }),
    })
  } catch (_) {
    // 研究用途のため、失敗時は黙殺
  }
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// UI <-> DB マッピングユーティリティ

interface UiStepsState {
  step1: { antecedent: string; consequent: string; isPassed: boolean }
  step2: {
    impossible: boolean
    premise?: string
    linkDirections?: { antecedentLink: boolean; consequentLink: boolean }
    isPassed: boolean
  }
  step3: { inferenceType: string; validity: boolean | null; isPassed: boolean }
}

export function mapUiToDbState(ui: UiStepsState) {
  const db: any = {
    step1: {
      antecedent: ui.step1.antecedent,
      consequent: ui.step1.consequent,
      is_passed: ui.step1.isPassed,
    },
    step2: {
      is_passed: ui.step2.isPassed,
    },
    step3: {
      inference_type: ui.step3.inferenceType,
      validity: ui.step3.validity,
      is_passed: ui.step3.isPassed,
    },
  }

  if (ui.step2.impossible) {
    db.step2.impossible = true
  } else {
    db.step2.impossible = false
    if (ui.step2.premise) db.step2.premise = ui.step2.premise
    if (ui.step2.linkDirections) {
      db.step2.link_directions = {
        "antecedent-link": ui.step2.linkDirections.antecedentLink,
        "consequent-link": ui.step2.linkDirections.consequentLink,
      }
    }
  }

  return db
}

export function mapDbToUiState(db: any): UiStepsState {
  return {
    step1: {
      antecedent: db?.step1?.antecedent ?? '',
      consequent: db?.step1?.consequent ?? '',
      isPassed: !!db?.step1?.is_passed,
    },
    step2: {
      impossible: !!db?.step2?.impossible,
      premise: db?.step2?.premise ?? '',
      linkDirections: db?.step2?.link_directions
        ? {
            antecedentLink: !!db.step2.link_directions["antecedent-link"],
            consequentLink: !!db.step2.link_directions["consequent-link"],
          }
        : { antecedentLink: true, consequentLink: true },
      isPassed: !!db?.step2?.is_passed,
    },
    step3: {
      inferenceType: db?.step3?.inference_type ?? '',
      validity: db?.step3?.validity ?? null,
      isPassed: !!db?.step3?.is_passed,
    },
  }
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

export function isStepCorrect(steps: any, stepNumber: 1 | 2 | 3, state: any): boolean {
  const rubric = steps?.[`step${stepNumber}`]?.rubric
  if (!rubric) return false
  const correct = rubric.correct_answer
  const incoming = normalizeStateFragment(stepNumber, state)

  if (stepNumber === 1) {
    return Boolean(
      incoming?.antecedent === correct?.antecedent &&
      incoming?.consequent === correct?.consequent
    )
  }

  if (stepNumber === 2) {
    const impossible = Boolean(incoming?.impossible)
    const correctImpossible = Boolean(correct?.impossible)
    if (impossible) {
      return correctImpossible === true
    }
    const incLinks = incoming?.link_directions || {}
    const corLinks = correct?.link_directions || {}
    return Boolean(
      correctImpossible === false &&
      incoming?.premise === correct?.premise &&
      incLinks['antecedent-link'] === corLinks['antecedent-link'] &&
      incLinks['consequent-link'] === corLinks['consequent-link']
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

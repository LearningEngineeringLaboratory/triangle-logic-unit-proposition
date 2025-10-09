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

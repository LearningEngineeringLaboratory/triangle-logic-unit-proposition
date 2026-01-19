import { ProblemDetail, LogicalSymbolStepsState, TriangleLink } from '@/lib/types'

/**
 * 比較実験用の答え合わせロジック（2ステップ構成）
 */

/**
 * Step1の答え合わせ
 * 
 * 所与命題の答えは、correct_answers.step2の配列を参照
 * - fromが前件、toが後件
 * - 2つのリンクが配列に入っているが、順不同
 * 
 * 導出命題の答えは、correct_answers.step1を参照
 * - antecedentが前件、consequentが後件
 */
export function checkStep1Answer(
  step1State: LogicalSymbolStepsState['step1'],
  problem: ProblemDetail
): boolean {
  if (!step1State) {
    return false
  }

  const correctAnswers = problem.correct_answers

  // 導出命題のチェック（correct_answers.step1を参照）
  if (!correctAnswers.step1) {
    return false
  }

  const conclusionMatch =
    step1State.conclusion.antecedent === correctAnswers.step1.antecedent &&
    step1State.conclusion.consequent === correctAnswers.step1.consequent

  if (!conclusionMatch) {
    return false
  }

  // 所与命題のチェック（correct_answers.step2の配列を参照）
  // step2はTriangleLink[]形式（{from: string, to: string}[]）
  const step2Correct = correctAnswers.step2
  let correctLinks: TriangleLink[] = []

  if (Array.isArray(step2Correct)) {
    correctLinks = step2Correct as TriangleLink[]
  } else if (step2Correct && typeof step2Correct === 'object' && 'links' in step2Correct) {
    // 後方互換性のため、Step2Answer形式もサポート
    const step2Answer = step2Correct as { links?: TriangleLink[] }
    correctLinks = Array.isArray(step2Answer.links) ? step2Answer.links : []
  }

  // 正解リンクを{antecedent: from, consequent: to}形式に変換
  const correctPremises = correctLinks.map(link => ({
    antecedent: link.from,
    consequent: link.to,
  }))

  // ユーザーの回答（premise1とpremise2）
  const userPremises = [
    step1State.premise1,
    step1State.premise2,
  ]

  // 順不同で比較するため、正規化して比較
  const normalizePremise = (premise: { antecedent: string; consequent: string }) => {
    // 文字列として正規化（順序を保証）
    return `${premise.antecedent}|${premise.consequent}`
  }

  const correctPremisesNormalized = correctPremises.map(normalizePremise).sort()
  const userPremisesNormalized = userPremises.map(normalizePremise).sort()

  // 配列の長さが一致し、すべての要素が一致するかチェック
  if (correctPremisesNormalized.length !== userPremisesNormalized.length) {
    return false
  }

  const premisesMatch = correctPremisesNormalized.every((correct, index) => 
    correct === userPremisesNormalized[index]
  )

  return premisesMatch
}

/**
 * Step2の答え合わせ
 * 
 * correct_answers.step3からinference_typeを取得し、
 * それに基づいてis_validを計算
 * - 演繹推論: is_valid=true
 * - 仮説推論: is_valid=false
 * - 非形式推論: is_valid=false
 */
export function checkStep2Answer(
  step2State: LogicalSymbolStepsState['step2'],
  problem: ProblemDetail
): boolean {
  if (!step2State) {
    return false
  }

  const correctAnswers = problem.correct_answers

  // step2の正解データを取得（比較実験用の構造）
  // 既存のデータ構造では、step3にinference_typeが保存されている
  const step3Correct = correctAnswers.step3

  // 推論形式のチェック
  const inferenceTypeMatch = step3Correct?.inference_type
    ? step2State.inferenceType === step3Correct.inference_type
    : false

  // is_validは、inference_typeから計算
  // 演繹推論: is_valid=true
  // 仮説推論: is_valid=false
  // 非形式推論: is_valid=false
  let expectedIsValid = false

  if (step3Correct?.inference_type === '演繹推論') {
    expectedIsValid = true
  } else if (step3Correct?.inference_type === '仮説推論') {
    expectedIsValid = false
  } else if (step3Correct?.inference_type === '非形式推論') {
    expectedIsValid = false
  }

  const isValidMatch = step2State.isValid === expectedIsValid

  return isValidMatch && inferenceTypeMatch
}

/**
 * Step2の各フィールドのエラー状態を返す
 */
export function getStep2FieldErrors(
  step2State: LogicalSymbolStepsState['step2'],
  problem: ProblemDetail
): {
  isLogical: boolean
  isValid: boolean
  inferenceType: boolean
} {
  if (!step2State) {
    return {
      isLogical: true, // 使用しないので常にtrue
      isValid: false,
      inferenceType: false,
    }
  }

  const correctAnswers = problem.correct_answers
  const step3Correct = correctAnswers.step3

  // 推論形式のチェック
  const inferenceTypeMatch = step3Correct?.inference_type
    ? step2State.inferenceType === step3Correct.inference_type
    : false

  // is_validは、inference_typeから計算
  let expectedIsValid = false

  if (step3Correct?.inference_type === '演繹推論') {
    expectedIsValid = true
  } else if (step3Correct?.inference_type === '仮説推論') {
    expectedIsValid = false
  } else if (step3Correct?.inference_type === '非形式推論') {
    expectedIsValid = false
  }

  const isValidMatch = step2State.isValid === expectedIsValid

  return {
    isLogical: true, // 使用しないので常にtrue
    isValid: isValidMatch,
    inferenceType: inferenceTypeMatch,
  }
}

/**
 * 指定されたステップの答え合わせ
 */
export function checkAnswerLogicalSymbol(
  step: 1 | 2,
  steps: LogicalSymbolStepsState,
  problem: ProblemDetail
): boolean {
  if (step === 1) {
    return checkStep1Answer(steps.step1, problem)
  } else if (step === 2) {
    return checkStep2Answer(steps.step2, problem)
  }

  return false
}


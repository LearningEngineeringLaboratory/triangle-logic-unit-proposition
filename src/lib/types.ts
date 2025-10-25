export interface SessionData {
  session_id: string
  user_id: string
  created_at: string
  last_activity: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface RegisterRequestBody {
  name: string
  email: string
}

export interface RegisterResponse {
  user_id: string
  name: string
  email: string
  isNewUser: boolean
}

export interface CreateSessionRequestBody {
  user_id: string
}

export interface CreateSessionResponse {
  session: SessionData
}

export interface RestoreSessionResponse {
  session?: SessionData
  user?: { name: string; email: string; user_id: string }
  isReturningUser: boolean
}

// ステップ関連の型定義（可変ステップ数対応）
export interface StepState {
  isPassed: boolean
  [key: string]: any // 各ステップの固有フィールド
}

// Step1: 導出命題
export interface Step1State extends StepState {
  antecedent: string
  consequent: string
}

// Step2: 所与命題とリンク
export interface Step2State extends StepState {
  premise: string
  links: Array<{ from: string; to: string }>
}

// Step3: 推論形式と妥当性
export interface Step3State extends StepState {
  inferenceType: string
  validity: boolean | null
}

// Step4: リンクの活性/非活性
export interface Step4State extends StepState {
  links: Array<{ from: string; to: string; active: boolean }>
}

// Step5: 論証構成
export interface Step5State extends StepState {
  premises: Array<{ antecedent: string; consequent: string }>
}

export interface StepsState {
  step1?: Step1State
  step2?: Step2State
  step3?: Step3State
  step4?: Step4State
  step5?: Step5State
}

// 問題の型定義（可変ステップ数対応）
export interface Problem {
  problem_id: string
  argument: string
  correct_answers?: StepsState
  completed_steps?: number
  order_index?: number // 問題セット内での順番
  total_steps?: number // 総ステップ数（correct_answersから動的に計算）
}

export interface ProblemSet {
  set_id: string
  name: string
  description?: string
  version: string
  is_active: boolean
  created_at: string
}

export interface ProblemSetItem {
  set_id: string
  problem_id: string
  order_index: number
  created_at: string
}

// 問題詳細の型定義
export interface ProblemDetail extends Problem {
  correct_answers: StepsState
  options?: string[]
}


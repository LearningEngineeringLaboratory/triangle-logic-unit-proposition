import { ProblemDetail, StepsState } from '@/lib/types'

/**
 * 各ステップコンポーネントに共通で渡されるpropsの基本型
 */
export interface BaseStepComponentProps {
  problem: ProblemDetail
  currentStep: number
  stepsState: StepsState
  attemptId?: string | null
  sessionInfo?: { sessionId: string; userId: string } | null
  nodeValues?: { antecedent: string; consequent: string; premiseNodes: Array<{ id: string; value: string }> } | null
}

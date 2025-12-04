import { useEffect } from 'react'
import { ProblemDetail, StepsState } from '@/lib/types'

interface UseProblemResponseOptions {
  problem: ProblemDetail | null
  problemNumber: number
  steps: StepsState
  currentStep: number
  completedSteps: number
  totalSteps: number
  sessionInfo: { sessionId: string; userId: string } | null
}

export function useProblemResponse({
  problem,
  problemNumber,
  steps,
  currentStep,
  completedSteps,
  totalSteps,
  sessionInfo,
}: UseProblemResponseOptions) {
  // ステップ更新時にResponseテーブルに保存
  useEffect(() => {
    if (problem && sessionInfo) {
      const currentSessionId = sessionInfo.sessionId
      const currentUserId = sessionInfo.userId
      if (currentSessionId && currentUserId) {
        // デバウンス処理（500ms待機）
        const timeoutId = setTimeout(() => {
          fetch('/api/response/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: currentSessionId,
              user_id: currentUserId,
              problem_id: problem.problem_id,
              problem_number: problemNumber,
              state: steps,
              current_step: currentStep,
              is_completed: completedSteps >= totalSteps,
            }),
          }).catch((err) => {
            console.error('Failed to save response:', err)
          })
        }, 500)

        return () => clearTimeout(timeoutId)
      }
    }
  }, [steps, currentStep, problem, problemNumber, completedSteps, totalSteps, sessionInfo])
}


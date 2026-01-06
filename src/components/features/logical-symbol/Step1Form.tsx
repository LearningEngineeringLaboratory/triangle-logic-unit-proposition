'use client'

import { LogicalSymbolStep1State, ProblemDetail } from '@/lib/types'
import { logSelectDropdownLogicalSymbol } from '@/lib/logging-logical-symbol'
import { useCallback } from 'react'
import { PropositionForm } from './PropositionForm'

interface Step1FormProps {
  problem: ProblemDetail
  step1State: LogicalSymbolStep1State
  onStep1Change: (updates: Partial<LogicalSymbolStep1State>) => void
  attemptId?: string | null
  sessionInfo?: { sessionId: string; userId: string } | null
  currentState?: unknown // 現在の全ステップの状態（ログ記録用）
}

export function Step1Form({
  problem,
  step1State,
  onStep1Change,
  attemptId,
  sessionInfo,
  currentState,
}: Step1FormProps) {
  // ログ記録付きで更新する関数
  const handleFieldChange = useCallback((field: string, value: string, updates: Partial<LogicalSymbolStep1State>) => {
    onStep1Change(updates)
    
    if (sessionInfo && problem.problem_id) {
      logSelectDropdownLogicalSymbol({
        controlId: field,
        value,
        attemptId: attemptId ?? undefined,
        problemId: problem.problem_id,
        sessionId: sessionInfo.sessionId,
        userId: sessionInfo.userId,
        state: currentState,
      }).catch(console.error)
    }
  }, [onStep1Change, sessionInfo, problem.problem_id, attemptId, currentState])

  return (
    <div className="space-y-6">
      <PropositionForm
        problem={problem}
        step1State={step1State}
        onStep1Change={onStep1Change}
        onFieldChange={handleFieldChange}
        readOnly={false}
      />
    </div>
  )
}


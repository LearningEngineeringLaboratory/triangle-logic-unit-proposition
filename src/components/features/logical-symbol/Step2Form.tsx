'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LogicalSymbolStep1State, LogicalSymbolStep2State, ProblemDetail } from '@/lib/types'
import { logSelectDropdownLogicalSymbol } from '@/lib/logging-logical-symbol'
import { useCallback } from 'react'
import { PropositionForm } from './PropositionForm'

interface Step2FormProps {
  problem: ProblemDetail
  step1State: LogicalSymbolStep1State
  step2State: LogicalSymbolStep2State
  onStep2Change: (updates: Partial<LogicalSymbolStep2State>) => void
  attemptId?: string | null
  sessionInfo?: { sessionId: string; userId: string } | null
  currentState?: unknown // 現在の全ステップの状態（ログ記録用）
  fieldErrors?: {
    isLogical: boolean
    isValid: boolean
    inferenceType: boolean
  } | null // フィールドごとのエラー状態（nullの場合はエラー表示なし）
}

export function Step2Form({
  problem,
  step1State,
  step2State,
  onStep2Change,
  attemptId,
  sessionInfo,
  currentState,
  fieldErrors,
}: Step2FormProps) {
  // ログ記録付きで更新する関数
  const handleChange = useCallback((field: string, value: string, updates: Partial<LogicalSymbolStep2State>) => {
    onStep2Change(updates)
    
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
  }, [onStep2Change, sessionInfo, problem.problem_id, attemptId, currentState])

  // はい/いいえの値を変換
  const isLogicalValue = step2State.isLogical === null ? '' : (step2State.isLogical ? 'はい' : 'いいえ')
  const isValidValue = step2State.isValid === null ? '' : (step2State.isValid ? 'はい' : 'いいえ')

  return (
    <div className="space-y-6">
      {/* Step1の回答を表示（読み取り専用） */}
      <div className="p-4 bg-muted rounded-lg w-2/3">
        <PropositionForm
          problem={problem}
          step1State={step1State}
          readOnly={true}
        />
      </div>

      {/* 問題1: 論理的か */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">
          問題1. この論証は推論として論理的ですか？
        </span>
        <Select
          value={isLogicalValue}
          onValueChange={(value) => {
            const updates = {
              ...step2State,
              isLogical: value === 'はい',
            }
            handleChange('step2-is-logical', value, updates)
          }}
        >
          <SelectTrigger 
            className={`w-full h-14 rounded-xl border-2 text-lg py-3 ${isLogicalValue ? '' : 'animate-glow-pulse'}`}
            aria-invalid={fieldErrors ? !fieldErrors.isLogical : undefined}
          >
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="はい">推論として論理的である</SelectItem>
            <SelectItem value="いいえ">推論として論理的でない</SelectItem>
          </SelectContent>
        </Select>
        {fieldErrors && !fieldErrors.isLogical && (
          <span className="text-sm text-destructive">正しくありません</span>
        )}
      </div>

      {/* 問題2: 妥当か */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">
          問題2. この論証は、所与命題を正しいと仮定したとき、導出命題は必ず正しいといえますか？
        </span>
        <Select
          value={isValidValue}
          onValueChange={(value) => {
            const updates = {
              ...step2State,
              isValid: value === 'はい',
            }
            handleChange('step2-is-valid', value, updates)
          }}
        >
          <SelectTrigger 
            className={`w-full h-14 rounded-xl border-2 text-lg py-3 ${isValidValue ? '' : 'animate-glow-pulse'}`}
            aria-invalid={fieldErrors ? !fieldErrors.isValid : undefined}
          >
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="はい">常に正しい</SelectItem>
            <SelectItem value="いいえ">常に正しいとはいえない</SelectItem>
          </SelectContent>
        </Select>
        {fieldErrors && !fieldErrors.isValid && (
          <span className="text-sm text-destructive">正しくありません</span>
        )}
      </div>

      {/* 問題3: 推論形式 */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">
          問題3. この論証の推論形式を答えてください。
        </span>
        <Select
          value={step2State.inferenceType}
          onValueChange={(value) => {
            const updates = {
              ...step2State,
              inferenceType: value,
            }
            handleChange('step2-inference-type', value, updates)
          }}
        >
          <SelectTrigger 
            className={`w-full h-14 rounded-xl border-2 text-lg py-3 ${step2State.inferenceType ? '' : 'animate-glow-pulse'}`}
            aria-invalid={fieldErrors ? !fieldErrors.inferenceType : undefined}
          >
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="演繹推論">演繹推論</SelectItem>
            <SelectItem value="仮説推論">仮説推論</SelectItem>
            <SelectItem value="非形式推論">非形式推論</SelectItem>
          </SelectContent>
        </Select>
        {fieldErrors && !fieldErrors.inferenceType && (
          <span className="text-sm text-destructive">正しくありません</span>
        )}
      </div>
    </div>
  )
}


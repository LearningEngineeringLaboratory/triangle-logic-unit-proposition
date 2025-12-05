'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { logSelectDropdown } from '@/lib/logging'
import { mapUiToDbState } from '@/lib/utils'
import { StepsState } from '@/lib/types'

interface Step3QuestionInputsProps {
  inferenceTypeValue: string
  validityValue: string
  verificationValue: string
  onInferenceTypeChange?: (value: string) => void
  onValidityChange?: (value: string) => void
  onVerificationChange?: (value: string) => void
  attemptId?: string | null
  problemId?: string
  sessionInfo?: { sessionId: string; userId: string } | null
  stepsState?: StepsState
  nodeValues?: { antecedent: string; consequent: string; premiseNodes: Array<{ id: string; value: string }> } | null
}

export const Step3QuestionInputs = ({
  inferenceTypeValue,
  validityValue,
  verificationValue,
  onInferenceTypeChange,
  onValidityChange,
  onVerificationChange,
  attemptId,
  problemId,
  sessionInfo,
  stepsState,
  nodeValues,
}: Step3QuestionInputsProps) => {
  const emitLog = (controlId: string, value: string, updatedSteps: StepsState) => {
    const dbState = nodeValues ? mapUiToDbState(updatedSteps, nodeValues) : null
    logSelectDropdown({
      controlId,
      value,
      attemptId: attemptId ?? undefined,
      problemId,
      sessionId: sessionInfo?.sessionId ?? '',
      userId: sessionInfo?.userId ?? '',
      state: dbState,
    }).catch(console.error)
  }

  const handleVerificationChange = (value: string) => {
    onVerificationChange?.(value)
    if (sessionInfo && problemId && stepsState) {
      const currentStep3 = stepsState.step3 || { isPassed: false, inferenceType: '', validity: null, verification: null }
      const updatedSteps: StepsState = {
        ...stepsState,
        step3: {
          ...currentStep3,
          verification: value === '高い',
        },
      }
      emitLog('step3-verification', value, updatedSteps)
    }
  }

  const handleValidityChange = (value: string) => {
    onValidityChange?.(value)
    if (sessionInfo && problemId && stepsState) {
      const currentStep3 = stepsState.step3 || { isPassed: false, inferenceType: '', validity: null, verification: null }
      const updatedSteps: StepsState = {
        ...stepsState,
        step3: {
          ...currentStep3,
          validity: value === '妥当',
        },
      }
      emitLog('step3-validity', value, updatedSteps)
    }
  }

  const handleInferenceTypeChange = (value: string) => {
    onInferenceTypeChange?.(value)
    if (sessionInfo && problemId && stepsState) {
      const currentStep3 = stepsState.step3 || { isPassed: false, inferenceType: '', validity: null, verification: null }
      const updatedSteps: StepsState = {
        ...stepsState,
        step3: {
          ...currentStep3,
          inferenceType: value,
        },
      }
      emitLog('step3-inference_type', value, updatedSteps)
    }
  }

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 w-full max-w-3xl">
        <div className="flex flex-col gap-2 mt-6">
          <span className="text-sm font-medium text-foreground">
            問題1. この論証には演繹構造が含まれていますか？演繹構造とは、「P→Q, Q→R, P→R」のような構造のことを指します。
          </span>
          <Select value={verificationValue} onValueChange={handleVerificationChange}>
            <SelectTrigger className={`w-full h-14 rounded-xl border-2 text-lg py-3 ${verificationValue ? '' : 'animate-glow-pulse'}`}>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="高い">演繹構造が含まれている</SelectItem>
              <SelectItem value="低い">演繹構造が含まれていない</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 mt-6">
          <span className="text-sm font-medium text-foreground">
            問題2. この論証の妥当性を答えてください。妥当であるとは、前提を正しいと仮定したとき、導出される結論が必ず正しいことを意味します。
          </span>
          <Select value={validityValue} onValueChange={handleValidityChange}>
            <SelectTrigger className={`w-full h-14 rounded-xl border-2 text-lg py-3 ${validityValue ? '' : 'animate-glow-pulse'}`}>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="妥当">妥当</SelectItem>
              <SelectItem value="非妥当">非妥当</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 mt-6">
          <span className="text-sm font-medium text-foreground">問題3. この論証の推論形式を答えてください。</span>
          <Select value={inferenceTypeValue} onValueChange={handleInferenceTypeChange}>
            <SelectTrigger className={`w-full h-14 rounded-xl border-2 text-lg py-3 ${inferenceTypeValue ? '' : 'animate-glow-pulse'}`}>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="演繹推論">演繹推論</SelectItem>
              <SelectItem value="仮説推論">仮説推論</SelectItem>
              <SelectItem value="非形式推論">非形式推論</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export type { Step3QuestionInputsProps }

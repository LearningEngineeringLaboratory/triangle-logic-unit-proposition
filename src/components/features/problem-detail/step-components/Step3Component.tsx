'use client'

import { BaseStepComponentProps } from './step-component-props'
import { Step3QuestionInputs } from '../step3-question-inputs'

interface Step3ComponentProps extends BaseStepComponentProps {
  stepNumber: number
  isCurrentStep?: boolean
  isPastStep?: boolean
  isCompleted?: boolean
  inferenceTypeValue: string
  validityValue: string
  verificationValue: string
  onInferenceTypeChange?: (value: string) => void
  onValidityChange?: (value: string) => void
  onVerificationChange?: (value: string) => void
}

/**
 * Step3: 推論形式と妥当性の判別
 * 
 * 完全に独立したステップコンポーネント。
 * タイトル、コンテンツ、UIをすべて含む。
 */
export const Step3Component = ({
  problem,
  stepsState,
  attemptId,
  sessionInfo,
  nodeValues,
  stepNumber,
  isCurrentStep = true,
  isPastStep = false,
  isCompleted = false,
  inferenceTypeValue,
  validityValue,
  verificationValue,
  onInferenceTypeChange,
  onValidityChange,
  onVerificationChange,
}: Step3ComponentProps) => {
  if (isPastStep) {
    // 過去のステップ表示用（簡易版）
    return (
      <>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-muted-foreground/70">
              Step {stepNumber}: 推論形式と妥当性の判別
            </h3>
          </div>
          {isCompleted && (
            <span className="ml-auto text-xs bg-success/10 text-success px-3 py-1.5 rounded-full border border-success/20 font-medium">
              完了
            </span>
          )}
        </div>
        <div className="text-sm leading-relaxed text-muted-foreground/70 whitespace-pre-line">
          構成した三角ロジックをもとに、この論証の推論形式と妥当性を答えましょう。
        </div>
      </>
    )
  }

  // 現在のステップ表示用（完全版）
  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Step {stepNumber}: 推論形式と妥当性の判別
        </h3>
      </div>
      <div className="text-base leading-relaxed text-foreground whitespace-pre-line mb-6">
        構成した三角ロジックをもとに、この論証の推論形式と妥当性を答えましょう。
      </div>
      <Step3QuestionInputs
        inferenceTypeValue={inferenceTypeValue}
        validityValue={validityValue}
        verificationValue={verificationValue}
        onInferenceTypeChange={onInferenceTypeChange}
        onValidityChange={onValidityChange}
        onVerificationChange={onVerificationChange}
        attemptId={attemptId}
        problemId={problem.problem_id}
        sessionInfo={sessionInfo}
        stepsState={stepsState}
        nodeValues={nodeValues}
      />
    </>
  )
}

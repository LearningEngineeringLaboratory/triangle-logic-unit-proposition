'use client'

import { PremiseSelection } from '@/lib/types'
import { BaseStepComponentProps } from './step-component-props'
import { Step5ArgumentInput } from '../step5-argument-input'

interface Step5ComponentProps extends BaseStepComponentProps {
  stepNumber: number
  isCurrentStep?: boolean
  isPastStep?: boolean
  isCompleted?: boolean
  optionList: string[]
  step5Premises: PremiseSelection[]
  onStep5PremiseChange?: (index: number, field: 'antecedent' | 'consequent', value: string) => void
}

/**
 * Step5: 妥当性のある三項論証を構成
 * 
 * 完全に独立したステップコンポーネント。
 * タイトル、コンテンツ、UIをすべて含む。
 */
export const Step5Component = ({
  problem,
  stepsState,
  attemptId,
  sessionInfo,
  nodeValues,
  stepNumber,
  isCurrentStep = true,
  isPastStep = false,
  isCompleted = false,
  optionList,
  step5Premises,
  onStep5PremiseChange,
}: Step5ComponentProps) => {
  if (isPastStep) {
    // 過去のステップ表示用（簡易版）
    return (
      <>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-muted-foreground/70">
              Step {stepNumber}: 演繹推論となる三項論証を構成
            </h3>
          </div>
          {isCompleted && (
            <span className="ml-auto text-xs bg-success/10 text-success px-3 py-1.5 rounded-full border border-success/20 font-medium">
              完了
            </span>
          )}
        </div>
        <div className="text-sm leading-relaxed text-muted-foreground/70 whitespace-pre-line">
          Step4で作成したマップをもとに、この論証の導出命題を演繹的に導く三項論証を構成してください。
        </div>
      </>
    )
  }

  // 現在のステップ表示用（完全版）
  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Step {stepNumber}: 演繹推論となる論証を構成
        </h3>
      </div>
      <div className="text-base leading-relaxed text-foreground whitespace-pre-line mb-6">
        修正した三角ロジックをもとに、導出命題を演繹推論として導く論証を構成しましょう。
      </div>
      <Step5ArgumentInput
        optionList={optionList}
        step5Premises={step5Premises}
        onStep5PremiseChange={onStep5PremiseChange}
        stepsState={stepsState}
        attemptId={attemptId}
        problemId={problem.problem_id}
        sessionInfo={sessionInfo}
        nodeValues={nodeValues}
      />
    </>
  )
}

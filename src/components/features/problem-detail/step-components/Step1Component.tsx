'use client'

import { BaseStepComponentProps } from './step-component-props'
import { StepHint } from './StepHint'
import { StepTermDefinition } from './StepTermDefinition'

interface Step1ComponentProps extends BaseStepComponentProps {
  stepNumber: number
  isCurrentStep?: boolean
  isPastStep?: boolean
  isCompleted?: boolean
}

/**
 * Step1: 導出命題を構成
 * 
 * 完全に独立したステップコンポーネント。
 * タイトル、コンテンツ、ヒント、UIをすべて含む。
 */
export const Step1Component = ({ stepNumber, isCurrentStep = true, isPastStep = false, isCompleted = false }: Step1ComponentProps) => {
  if (isPastStep) {
    // 過去のステップ表示用（簡易版）
    return (
      <>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-muted-foreground/70">
              Step {stepNumber}: 導出命題を構成
            </h3>
          </div>
          {isCompleted && (
            <span className="ml-auto text-xs bg-success/10 text-success px-3 py-1.5 rounded-full border border-success/20 font-medium">
              完了
            </span>
          )}
        </div>
        <div className="text-sm leading-relaxed text-muted-foreground/70 whitespace-pre-line">
          この論証が導いている命題（導出命題）を構成しましょう。
        </div>
      </>
    )
  }

  // 現在のステップ表示用（完全版）
  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Step {stepNumber}: 導出命題を構成
        </h3>
      </div>
      <div className="text-base leading-relaxed text-foreground whitespace-pre-line mb-6">
        この論証の導出命題* を構成しましょう。<br />
        画面右側のエリアで選択肢を選択してください。
      </div>
      <StepTermDefinition>
        * <strong>導出命題</strong>：論証において前提から導かれる命題。「したがって」などの接続詞があり、結論となる命題。
      </StepTermDefinition>
      <StepHint>
      「PであるならばQである。したがって、PであるならばRである。なぜならば、QであるならばRであるからである。」という論証の場合、導出命題は「PであるならばRである」となります。
      </StepHint>
    </>
  )
}

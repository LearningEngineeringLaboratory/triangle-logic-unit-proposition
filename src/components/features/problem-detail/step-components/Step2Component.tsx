'use client'

import { BaseStepComponentProps } from './step-component-props'
import { StepTermDefinition } from './StepTermDefinition'
import { StepHint } from './StepHint'

interface Step2ComponentProps extends BaseStepComponentProps {
  stepNumber: number
  isCurrentStep?: boolean
  isPastStep?: boolean
  isCompleted?: boolean
}

/**
 * Step2: 三角ロジックの構成
 * 
 * 完全に独立したステップコンポーネント。
 * タイトル、コンテンツ、UIをすべて含む。
 */
export const Step2Component = ({ stepNumber, isCurrentStep = true, isPastStep = false, isCompleted = false }: Step2ComponentProps) => {
  if (isPastStep) {
    // 過去のステップ表示用（簡易版）
    return (
      <>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-muted-foreground/70">
              Step {stepNumber}: 三角ロジックの構成
            </h3>
          </div>
          {isCompleted && (
            <span className="ml-auto text-xs bg-success/10 text-success px-3 py-1.5 rounded-full border border-success/20 font-medium">
              完了
            </span>
          )}
        </div>
        <div className="text-sm leading-relaxed text-muted-foreground/70 whitespace-pre-line">
          この論証の前提となる命題（所与命題）を構成しましょう。
          {'\n\n'}
          1. 前提に必要な部品を追加
          {'\n'}
          2. 論証が表す意味と同じになるように、リンクを接続
        </div>
      </>
    )
  }

  // 現在のステップ表示用（完全版）
  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Step {stepNumber}: 三角ロジックの構成
        </h3>
      </div>
      <div className="text-base leading-relaxed text-foreground whitespace-pre-line mb-6">
        この論証の所与命題* を構成しましょう。<br />
        
        {'\n\n'}
        1. 画面右側のエリア下部から必要な命題を追加してください。
        {'\n'}
        2. 命題右下の矢印を他の命題に接続して、論証の構造を作成してください。
      </div>
      <StepTermDefinition>
        * 所与命題：論証において事実としている命題や、前提となる命題のこと。
      </StepTermDefinition>
      <StepHint>
      「PであるならばQである。したがって、PであるならばRである。なぜならば、QであるならばRであるからである。」という論証の場合、所与命題は「PであるならばQである」と「QであるならばRである」になります。
      </StepHint>
    </>
  )
}

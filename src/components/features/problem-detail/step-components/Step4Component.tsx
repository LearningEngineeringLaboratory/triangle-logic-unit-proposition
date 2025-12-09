'use client'

import { BaseStepComponentProps } from './step-component-props'

interface Step4ComponentProps extends BaseStepComponentProps {
  stepNumber: number
  isCurrentStep?: boolean
  isPastStep?: boolean
  isCompleted?: boolean
}

/**
 * Step4: 妥当性のある三角ロジックの構成
 * 
 * 完全に独立したステップコンポーネント。
 * タイトル、コンテンツ、UIをすべて含む。
 */
export const Step4Component = ({
  stepNumber,
  isCurrentStep = true,
  isPastStep = false,
  isCompleted = false,
  nodeValues,
}: Step4ComponentProps) => {
  const antecedentLabel = nodeValues?.antecedent ?? 'P'
  const consequentLabel = nodeValues?.consequent ?? 'Q'
  const instructionContent = (
    <>
      三角ロジックを修正し、この論証の導出命題である
      <br />
      「<span className="font-semibold">{antecedentLabel}ならば{consequentLabel}</span>」
      <br />
      を演繹推論として導く論証を構成してください。
      複数パターンある場合は、成り立つパターンのうち一つを作成してください。<br />
      また、不要な接続があれば非表示にしてください。
    </>
  )
  if (isPastStep) {
    // 過去のステップ表示用（簡易版）
    return (
      <>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-muted-foreground/70">
              Step {stepNumber}: 妥当性のある三角ロジックの構成
            </h3>
          </div>
          {isCompleted && (
            <span className="ml-auto text-xs bg-success/10 text-success px-3 py-1.5 rounded-full border border-success/20 font-medium">
              完了
            </span>
          )}
        </div>
        <div className="text-sm leading-relaxed text-muted-foreground/70 whitespace-pre-line">
          {instructionContent}
        </div>
      </>
    )
  }

  // 現在のステップ表示用（完全版）
  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Step {stepNumber}: 妥当性のある三角ロジックの構成
        </h3>
      </div>
      <div className="text-base leading-relaxed text-foreground whitespace-pre-line mb-6">
        {instructionContent}
      </div>
    </>
  )
}

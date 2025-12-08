'use client'

import { AlertCircle } from 'lucide-react'
import { BaseStepComponentProps } from './step-component-props'

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
        この論証が導いている命題（導出命題）を構成しましょう。
      </div>
      <div className="mb-6 rounded-xl border-2 border-warning/30 bg-warning/10 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-5 w-5 text-warning" aria-hidden="true" />
          <span className="text-base font-semibold text-warning">ヒント</span>
        </div>
        <div className="text-sm leading-relaxed text-foreground whitespace-pre-line">
          「したがって」や「よって」、「とすると」などの接続詞がある命題に着目しましょう。
        </div>
      </div>
      {/* Step1は三角ロジックフローで操作するため、特別なUIは不要 */}
    </>
  )
}

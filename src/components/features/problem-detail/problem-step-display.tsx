'use client'

import { PremiseSelection, ProblemDetail, StepsState } from '@/lib/types'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useStepScroll } from './use-step-scroll'
import { Step1Component } from './step-components/Step1Component'
import { Step2Component } from './step-components/Step2Component'
import { Step3Component } from './step-components/Step3Component'
import { Step4Component } from './step-components/Step4Component'
import { Step5Component } from './step-components/Step5Component'

interface ProblemStepDisplayProps {
  problem: ProblemDetail
  currentStep: number
  totalSteps?: number // Step3のinference_typeに基づいて動的に計算されたtotalSteps
  inferenceTypeValue?: string
  validityValue?: string
  verificationValue?: string
  onInferenceTypeChange?: (value: string) => void
  onValidityChange?: (value: string) => void
  onVerificationChange?: (value: string) => void
  step5Premises?: PremiseSelection[]
  onStep5PremiseChange?: (index: number, field: 'antecedent' | 'consequent', value: string) => void
  stepsState?: StepsState
  attemptId?: string | null
  sessionInfo?: { sessionId: string; userId: string } | null
  nodeValues?: { antecedent: string; consequent: string; premiseNodes: Array<{ id: string; value: string }> } | null
}

type StepStatus = 'completed' | 'skipped' | 'current' | 'future'

const getStepStatus = (stepsState: StepsState, currentStep: number, stepNumber: number): StepStatus => {
  const stepKey = `step${stepNumber}` as keyof StepsState
  const state = stepsState[stepKey]

  if (stepNumber < currentStep) {
    return state?.isPassed ? 'completed' : 'skipped'
  }

  if (stepNumber === currentStep) {
    return 'current'
  }

  return 'future'
}


export function ProblemStepDisplay({
  problem,
  currentStep,
  totalSteps: propTotalSteps,
  inferenceTypeValue = '',
  validityValue = '',
  verificationValue = '',
  onInferenceTypeChange,
  onValidityChange,
  onVerificationChange,
  step5Premises = [],
  onStep5PremiseChange,
  stepsState = {},
  attemptId,
  sessionInfo,
  nodeValues,
}: ProblemStepDisplayProps) {
  const { scrollContainerRef, showScrollTop, scrollToTop } = useStepScroll(currentStep)

  // propTotalStepsが渡されている場合はそれを使用、なければproblem.total_stepsを使用（後方互換性）
  const totalSteps = propTotalSteps ?? problem?.total_steps ?? 3
  const optionList = problem?.options && problem.options.length > 0 ? problem.options : ['選択肢が設定されていません']

  // 過去のステップ番号のリスト
  const visibleStepNumbers = Array.from({ length: currentStep - 1 }, (_, i) => currentStep - 1 - i)

  // ステップ番号に応じて適切なコンポーネントをレンダリング
  const renderStepComponent = (stepNumber: number, isCurrentStep = true, isPastStep = false, isCompleted = false) => {
    const baseProps = {
      problem,
      currentStep,
      stepsState,
      attemptId,
      sessionInfo,
      nodeValues,
      stepNumber,
      isCurrentStep,
      isPastStep,
      isCompleted,
    }

    switch (stepNumber) {
      case 1:
        return <Step1Component {...baseProps} />
      case 2:
        return <Step2Component {...baseProps} />
      case 3:
        return (
          <Step3Component
            {...baseProps}
            inferenceTypeValue={inferenceTypeValue}
            validityValue={validityValue}
            verificationValue={verificationValue}
            onInferenceTypeChange={onInferenceTypeChange}
            onValidityChange={onValidityChange}
            onVerificationChange={onVerificationChange}
          />
        )
      case 4:
        return <Step4Component {...baseProps} />
      case 5:
        return (
          <Step5Component
            {...baseProps}
            optionList={optionList}
            step5Premises={step5Premises}
            onStep5PremiseChange={onStep5PremiseChange}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col min-h-full relative">
      {/* 段階的ステップ表示（親から与えられたスクロール領域内で自動スクロール）*/}
      <div className="flex-1" ref={scrollContainerRef}>
        <div className="space-y-0 p-6 pt-8">
          {/* 現在のステップ（最上部に表示） */}
          <div className="px-2 pb-6" id={`current-step-${currentStep}`}>
            {/* 各ステップコンポーネントがタイトル、コンテンツ、ヒント、UIをすべて含む */}
            {renderStepComponent(currentStep, true, false)}
          </div>
        </div>
      </div>

      {/* 過去のステップ（Accordionで折りたたみ可能） */}
      {visibleStepNumbers.length > 0 && (
        <div className="border-t border-border bg-background">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="previous-steps" className="border-none">
              <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground py-4 px-6 hover:bg-muted/50 data-[state=open]:bg-muted/50 transition-colors rounded-none">
                これまでのStepを確認する
              </AccordionTrigger>
              <AccordionContent className="px-6 pt-4 pb-6 bg-background">
                <div className="space-y-0">
                  {visibleStepNumbers.map((stepNumber, index) => {
                    const status = getStepStatus(stepsState, currentStep, stepNumber)
                    const isCompleted = status === 'completed'

                    return (
                      <div key={stepNumber} className={index > 0 ? 'border-t border-border pt-6 mt-6' : ''}>
                        {/* 各ステップコンポーネントが過去のステップ表示用のUIも含む（完了バッジも含む） */}
                        {renderStepComponent(stepNumber, false, true, isCompleted)}
                      </div>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}


      {/* 最上部に戻るFAB */}
      <Button
        onClick={scrollToTop}
        size="lg"
        variant="secondary"
        className={`absolute bottom-4 right-4 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 z-10 ${
          showScrollTop 
            ? 'opacity-100 scale-100 pointer-events-auto' 
            : 'opacity-0 scale-0 pointer-events-none'
        }`}
        aria-label="最上部に戻る"
      >
        <ArrowUp className="w-6 h-6" />
      </Button>
    </div>
  )
}

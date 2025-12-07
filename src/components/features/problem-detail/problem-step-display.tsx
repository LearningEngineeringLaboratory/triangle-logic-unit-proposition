'use client'

import { PremiseSelection, ProblemDetail, StepsState } from '@/lib/types'
import { AlertCircle, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Step3QuestionInputs } from './step3-question-inputs'
import { Step5ArgumentInput } from './step5-argument-input'
import { buildStepDefinitions } from './step-definitions'
import { useStepScroll } from './use-step-scroll'

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
  const steps = buildStepDefinitions(totalSteps)
  const optionList = problem?.options && problem.options.length > 0 ? problem.options : ['選択肢が設定されていません']

  const visibleSteps = steps.filter((_, index) => index < currentStep - 1).reverse()
  const currentStepData = steps[currentStep - 1]

  if (!currentStepData) {
    return null
  }

  return (
    <div className="flex flex-col min-h-full relative">
      {/* 段階的ステップ表示（親から与えられたスクロール領域内で自動スクロール）*/}
      <div className="flex-1" ref={scrollContainerRef}>
        <div className="space-y-0 p-6 pt-8">
          {/* 現在のステップ（最上部に表示） */}
          <div className="px-2 pb-6" id={`current-step-${currentStepData.number}`}>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Step {currentStepData.number}: {currentStepData.title}
              </h3>
            </div>
            <p className="text-base leading-relaxed text-foreground whitespace-pre-line mb-6">
              {currentStepData.content}
            </p>
            {currentStepData.hint && (
              <div className="mb-6 rounded-xl border-2 border-warning/30 bg-warning/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-warning" aria-hidden="true" />
                  <span className="text-base font-semibold text-warning">ヒント</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{currentStepData.hint}</p>
              </div>
            )}

            {/* ステップ3の入力フィールド */}
            {currentStepData.number === 3 && (
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
            )}

            {/* ステップ5の入力フィールド */}
            {currentStepData.number === 5 && (
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
            )}
          </div>
        </div>
      </div>

      {/* 過去のステップ（Accordionで折りたたみ可能） */}
      {visibleSteps.length > 0 && (
        <div className="border-t border-border bg-background">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="previous-steps" className="border-none">
              <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground py-4 px-6 hover:bg-muted/50 data-[state=open]:bg-muted/50 transition-colors rounded-none">
                これまでのStepを確認する
              </AccordionTrigger>
              <AccordionContent className="px-6 pt-4 pb-6 bg-background">
                <div className="space-y-0">
                  {visibleSteps.map((step, index) => {
                    const status = getStepStatus(stepsState, currentStep, step.number)
                    const isCompleted = status === 'completed'

                    return (
                      <div key={step.number} className={index > 0 ? 'border-t border-border pt-6 mt-6' : ''}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-muted-foreground/70">
                              Step {step.number}: {step.title}
                            </h3>
                          </div>
                          {isCompleted && (
                            <span className="ml-auto text-xs bg-success/10 text-success px-3 py-1.5 rounded-full border border-success/20 font-medium">
                              完了
                            </span>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground/70 whitespace-pre-line">
                          {step.content}
                        </p>
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

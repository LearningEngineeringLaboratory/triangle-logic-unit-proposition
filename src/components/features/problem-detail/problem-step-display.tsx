'use client'

import { ProblemDetail } from '@/lib/types'
import { AlertCircle, CheckCircle2, Circle, ArrowUp, BookOpen } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'

interface ProblemStepDisplayProps {
  problem: ProblemDetail
  currentStep: number
  onStepChange: (step: number) => void
  inferenceTypeValue?: string
  validityValue?: string
  verificationValue?: string
  onInferenceTypeChange?: (value: string) => void
  onValidityChange?: (value: string) => void
  onVerificationChange?: (value: string) => void
  step5Premises?: Array<{ antecedent: string; consequent: string }>
  onStep5PremiseChange?: (index: number, field: 'antecedent' | 'consequent', value: string) => void
  onRequestNext?: () => void | Promise<void>
  shakeNext?: unknown
  stepsState?: { [stepKey: string]: { isPassed: boolean } } // ステップの完了状態
}

export function ProblemStepDisplay({
  problem,
  currentStep,
  onStepChange,
  inferenceTypeValue = '',
  validityValue = '',
  verificationValue = '',
  onInferenceTypeChange,
  onValidityChange,
  onVerificationChange,
  step5Premises = [],
  onStep5PremiseChange,
  onRequestNext,
  shakeNext,
  stepsState = {}
}: ProblemStepDisplayProps) {
  const [shouldShakeNext, setShouldShakeNext] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  // 外部からのトリガーでshakeを発火（初回は発火させない）
  const prevShakeTokenRef = useRef(shakeNext)
  const currentStepRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const prev = prevShakeTokenRef.current
    if (prev !== shakeNext) {
      setShouldShakeNext(true)
      prevShakeTokenRef.current = shakeNext
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shakeNext])

  // スクロール位置を監視してFABの表示/非表示を切り替え
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      // 200px以上スクロールしたらFABを表示
      setShowScrollTop(container.scrollTop > 200)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // アクティブステップへ自動スクロール（最上部に移動）
  useEffect(() => {
    const el = document.getElementById(`current-step-${currentStep}`)
    if (el) {
      // 最上部にスクロール（新しいステップは常に一番上）
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [currentStep])

  // 最上部にスクロールする関数
  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
  // ステップ定義を動的に生成（可変ステップ数対応）
  const generateSteps = (totalSteps: number) => {
    const steps = []

    for (let i = 1; i <= totalSteps; i++) {
      if (i === 1) {
        steps.push({
          number: 1,
          title: '導出命題を構成',
          content: 'この論証が導いている命題（導出命題）を構成しましょう。',
          hint: '「したがって」や「よって」、「とすると」などの接続詞がある命題に着目しましょう。'
        })
      } else if (i === 2) {
        steps.push({
          number: 2,
          title: '三角ロジックの構成',
          content: 'この論証の前提となる命題（所与命題）を構成しましょう。\n\n 1. 前提に必要な部品を追加\n 2. 論証が表す意味と同じになるように、リンクを接続',
        })
      } else if (i === 3) {
        steps.push({
          number: 3,
          title: '推論形式と妥当性の判別',
          content: '構成した三角ロジックをもとに、この論証の推論形式と妥当性を答えましょう。',
        })
      } else if (i === 4) {
        steps.push({
          number: 4,
          title: '妥当性のある三角ロジックの構成',
          content: '三角ロジックを修正して妥当性のある論証になるような三角ロジックを構成しましょう。',
        })
      } else if (i === 5) {
        steps.push({
          number: 5,
          title: '妥当性のある三項論証を構成',
          content: '修正した三角ロジックをもとに、妥当性のある三項論証を構成しましょう。',
        })
      } else {
        // 6ステップ以上の場合（将来の拡張用）
        steps.push({
          number: i,
          title: `ステップ${i}`,
          content: `ステップ${i}の内容をここに記述します。`,
          hint: `ステップ${i}のヒントをここに記述します。`
        })
      }
    }

    return steps
  }

  const totalSteps = problem?.total_steps || 3
  const steps = generateSteps(totalSteps)

  // ステップの状態を判定する関数
  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) {
      // 過去のステップ：完了済みかどうか
      return stepsState[`step${stepNumber}`]?.isPassed ? 'completed' : 'skipped'
    } else if (stepNumber === currentStep) {
      // 現在のステップ
      return 'current'
    } else {
      // 将来のステップ：表示しない
      return 'future'
    }
  }

  // 表示するステップをフィルタリング（現在のひとつ前まで）
  const visibleSteps = steps.filter((_, index) => index < (currentStep - 1))
  const currentStepData = steps[currentStep - 1]

  return (
    <div className="flex flex-col h-full relative">
      {/* 段階的ステップ表示（親から与えられたスクロール領域内で自動スクロール）*/}
      <div className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
        <div className="space-y-0">
          {/* 現在のステップ（最上部に表示） */}
          <div className="pd-6 px-2" id={`current-step-${currentStepData.number}`}>
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
              <div className="mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-foreground">推論形式</span>
                    <Select value={inferenceTypeValue} onValueChange={onInferenceTypeChange ?? (() => { })}>
                      <SelectTrigger className={`w-full h-12 rounded-xl border-2 text-base ${inferenceTypeValue ? '' : 'animate-glow-pulse'}`}>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="演繹推論">演繹推論</SelectItem>
                        <SelectItem value="仮説推論">仮説推論</SelectItem>
                        <SelectItem value="非形式推論">非形式推論</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-foreground">妥当性</span>
                    <Select value={validityValue} onValueChange={onValidityChange ?? (() => { })}>
                      <SelectTrigger className={`w-full h-12 rounded-xl border-2 text-base ${validityValue ? '' : 'animate-glow-pulse'}`}>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="妥当">妥当</SelectItem>
                        <SelectItem value="非妥当">非妥当</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-foreground">検証価値</span>
                    <Select value={verificationValue} onValueChange={onVerificationChange ?? (() => { })}>
                      <SelectTrigger className={`w-full h-12 rounded-xl border-2 text-base ${verificationValue ? '' : 'animate-glow-pulse'}`}>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="高い">高い</SelectItem>
                        <SelectItem value="低い">低い</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* ステップ5の入力フィールド */}
            {currentStepData.number === 5 && (
              <div className="mb-6">
                <fieldset className="border-2 border-primary/20 rounded-2xl px-4 pt-2 pb-3 mb-2 bg-primary/5">
                  <legend className="px-2 flex items-center gap-2">
                    <BookOpen className="w-3 h-3 text-primary" />
                    <span className="text-sm font-semibold text-primary">論証</span>
                  </legend>
                  <div className="space-y-4 w-full max-w-3xl">
                    {/* 一つの文章として表示 */}
                    <div className="flex flex-wrap items-center gap-2 text-base leading-relaxed text-foreground font-serif tracking-wide">
                      {/* 前提1 */}
                      <div className="flex items-center gap-2">
                        <Select
                          value={step5Premises[0]?.antecedent || ''}
                          onValueChange={(value) => onStep5PremiseChange?.(0, 'antecedent', value)}
                        >
                          <SelectTrigger className={`h-10 rounded-lg border-2 text-base min-w-[120px] font-sans ${step5Premises[0]?.antecedent ? '' : 'animate-glow-pulse'}`}>
                            <SelectValue placeholder="選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {problem.options?.map((option, idx) => (
                              <SelectItem key={idx} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-base font-medium text-foreground font-serif">ならば</span>
                        <Select
                          value={step5Premises[0]?.consequent || ''}
                          onValueChange={(value) => onStep5PremiseChange?.(0, 'consequent', value)}
                        >
                          <SelectTrigger className={`h-10 rounded-lg border-2 text-base min-w-[120px] font-sans ${step5Premises[0]?.consequent ? '' : 'animate-glow-pulse'}`}>
                            <SelectValue placeholder="選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {problem.options?.map((option, idx) => (
                              <SelectItem key={idx} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-base text-foreground font-serif">。</span>
                      </div>

                      {/* 前提2 */}
                      <div className="flex items-center gap-2">
                        <Select
                          value={step5Premises[1]?.antecedent || ''}
                          onValueChange={(value) => onStep5PremiseChange?.(1, 'antecedent', value)}
                        >
                          <SelectTrigger className={`h-10 rounded-lg border-2 text-base min-w-[120px] font-sans ${step5Premises[1]?.antecedent ? '' : 'animate-glow-pulse'}`}>
                            <SelectValue placeholder="選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {problem.options?.map((option, idx) => (
                              <SelectItem key={idx} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-base font-medium text-foreground font-serif">ならば</span>
                        <Select
                          value={step5Premises[1]?.consequent || ''}
                          onValueChange={(value) => onStep5PremiseChange?.(1, 'consequent', value)}
                        >
                          <SelectTrigger className={`h-10 rounded-lg border-2 text-base min-w-[120px] font-sans ${step5Premises[1]?.consequent ? '' : 'animate-glow-pulse'}`}>
                            <SelectValue placeholder="選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {problem.options?.map((option, idx) => (
                              <SelectItem key={idx} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-base text-foreground font-serif">。</span>
                      </div>

                      {/* したがって、結論 */}
                      <span className="text-base text-foreground font-serif">
                        <span className="font-medium">したがって、</span>
                        {(stepsState.step1 as any)?.antecedent || '（前件）'}
                        <span className="font-medium">ならば</span>
                        {(stepsState.step1 as any)?.consequent || '（後件）'}
                        。
                      </span>
                    </div>
                  </div>
                </fieldset>
              </div>
            )}
          </div>

          {/* 過去のステップ（逆順で表示：新しいものが上） */}
          {visibleSteps.reverse().map((step, index) => {
            const status = getStepStatus(step.number)
            const isCompleted = status === 'completed'

            return (
              <div key={step.number}>
                {/* ステップ間のボーダー */}
                <div className="border-t border-border px-2" />
                
                <div className="px-2 py-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-muted-foreground/60">
                        Step {step.number}: {step.title}
                      </h3>
                    </div>
                    {isCompleted && (
                      <span className="ml-auto text-xs bg-success/10 text-success px-3 py-1 rounded-full border border-success/20 font-medium">
                        完了
                      </span>
                    )}
                  </div>
                  <p className="text-base leading-relaxed text-muted-foreground/60 whitespace-pre-line">
                    {step.content}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 下部フェードアウトグラデーション */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none" />

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

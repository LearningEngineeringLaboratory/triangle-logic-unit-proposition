'use client'

import { ProblemDetail } from '@/lib/types'
import { AlertCircle, CheckCircle2, Circle, ArrowUp } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'

interface ProblemStepDisplayProps {
  problem: ProblemDetail
  currentStep: number
  onStepChange: (step: number) => void
  inferenceTypeValue?: string
  validityValue?: string
  onInferenceTypeChange?: (value: string) => void
  onValidityChange?: (value: string) => void
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
  onInferenceTypeChange,
  onValidityChange,
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
          content: 'この論証が導いている命題（導出命題）を構成しましょう。\n ２つのドロップダウンを選択してください。\n\n できたら、「答え合わせ」ボタンを押して、次のステップに進みましょう。',
          hint: '「したがって」や「よって」、「とすると」などの接続詞がある命題に着目しましょう。'
        })
      } else if (i === 2) {
        steps.push({
          number: 2,
          title: '三角ロジックの構成',
          content: 'この論証の前提となる命題（所与命題）を構成しましょう。\n\n 1. 前提のみで使用されている単位命題を選択\n 2. 論証が表す意味と同じになるように、リンクの向きを修正\n 3. 論証と同じ意味の三角ロジックを構成できない場合は「組み立て不可能」のトグルをONにする',
          hint: '🔄ボタンをクリックすると、リンクの向きを反転させることができます。'
        })
      } else if (i === 3) {
        steps.push({
          number: 3,
          title: '推論形式と妥当性の判別',
          content: '構成した三角ロジックをもとに、この論証の推論形式と妥当性を答えましょう。',
          hint: 'リンクの向きの変更がない場合は演繹推論、リンクの向きの変更が1箇所の場合は仮説推論、リンクの向きの変更が2箇所の場合、もしくは三角ロジックを構成できない場合は非形式推論です。'
        })
      } else {
        // 4ステップ以上の場合（将来の拡張用）
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
      <div className="flex-1 overflow-y-auto px-1" ref={scrollContainerRef}>
        <div className="space-y-4 p-2">
          {/* 現在のステップ（最上部に表示） */}
          <div className="p-6 rounded-2xl border-2 border-border shadow-lg bg-card" id={`current-step-${currentStepData.number}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center">
                <Circle className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Step {currentStepData.number}: {currentStepData.title}
              </h3>
            </div>
            <p className="text-base leading-relaxed text-foreground whitespace-pre-line">
              {currentStepData.content}
            </p>
            {currentStepData.hint && (
              <div className="mt-6 rounded-xl border-2 border-warning/30 bg-warning/10 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-warning" aria-hidden="true" />
                  <span className="text-base font-semibold text-warning">ヒント</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{currentStepData.hint}</p>
              </div>
            )}

            {/* ステップ3の入力フィールド */}
            {currentStepData.number === 3 && (
              <div className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
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
                </div>
              </div>
            )}
          </div>

          {/* 過去のステップ（逆順で表示：新しいものが上） */}
          {visibleSteps.reverse().map((step) => {
            const status = getStepStatus(step.number)
            const isCompleted = status === 'completed'

            return (
              <div
                key={step.number}
                className="p-6 mb-6 rounded-2xl border border-border bg-muted/20 text-muted-foreground shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                    <h3 className="text-base font-semibold">
                      Step {step.number}: {step.title}
                    </h3>
                  </div>
                  {isCompleted && (
                    <span className="ml-auto text-xs bg-success/10 text-success px-3 py-1 rounded-full border border-success/20 font-medium">
                      完了
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {step.content}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* 下部フェードアウトグラデーション */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none" />

      {/* 最上部に戻るFAB */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="lg"
          className="absolute bottom-4 right-4 rounded-full w-14 h-14 shadow-xl hover:shadow-2xl transition-all duration-300 animate-in fade-in zoom-in z-10"
          aria-label="最上部に戻る"
        >
          <ArrowUp className="w-6 h-6" />
        </Button>
      )}
    </div>
  )
}

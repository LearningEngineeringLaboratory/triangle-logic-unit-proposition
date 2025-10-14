'use client'

import { ProblemDetail } from '@/lib/problems'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
    shakeNext
}: ProblemStepDisplayProps) {
    const [shouldShakeNext, setShouldShakeNext] = useState(false)

    // 外部からのトリガーでshakeを発火（初回は発火させない）
    const prevShakeTokenRef = useRef(shakeNext)
    useEffect(() => {
        const prev = prevShakeTokenRef.current
        if (prev !== shakeNext) {
            setShouldShakeNext(true)
            prevShakeTokenRef.current = shakeNext
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shakeNext])
    const steps = [
        {
            number: 1,
            title: '導出命題を構成',
            content: 'この論証が導いている命題（導出命題）を構成しましょう。\n ２つのドロップダウンを選択してください。\n\n できたら、「答え合わせ」ボタンを押して、次のステップに進みましょう。',
            hint: '「したがって」や「よって」、「とすると」などの接続詞がある命題に着目しましょう。'
        },
        {
            number: 2,
            title: '三角ロジックの構成',
            content: 'この論証の前提となる命題（所与命題）を構成しましょう。\n\n 1. 前提のみで使用されている単位命題を選択\n 2. 論証が表す意味と同じになるように、リンクの向きを修正\n 3. 論証と同じ意味の三角ロジックを構成できない場合は「組み立て不可能」のトグルをONにする',
            hint: '🔄ボタンをクリックすると、リンクの向きを反転させることができます。'
        },
        {
            number: 3,
            title: '推論形式と妥当性の判別',
            content: '構成した三角ロジックをもとに、この論証の推論形式と妥当性を答えましょう。',
            hint: 'リンクの向きの変更がない場合は演繹推論、リンクの向きの変更が1箇所の場合は仮説推論、リンクの向きの変更が2箇所の場合、もしくは三角ロジックを構成できない場合は非形式推論です。'
        }
    ]

    const currentStepData = steps[currentStep - 1]

    return (
        <div className="flex flex-col h-full">
            {/* カルーセル形式のステップ表示 */}
            <div className="relative flex-1">
                {/* ステップ内容のカルーセル */}
                <div className="overflow-hidden h-full">
                    <div
                        className="flex transition-transform duration-300 ease-in-out h-full"
                        style={{ transform: `translateX(-${(currentStep - 1) * 100}%)` }}
                    >
                        {steps.map((step) => (
                            <div key={step.number} className="w-full flex-shrink-0 p-4 flex items-start">
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold text-foreground">
                                        Step {step.number}: {step.title}
                                    </h3>
                                    <p className="text-md leading-relaxed text-foreground whitespace-pre-line">
                                        {step.content}
                                    </p>
                                    {step.hint && (
                                        <div className="mt-6 rounded-md border border-border bg-muted/40 p-3">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="h-5 w-5 text-amber-600" aria-hidden="true" />
                                                <span className="text-sm font-medium text-amber-700">ヒント</span>
                                            </div>
                                            <p className="mt-2 text-sm leading-relaxed text-foreground whitespace-pre-line">{step.hint}</p>
                                        </div>
                                    )}

                                    {step.number === 3 && (
                                        <div className="mt-12">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-sm text-foreground">推論形式</span>
                                                    <Select value={inferenceTypeValue} onValueChange={onInferenceTypeChange ?? (() => {})}>
                                                        <SelectTrigger className={`w-full h-10 ${inferenceTypeValue ? '' : 'animate-glow-pulse rounded-md'}`}>
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
                                                    <span className="text-sm text-foreground">妥当性</span>
                                                    <Select value={validityValue} onValueChange={onValidityChange ?? (() => {})}>
                                                        <SelectTrigger className={`w-full h-10 ${validityValue ? '' : 'animate-glow-pulse rounded-md'}`}>
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
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ステップナビゲーション（最下部に固定） */}
            <div className="flex items-center justify-between mt-6 flex-shrink-0">
                <Button
                    variant="outline"
                    onClick={() => onStepChange(Math.max(1, currentStep - 1))}
                    disabled={currentStep <= 1}
                    className="min-w-[120px]"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    前のステップ
                </Button>

                {/* カルーセルインジケーター（中央配置） */}
                <div className="flex gap-3">
                    {steps.map((step) => (
                        <button
                            key={step.number}
                            onClick={() => onStepChange(step.number)}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                step.number === currentStep
                                    ? 'bg-primary scale-110'
                                    : 'bg-muted hover:bg-muted-foreground/50 hover:scale-105'
                            }`}
                            aria-label={`Step ${step.number}に移動`}
                        />
                    ))}
                </div>

                <Button
                    onClick={() => {
                        if (onRequestNext) {
                            const maybePromise = onRequestNext()
                            if (maybePromise instanceof Promise) {
                                maybePromise.catch(() => {})
                            }
                        } else {
                            onStepChange(Math.min(steps.length, currentStep + 1))
                        }
                    }}
                    onAnimationEnd={() => setShouldShakeNext(false)}
                    disabled={false}
                    className={`min-w-[120px] ${shouldShakeNext ? 'animate-shake-x' : ''}`}
                >
                    答え合わせ
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    )
}

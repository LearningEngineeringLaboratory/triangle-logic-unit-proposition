'use client'

import { ProblemDetail } from '@/lib/problems'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProblemStepDisplayProps {
    problem: ProblemDetail
    currentStep: number
    onStepChange: (step: number) => void
}

export function ProblemStepDisplay({
    problem,
    currentStep,
    onStepChange
}: ProblemStepDisplayProps) {
    const steps = [
        {
            number: 1,
            title: '導出命題を構成',
            content: '問題文から導出される命題の前件と後件を特定し、適切な単位命題を選択してください。'
        },
        {
            number: 2,
            title: '所与命題を構成',
            content: '問題文で与えられている前提条件を特定し、適切な単位命題を選択してください。また、リンクの向きを正しく設定してください。'
        },
        {
            number: 3,
            title: '推論形式と妥当性',
            content: '構成した三角ロジックをもとに、この論証の推論形式（演繹推論・仮説推論・非形式推論）と妥当性（妥当・非妥当）を判別してください。'
        }
    ]

    const currentStepData = steps[currentStep - 1]

    return (
        <div className="space-y-4">
            {/* カルーセル形式のステップ表示 */}
            <div className="relative">
                {/* ステップ内容のカルーセル */}
                <div className="overflow-hidden">
                    <div
                        className="flex transition-transform duration-300 ease-in-out"
                        style={{ transform: `translateX(-${(currentStep - 1) * 100}%)` }}
                    >
                        {steps.map((step) => (
                            <div key={step.number} className="w-full flex-shrink-0 p-4">
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold text-foreground">
                                        Step {step.number}: {step.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {step.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* ステップナビゲーション */}
            <div className="flex items-center justify-between mt-6">
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
                    onClick={() => onStepChange(Math.min(steps.length, currentStep + 1))}
                    disabled={currentStep >= steps.length}
                    className="min-w-[120px]"
                >
                    次のステップ
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    )
}

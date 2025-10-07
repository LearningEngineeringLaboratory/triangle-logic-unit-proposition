'use client'

import { ProblemDetail } from '@/lib/problems'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
      description: '前件と後件を選択して導出命題を構成してください',
      content: '問題文から導出される命題の前件と後件を特定し、適切な単位命題を選択してください。'
    },
    {
      number: 2,
      title: '所与命題を構成',
      description: '所与命題を選択し、リンクの向きを設定してください',
      content: '問題文で与えられている前提条件を特定し、適切な単位命題を選択してください。また、リンクの向きを正しく設定してください。'
    },
    {
      number: 3,
      title: '推論形式と妥当性',
      description: '推論形式と妥当性を選択してください',
      content: '構成した三角ロジックの推論形式（演繹・仮説・非形式）と妥当性（妥当・非妥当）を判断してください。'
    }
  ]

  const currentStepData = steps[currentStep - 1]

  return (
    <div className="space-y-4">
      {/* ステップ進捗インジケーター */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {steps.map((step) => (
            <div key={step.number} className="flex items-center">
              <Badge 
                variant={step.number <= currentStep ? "default" : "outline"}
                className="w-8 h-8 rounded-full flex items-center justify-center"
              >
                {step.number}
              </Badge>
              {step.number < steps.length && (
                <div className="w-8 h-0.5 bg-border mx-2" />
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          {currentStep} / {steps.length}
        </div>
      </div>

      {/* 現在のステップ内容 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Step {currentStep}: {currentStepData.title}
          </CardTitle>
          <CardDescription>
            {currentStepData.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">
            {currentStepData.content}
          </p>
        </CardContent>
      </Card>

      {/* ステップナビゲーション */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => onStepChange(Math.max(1, currentStep - 1))}
          disabled={currentStep <= 1}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          前のステップ
        </Button>
        <Button
          onClick={() => onStepChange(Math.min(steps.length, currentStep + 1))}
          disabled={currentStep >= steps.length}
        >
          次のステップ
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

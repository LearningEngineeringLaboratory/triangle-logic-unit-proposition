'use client'

import { useState, useCallback } from 'react'
import { ProblemDetail, StepsState, StepState } from '@/lib/types'

// ステップ管理用のカスタムフック
export function useProblemSteps(problem: ProblemDetail | null) {
  const totalSteps = problem?.total_steps || 3 // デフォルトは3ステップ
  const [currentStep, setCurrentStep] = useState(1)
  
  // ステップ状態の初期化
  const initializeSteps = useCallback((): StepsState => {
    const steps: StepsState = {}
    for (let i = 1; i <= totalSteps; i++) {
      steps[`step${i}`] = {
        isPassed: false,
        // 各ステップの初期値を設定
        ...(i === 1 && {
          antecedent: '',
          consequent: '',
        }),
        ...(i === 2 && {
          impossible: false,
          premise: '',
          linkDirections: {
            antecedentLink: true,
            consequentLink: true,
          },
        }),
        ...(i === 3 && {
          inferenceType: '',
          validity: null as boolean | null,
        }),
      }
    }
    return steps
  }, [totalSteps])

  const [steps, setSteps] = useState<StepsState>(initializeSteps)

  // ステップの更新
  const updateStep = useCallback((stepNumber: number, updates: Partial<StepState>) => {
    setSteps(prev => ({
      ...prev,
      [`step${stepNumber}`]: {
        ...prev[`step${stepNumber}`],
        ...updates,
      },
    }))
  }, [])

  // ステップの進行
  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, totalSteps])

  // ステップの戻る
  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  // 特定のステップに移動
  const goToStep = useCallback((stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= totalSteps) {
      setCurrentStep(stepNumber)
    }
  }, [totalSteps])

  // ステップのリセット
  const resetSteps = useCallback(() => {
    setSteps(initializeSteps())
    setCurrentStep(1)
  }, [initializeSteps])

  // 完了したステップ数の計算
  const completedSteps = Object.values(steps).filter(step => step.isPassed).length

  // 問題の完了状態
  const isProblemCompleted = completedSteps === totalSteps

  return {
    steps,
    currentStep,
    totalSteps,
    completedSteps,
    isProblemCompleted,
    updateStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    resetSteps,
    setSteps,
  }
}

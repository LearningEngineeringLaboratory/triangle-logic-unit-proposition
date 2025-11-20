'use client'

import { useState, useCallback } from 'react'
import { ProblemDetail, StepsState, Step1State, Step2State, Step3State, Step4State, Step5State } from '@/lib/types'

// ステップ管理用のカスタムフック
export function useProblemSteps(problem: ProblemDetail | null) {
  const totalSteps = problem?.total_steps || 3 // デフォルトは3ステップ
  const [currentStep, setCurrentStep] = useState(1)
  
  // ステップ状態の初期化
  const initializeSteps = useCallback((): StepsState => {
    const steps: StepsState = {}
    
    // Step1: 導出命題
    steps.step1 = {
        isPassed: false,
          antecedent: '',
          consequent: '',
    }
    
    // Step2: 所与命題とリンク
    steps.step2 = {
      isPassed: false,
      links: [],
    }
    
    // Step3: 推論形式と妥当性と検証価値
    steps.step3 = {
      isPassed: false,
          inferenceType: '',
      validity: null,
      verification: null,
    }
    
    // Step4: リンクの活性/非活性（5ステップの場合のみ）
    if (totalSteps >= 4) {
      steps.step4 = {
        isPassed: false,
        links: [],
      }
    }
    
    // Step5: 論証構成（5ステップの場合のみ）
    if (totalSteps >= 5) {
      steps.step5 = {
        isPassed: false,
        premises: [],
      }
    }
    
    return steps
  }, [totalSteps])

  const [steps, setSteps] = useState<StepsState>(initializeSteps)

  // ステップ状態の復元
  const restoreSteps = useCallback((restoredSteps: StepsState) => {
    setSteps(restoredSteps)
  }, [])

  // ステップの更新
  const updateStep = useCallback((stepNumber: number, updates: Partial<Step1State | Step2State | Step3State | Step4State | Step5State>) => {
    setSteps(prev => ({
      ...prev,
      [`step${stepNumber}` as keyof StepsState]: {
        ...prev[`step${stepNumber}` as keyof StepsState],
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
    restoreSteps,
    setCurrentStep,
  }
}

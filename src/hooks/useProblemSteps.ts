'use client'

import { useState, useCallback, useMemo } from 'react'
import { ProblemDetail, StepsState, Step1State, Step2State, Step3State, Step4State, Step5State } from '@/lib/types'

/**
 * Step3のinference_typeに基づいてtotalStepsを計算
 * - 演繹推論: 3ステップ（Step4、Step5は不要）
 * - 仮説推論/非形式推論: 5ステップ（Step4、Step5に進む）
 */
function calculateTotalSteps(steps: StepsState, defaultTotalSteps: number = 3): number {
  const step3 = steps.step3
  if (step3?.inferenceType === '演繹推論') {
    return 3
  }
  if (step3?.inferenceType === '仮説推論' || step3?.inferenceType === '非形式推論') {
    return 5
  }
  // Step3が未完了またはinference_typeが未設定の場合はデフォルト値を使用
  return defaultTotalSteps
}

// ステップ管理用のカスタムフック
export function useProblemSteps(problem: ProblemDetail | null) {
  const defaultTotalSteps = problem?.total_steps || 3 // デフォルトは3ステップ
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
    
    // Step4とStep5は、Step3のinference_typeに基づいて動的に追加される
    // 初期化時点では追加しない（Step3完了時に追加）
    
    return steps
  }, [])

  const [steps, setSteps] = useState<StepsState>(initializeSteps)

  // Step3のinference_typeに基づいてtotalStepsを動的に計算
  const totalSteps = useMemo(() => {
    return calculateTotalSteps(steps, defaultTotalSteps)
  }, [steps, defaultTotalSteps])

  // ステップ状態の復元
  const restoreSteps = useCallback((restoredSteps: StepsState) => {
    setSteps(restoredSteps)
  }, [])

  // ステップの更新
  const updateStep = useCallback((stepNumber: number, updates: Partial<Step1State | Step2State | Step3State | Step4State | Step5State>) => {
    setSteps(prev => {
      const newSteps = {
        ...prev,
        [`step${stepNumber}` as keyof StepsState]: {
          ...prev[`step${stepNumber}` as keyof StepsState],
          ...updates,
        },
      }
      
      // Step3が更新され、inference_typeが設定された場合、Step4とStep5を追加/削除
      if (stepNumber === 3 && 'inferenceType' in updates) {
        const step3 = newSteps.step3 as Step3State | undefined
        const inferenceType = step3?.inferenceType
        
        if (inferenceType === '演繹推論') {
          // 演繹推論の場合、Step4とStep5を削除
          delete newSteps.step4
          delete newSteps.step5
        } else if (inferenceType === '仮説推論' || inferenceType === '非形式推論') {
          // 仮説推論または非形式推論の場合、Step4とStep5を追加
          if (!newSteps.step4) {
            newSteps.step4 = {
              isPassed: false,
              links: [],
            }
          }
          if (!newSteps.step5) {
            newSteps.step5 = {
              isPassed: false,
              premises: [],
            }
          }
        }
      }
      
      return newSteps
    })
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

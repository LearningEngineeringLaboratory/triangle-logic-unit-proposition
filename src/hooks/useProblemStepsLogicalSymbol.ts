'use client'

import { useState, useCallback, useMemo } from 'react'
import { LogicalSymbolStepsState, LogicalSymbolStep1State, LogicalSymbolStep2State } from '@/lib/types'

/**
 * 比較実験用のステップ管理フック（2ステップ固定）
 */
export function useProblemStepsLogicalSymbol() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2 // 固定で2ステップ
  
  // ステップ状態の初期化
  const initializeSteps = useCallback((): LogicalSymbolStepsState => {
    return {
      step1: {
        isPassed: false,
        premise1: { antecedent: '', consequent: '' },
        premise2: { antecedent: '', consequent: '' },
        conclusion: { antecedent: '', consequent: '' },
      },
      step2: {
        isPassed: false,
        isLogical: null,
        isValid: null,
        inferenceType: '',
      },
    }
  }, [])

  const [steps, setSteps] = useState<LogicalSymbolStepsState>(initializeSteps)

  // ステップ状態の復元
  const restoreSteps = useCallback((restoredSteps: LogicalSymbolStepsState) => {
    setSteps(restoredSteps)
  }, [])

  // ステップの更新
  const updateStep = useCallback((stepNumber: 1 | 2, updates: Partial<LogicalSymbolStep1State | LogicalSymbolStep2State>) => {
    setSteps(prev => {
      const newSteps = {
        ...prev,
        [`step${stepNumber}` as keyof LogicalSymbolStepsState]: {
          ...prev[`step${stepNumber}` as keyof LogicalSymbolStepsState],
          ...updates,
        },
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
  const completedSteps = Object.values(steps).filter(step => step?.isPassed).length

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


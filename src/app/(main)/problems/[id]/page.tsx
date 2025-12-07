'use client'

import { getProblem, getNextProblemInSet, getCurrentProblemOrder, getProblemsBySet } from '@/lib/problems'
import { Problem, ProblemDetail, NodeValues, StepsState } from '@/lib/types'
import { notFound } from 'next/navigation'
import { ProblemStepDisplay } from '@/components/features/problem-detail/problem-step-display'
import { TriangleLogicFlow } from '@/components/features/triangle-logic/triangle-logic-flow'
import { ProblemDetailLayout } from '@/components/features/problem-detail/ProblemDetailLayout'
import { ProblemDisplay } from '@/components/features/problem-detail/ProblemDisplay'
import { ClearDialog } from '@/components/features/problem-detail/ClearDialog'
import { ProblemDetailFooter } from '@/components/features/problem-detail/ProblemDetailFooter'
import { FeedbackDrawer } from '@/components/ui/feedback-drawer'
import { Header } from '@/components/layout/Header'
import { Loading } from '@/components/ui/loading'
import { useProblemSteps } from '@/hooks/useProblemSteps'
import { useAnswerCheck } from '@/hooks/useAnswerCheck'
import { useProblemAttempt } from '@/hooks/useProblemAttempt'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { logStepNavigation } from '@/lib/logging'
import { useSession } from '@/hooks/useSession'

interface ProblemDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProblemDetailPage({ params }: ProblemDetailPageProps) {
  const router = useRouter()
  const { sessionInfo, isLoading: isSessionLoading } = useSession()
  const [problem, setProblem] = useState<ProblemDetail | null>(null)
  const [problemNumber, setProblemNumber] = useState(1)
  const [loading, setLoading] = useState(true)
  const [nextProblem, setNextProblem] = useState<Problem | null>(null)
  const [isLastProblem, setIsLastProblem] = useState(false)
  const [totalProblems, setTotalProblems] = useState<number>(0)
  const [isClearOpen, setIsClearOpen] = useState(false)
  const [feedbackVisible, setFeedbackVisible] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success')
  const [nodeValues, setNodeValues] = useState<NodeValues>({
    antecedent: '',
    consequent: '',
    premiseNodes: []
  })
  const previousStepRef = useRef<number>(1)

  // ノードの値を更新するコールバック
  const handleNodeValuesChange = useCallback((values: NodeValues) => {
    setNodeValues(values)
  }, [])

  // カスタムフックを使用してステップ管理を簡素化
  const {
    steps,
    currentStep,
    totalSteps,
    completedSteps,
    updateStep,
    goToNextStep,
  } = useProblemSteps(problem)

  // Attempt管理
  const { attemptId, updateCurrentStep, finishAttempt } = useProblemAttempt({
    problem,
    sessionInfo,
    isSessionLoading,
  })

  // 答え合わせロジック
  const { checkAnswer } = useAnswerCheck({
    problem: problem!,
    nodeValues,
    steps,
    currentStep,
    sessionInfo,
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const resolvedParams = await params
        const problemData = await getProblem(resolvedParams.id)

        if (!problemData) {
          notFound()
        }

        setProblem(problemData)
        // 選択された問題セットを取得
        const savedSetId = localStorage.getItem('selectedProblemSetId')
        if (savedSetId) {
          // 現在の問題の順番を取得
          const currentOrder = await getCurrentProblemOrder(savedSetId, resolvedParams.id)
          if (currentOrder !== null) {
            setProblemNumber(currentOrder)
          }

          // 問題セット内の全問題を取得して総数を計算
          const problemsInSet = await getProblemsBySet(savedSetId)
          setTotalProblems(problemsInSet.length)

          // 次の問題を取得
          const nextProblemData = await getNextProblemInSet(savedSetId, resolvedParams.id)
          if (nextProblemData) {
            setNextProblem(nextProblemData)
            setIsLastProblem(false)
          } else {
            setIsLastProblem(true)
          }
        } else {
          // 問題セットが選択されていない場合は、問題IDから推測
          const match = resolvedParams.id.match(/TLU-(\d+)-/)
          const order = match ? parseInt(match[1]) : 1
          setProblemNumber(order)
          setTotalProblems(0) // 問題セットが選択されていない場合は0
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params])


  // Step4に遷移したときに、Step2のリンクをStep4のリンクに初期化
  useEffect(() => {
    if (currentStep === 4 && problem && (problem.total_steps ?? 3) >= 4) {
      const step2Links = steps.step2?.links || []
      const step4Links = steps.step4?.links || []
      
      // Step4のリンクが空で、Step2のリンクがある場合、初期化
      // Step2のリンクをactive: trueとして初期化
      if (step4Links.length === 0 && step2Links.length > 0) {
        const initialStep4Links = step2Links.map(link => ({
          from: link.from,
          to: link.to,
          active: true, // 初期状態はすべてactive
        }))
        updateStep(4, { 
          ...steps.step4, 
          links: initialStep4Links,
          isPassed: steps.step4?.isPassed || false,
        })
      }
    }
  }, [currentStep, problem, steps.step2, steps.step4, updateStep])


  // ステップ遷移時にattemptsテーブルのcurrent_stepを更新
  useEffect(() => {
    if (currentStep !== previousStepRef.current && attemptId && updateCurrentStep) {
      updateCurrentStep(currentStep)
    }
  }, [currentStep, attemptId, updateCurrentStep])

  // ステップ遷移のログ記録
  useEffect(() => {
    if (currentStep !== previousStepRef.current && problem && attemptId) {
      logStepNavigation({
        fromStep: previousStepRef.current,
        toStep: currentStep,
        attemptId,
        problemId: problem.problem_id,
      }).catch(console.error)
      previousStepRef.current = currentStep
    }
  }, [currentStep, problem, attemptId])

  // セッションがない場合は問題選択画面にリダイレクト
  useEffect(() => {
    if (!isSessionLoading && !sessionInfo) {
      router.push('/problems')
    }
  }, [isSessionLoading, sessionInfo, router])

  // 次の問題への遷移
  const handleNextProblem = () => {
    if (nextProblem) {
      router.push(`/problems/${nextProblem.problem_id}`)
    }
  }

  // 問題一覧に戻る
  const handleBackToProblems = () => {
    router.push('/problems')
  }

  // セッションがない場合はリダイレクト中なので何も表示しない
  if (!isSessionLoading && !sessionInfo) {
    return null
  }

  if (loading || isSessionLoading) {
    return (
      <div className="h-screen overflow-hidden flex flex-col">
        <Header />
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="container mx-auto px-4 h-full flex items-center justify-center">
            <Loading />
          </div>
        </div>
      </div>
    )
  }

  if (!problem) {
    notFound()
  }

  // 答え合わせ処理
  const handleAnswerCheck = async () => {
    if (!problem) return

    const stepNumber = currentStep as 1 | 2 | 3 | 4 | 5
    const stepKey = `step${stepNumber}` as keyof typeof steps
    const currentStateFragment = steps[stepKey]
    
    if (!currentStateFragment) return

    const isCorrect = checkAnswer(stepNumber)

    if (isCorrect) {
      setFeedbackType('success')
      setFeedbackVisible(true)
      const updatedState = { ...currentStateFragment, isPassed: true }
      updateStep(stepNumber, updatedState)
      
      setTimeout(() => {
        setFeedbackVisible(false)
        if (stepNumber < totalSteps) {
          goToNextStep()
        } else {
          // 問題完了時はattemptを完了
          if (attemptId && sessionInfo) {
            finishAttempt(true)
          }
          setIsClearOpen(true)
        }
      }, 1500)
    } else {
      setFeedbackType('error')
      setFeedbackVisible(true)
      
      setTimeout(() => {
        setFeedbackVisible(false)
      }, 2000)
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      <Header 
        problemDisplay={<ProblemDisplay problem={problem} />}
      />
      
      {/* メインコンテンツ */}
      <ProblemDetailLayout slots={{
        header: null,
        leftPanel: (
          <div className="h-full overflow-y-scroll bg-transparent scrollbar-gutter-stable">
            <ProblemStepDisplay
                problem={problem}
                currentStep={currentStep}
                inferenceTypeValue={steps.step3?.inferenceType || ''}
                validityValue={steps.step3?.validity === null ? '' : (steps.step3?.validity ? '妥当' : '非妥当')}
                verificationValue={steps.step3?.verification === null ? '' : (steps.step3?.verification ? '高い' : '低い')}
                onInferenceTypeChange={(value) => updateStep(3, { ...steps.step3, inferenceType: value })}
                onValidityChange={(value) => updateStep(3, { ...steps.step3, validity: value === '妥当' })}
                onVerificationChange={(value) => updateStep(3, { ...steps.step3, verification: value === '高い' })}
                step5Premises={steps.step5?.premises || []}
                onStep5PremiseChange={(index, field, value) => {
                  const currentPremises = steps.step5?.premises || []
                  // 配列の長さを2に保つ
                  const newPremises = [...currentPremises]
                  // インデックスが範囲外の場合は空オブジェクトで初期化
                  if (!newPremises[index]) {
                    newPremises[index] = { antecedent: '', consequent: '' }
                  }
                  newPremises[index] = {
                    ...newPremises[index],
                    [field]: value,
                  }
                  updateStep(5, { ...steps.step5, premises: newPremises })
                }}
                stepsState={steps}
                attemptId={attemptId}
                sessionInfo={sessionInfo}
                nodeValues={nodeValues}
              />
          </div>
        ),
        rightPanel: (
          <TriangleLogicFlow
            options={problem.options ?? ['選択肢が設定されていません']}
            currentStep={currentStep}
            antecedentValue={steps.step1?.antecedent || ''}
            consequentValue={steps.step1?.consequent || ''}
            onAntecedentChange={(value) => updateStep(1, { ...steps.step1, antecedent: value })}
            onConsequentChange={(value) => updateStep(1, { ...steps.step1, consequent: value })}
            links={steps.step2?.links || []}
            onLinksChange={(links) => updateStep(2, { ...steps.step2, links })}
            activeLinks={steps.step4?.links || []}
            onActiveLinksChange={(links) => updateStep(4, { ...steps.step4, links })}
            onGetNodeValues={handleNodeValuesChange}
            attemptId={attemptId}
            problemId={problem?.problem_id}
            sessionInfo={sessionInfo}
            steps={steps as StepsState}
          />
        ),
        footer: (
          <ProblemDetailFooter
            problemNumber={problemNumber}
            totalProblems={totalProblems}
            completedSteps={completedSteps}
            totalSteps={totalSteps}
            onAnswerCheck={handleAnswerCheck}
          />
        )
      }} />
      
      <ClearDialog
        isOpen={isClearOpen}
        onOpenChange={setIsClearOpen}
        isLastProblem={isLastProblem}
        onBackToProblems={handleBackToProblems}
        onNextProblem={handleNextProblem}
        nextProblem={nextProblem}
      />
      
      <FeedbackDrawer
        open={feedbackVisible}
        onOpenChange={setFeedbackVisible}
        variant={feedbackType}
        title={feedbackType === 'success' ? '正解です！' : 'もう一度考えてみましょう'}
      />
    </div>
  )
}

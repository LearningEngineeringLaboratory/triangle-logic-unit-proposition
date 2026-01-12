'use client'

import { getProblem, getNextProblemInSet, getCurrentProblemOrder, getProblemsBySet } from '@/lib/problems'
import { Problem, ProblemDetail } from '@/lib/types'
import { notFound } from 'next/navigation'
import { LogicalSymbolLayout } from '@/components/features/logical-symbol/LogicalSymbolLayout'
import { ProblemDisplay } from '@/components/features/problem-detail/ProblemDisplay'
import { LogicalSymbolClearDialog } from '@/components/features/logical-symbol/LogicalSymbolClearDialog'
import { LogicalSymbolDetailFooter } from '@/components/features/logical-symbol/LogicalSymbolDetailFooter'
import { FeedbackDrawer } from '@/components/ui/feedback-drawer'
import { Header } from '@/components/layout/Header'
import { Loading } from '@/components/ui/loading'
import { useProblemStepsLogicalSymbol } from '@/hooks/useProblemStepsLogicalSymbol'
import { useProblemAttempt } from '@/hooks/useProblemAttempt'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { logStepNavigationLogicalSymbol, logCheckAnswerLogicalSymbol, logStepCompletedLogicalSymbol } from '@/lib/logging-logical-symbol'
import { useSession } from '@/hooks/useSession'
import { Step1Form } from '@/components/features/logical-symbol/Step1Form'
import { Step2Form } from '@/components/features/logical-symbol/Step2Form'
import { checkAnswerLogicalSymbol } from '@/lib/answer-validation-logical-symbol'
import { LogicalSymbolStepsState } from '@/lib/types'
import { StepHint } from '@/components/features/problem-detail/step-components/StepHint'
import { StepTermDefinition } from '@/components/features/problem-detail/step-components/StepTermDefinition'

interface LogicalSymbolPageProps {
  params: Promise<{
    id: string
  }>
}

export default function LogicalSymbolPage({ params }: LogicalSymbolPageProps) {
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
  const [completedProblemsCount, setCompletedProblemsCount] = useState(0)
  const [isProblemCompleted, setIsProblemCompleted] = useState(false)
  const previousStepRef = useRef<number>(1)

  // ステップ管理
  const {
    steps,
    currentStep,
    totalSteps,
    completedSteps,
    updateStep,
    goToNextStep,
    restoreSteps,
    setCurrentStep,
  } = useProblemStepsLogicalSymbol()

  // Attempt管理
  const { attemptId, updateCurrentStep, finishAttempt } = useProblemAttempt({
    problem,
    sessionInfo,
    isSessionLoading,
    isCompleted: isProblemCompleted,
    systemType: 'logical_symbol',
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
        const savedSetId = localStorage.getItem('selectedProblemSetId')
        if (savedSetId) {
          const currentOrder = await getCurrentProblemOrder(savedSetId, resolvedParams.id)
          if (currentOrder !== null) {
            setProblemNumber(currentOrder)
          }

          const problemsInSet = await getProblemsBySet(savedSetId)
          setTotalProblems(problemsInSet.length)

          const nextProblemData = await getNextProblemInSet(savedSetId, resolvedParams.id)
          if (nextProblemData) {
            setNextProblem(nextProblemData)
            setIsLastProblem(false)
          } else {
            setIsLastProblem(true)
          }
        } else {
          const match = resolvedParams.id.match(/TLU-(\d+)-/)
          const order = match ? parseInt(match[1]) : 1
          setProblemNumber(order)
          setTotalProblems(0)
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

  // クリア済み問題のチェック（problemとsessionInfoが利用可能になったら実行）
  useEffect(() => {
    async function checkCompletionStatus() {
      if (!problem || !sessionInfo || loading || isSessionLoading) {
        return
      }

      try {
        // 選択されている問題セットIDを取得
        const savedSetId = localStorage.getItem('selectedProblemSetId')
        
        // APIリクエストURLを構築（setIdが存在する場合はクエリパラメータに追加）
        const url = savedSetId 
          ? `/api/attempt/completion-status?setId=${encodeURIComponent(savedSetId)}&systemType=logical_symbol`
          : '/api/attempt/completion-status?systemType=logical_symbol'
        
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        const data = await res.json()
        
        if (data.success && data.data) {
          const completedProblemIds = Array.isArray(data.data.completedProblemIds) 
            ? data.data.completedProblemIds as string[]
            : []
          
          // 完了した問題数を設定
          const completedCount = typeof data.data.completedCount === 'number' 
            ? data.data.completedCount 
            : completedProblemIds.length
          setCompletedProblemsCount(completedCount)
          
          if (completedProblemIds.includes(problem.problem_id)) {
            setIsProblemCompleted(true)
            router.push('/logical-symbol')
          }
        }
      } catch (err) {
        console.error('Error checking completion status:', err)
      }
    }

    checkCompletionStatus()
  }, [problem, sessionInfo, loading, isSessionLoading, router])

  // ステップ遷移時にattemptsテーブルのcurrent_stepを更新
  useEffect(() => {
    if (currentStep !== previousStepRef.current && attemptId && updateCurrentStep) {
      updateCurrentStep(currentStep)
    }
  }, [currentStep, attemptId, updateCurrentStep])

  // ステップ遷移のログ記録
  useEffect(() => {
    if (currentStep !== previousStepRef.current && problem && attemptId) {
      logStepNavigationLogicalSymbol({
        fromStep: previousStepRef.current,
        toStep: currentStep,
        attemptId,
        problemId: problem.problem_id,
        sessionId: sessionInfo?.sessionId,
        userId: sessionInfo?.userId,
      }).catch(console.error)
      previousStepRef.current = currentStep
    }
  }, [currentStep, problem, attemptId, sessionInfo])

  // セッションがない場合は問題選択画面にリダイレクト
  useEffect(() => {
    if (!isSessionLoading && !sessionInfo) {
      router.push('/logical-symbol')
    }
  }, [isSessionLoading, sessionInfo, router])

  const handleNextProblem = () => {
    if (nextProblem) {
      router.push(`/logical-symbol/${nextProblem.problem_id}`)
    }
  }

  const handleBackToProblems = () => {
    router.push('/logical-symbol')
  }

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

    const stepNumber = currentStep as 1 | 2
    const currentStateFragment = steps[`step${stepNumber}` as keyof LogicalSymbolStepsState]
    
    if (!currentStateFragment) return

    // 答え合わせボタンクリックのログ記録
    if (sessionInfo && attemptId) {
      await logCheckAnswerLogicalSymbol({
        step: stepNumber,
        attemptId,
        problemId: problem.problem_id,
        sessionId: sessionInfo.sessionId,
        userId: sessionInfo.userId,
        state: steps,
      }).catch(console.error)
    }

    const isCorrect = checkAnswerLogicalSymbol(stepNumber, steps, problem)

    if (isCorrect) {
      setFeedbackType('success')
      setFeedbackVisible(true)
      const updatedState = { ...currentStateFragment, isPassed: true }
      
      updateStep(stepNumber, updatedState)

      // ステップ完了のログ記録
      if (sessionInfo && attemptId) {
        await logStepCompletedLogicalSymbol({
          step: stepNumber,
          isCorrect: true,
          attemptId,
          problemId: problem.problem_id,
          sessionId: sessionInfo.sessionId,
          userId: sessionInfo.userId,
          state: { ...steps, [`step${stepNumber}`]: updatedState },
        }).catch(console.error)
      }
      
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

      // ステップ完了のログ記録（不正解）
      if (sessionInfo && attemptId) {
        await logStepCompletedLogicalSymbol({
          step: stepNumber,
          isCorrect: false,
          attemptId,
          problemId: problem.problem_id,
          sessionId: sessionInfo.sessionId,
          userId: sessionInfo.userId,
          state: steps,
        }).catch(console.error)
      }
      
      setTimeout(() => {
        setFeedbackVisible(false)
      }, 2000)
    }
  }

  // 現在のステップの状態を取得（ログ記録用）
  const getCurrentState = () => {
    return steps
  }

  return (
    <div 
      className="fixed inset-0 h-dvh overflow-hidden bg-background flex flex-col touch-action-none"
      style={{ overscrollBehavior: 'none' }}
    >
      <Header 
        problemDisplay={<ProblemDisplay problem={problem} />}
      />
      
      <LogicalSymbolLayout slots={{
        header: null,
        content: (
          <div className="space-y-8">
            {/* ステップ表示 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                Step {currentStep}: {currentStep === 1 ? '所与命題と導出命題の構成' : '推論形式と妥当性の判別'}
              </h2>
              
              {currentStep === 1 && (
                <div className="space-y-4">
                  <p className="text-base leading-relaxed text-foreground">
                    この論証の所与命題と導出命題を構成しましょう。
                  </p>
                  <Step1Form
                    problem={problem}
                    step1State={steps.step1!}
                    onStep1Change={(updates) => updateStep(1, updates)}
                    attemptId={attemptId}
                    sessionInfo={sessionInfo}
                    currentState={getCurrentState()}
                  />
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="space-y-4">
                  <p className="text-base leading-relaxed text-foreground">
                    Step1で答えた内容をもとに、以下の問題に答えましょう。
                  </p>
                  <Step2Form
                    problem={problem}
                    step1State={steps.step1!}
                    step2State={steps.step2!}
                    onStep2Change={(updates) => updateStep(2, updates)}
                    attemptId={attemptId}
                    sessionInfo={sessionInfo}
                    currentState={getCurrentState()}
                  />
                </div>
              )}
            </div>
          </div>
        ),
        hints: (
          <div className="space-y-4">
            {currentStep === 1 && (
              <>
                <StepTermDefinition>
                  <strong>所与命題</strong>：論証の前提となる命題。導出命題ではない命題のこと。<br />
                  <strong>導出命題</strong>：論証において前提から導かれる命題。「したがって」などの接続詞があり、結論となる命題。
                </StepTermDefinition>
                <StepHint>
                「PであるならばQである。したがって、PであるならばRである。なぜならば、QであるならばRであるからである。」という論証の場合、所与命題は「PであるならばQである」と「QであるならばRである」となり、導出命題は「PであるならばRである」となります。
                </StepHint>
              </>
            )}
            {currentStep === 2 && (
              <>
                <StepTermDefinition>
                  <strong>演繹推論</strong>：推論として論理的であり、さらに、所与命題を正しいと仮定したときに導出命題が必ず正しいといえる推論のこと。<br />
                  <strong>仮説推論</strong>：推論として論理的であるが、所与命題を正しいと仮定しても導出命題が必ず正しいとはいえない推論のこと。<br />
                  <strong>非形式推論</strong>：推論として論理的ではない推論。推論として論理的ではない場合、所与命題を正しいと仮定しても導出命題が必ず正しいといえません。
                  
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b-2 border-primary/30">
                          <th className="px-3 py-2 text-left font-semibold text-foreground bg-primary/5">推論形式</th>
                          <th className="px-3 py-2 text-center font-semibold text-foreground bg-primary/5">所与命題</th>
                          <th className="px-3 py-2 text-center font-semibold text-foreground bg-primary/5">導出命題</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-primary/20">
                          <td className="px-3 py-2 font-medium text-foreground">演繹推論</td>
                          <td className="px-3 py-2 text-center text-foreground">X→Y, Y→Z</td>
                          <td className="px-3 py-2 text-center text-foreground">X→Z</td>
                        </tr>
                        <tr className="border-b border-primary/20">
                          <td className="px-3 py-2 font-medium text-foreground">仮説推論(1)</td>
                          <td className="px-3 py-2 text-center text-foreground">X→Z, Y→Z</td>
                          <td className="px-3 py-2 text-center text-foreground">X→Y</td>
                        </tr>
                        <tr className="border-b border-primary/20">
                          <td className="px-3 py-2 font-medium text-foreground">仮説推論(2)</td>
                          <td className="px-3 py-2 text-center text-foreground">X→Y, X→Z</td>
                          <td className="px-3 py-2 text-center text-foreground">Y→Z</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-medium text-foreground">非形式推論</td>
                          <td className="px-3 py-2 text-center text-foreground">その他</td>
                          <td className="px-3 py-2 text-center text-foreground">その他</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </StepTermDefinition>
              </>
            )}
          </div>
        ),
        footer: (
          <LogicalSymbolDetailFooter
            problemNumber={problemNumber}
            totalProblems={totalProblems}
            completedProblems={completedProblemsCount}
            onAnswerCheck={handleAnswerCheck}
          />
        )
      }} />
      
      <LogicalSymbolClearDialog
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


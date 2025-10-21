'use client'

import { getProblem, getProblemSets, getNextProblemInSet, getCurrentProblemOrder } from '@/lib/problems'
import { ProblemSet, ProblemDetail } from '@/lib/types'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ProblemStepDisplay } from '@/components/problem-step-display'
import { TriangleLogicDisplay } from '@/components/triangle-logic/triangle-logic-display'
import { ProblemDetailLayout } from '@/components/problem-detail/ProblemDetailLayout'
import { ProblemDisplay } from '@/components/problem-detail/ProblemDisplay'
import { ClearDialog } from '@/components/problem-detail/ClearDialog'
import { FeedbackDrawer } from '@/components/ui/feedback-drawer'
import { useProblemSteps } from '@/hooks/useProblemSteps'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { mapUiToDbState, isStepCorrect, logClientCheck } from '@/lib/utils'

interface ProblemDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProblemDetailPage({ params }: ProblemDetailPageProps) {
  const router = useRouter()
  const [problem, setProblem] = useState<ProblemDetail | null>(null)
  const [problemSets, setProblemSets] = useState<ProblemSet[]>([])
  const [problemNumber, setProblemNumber] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedProblemSetId, setSelectedProblemSetId] = useState<string | null>(null)
  const [nextProblem, setNextProblem] = useState<any>(null)
  const [isLastProblem, setIsLastProblem] = useState(false)
  const [isClearOpen, setIsClearOpen] = useState(false)
  const [shakeToken, setShakeToken] = useState(0)
  const [feedbackVisible, setFeedbackVisible] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success')

  // カスタムフックを使用してステップ管理を簡素化
  const {
    steps,
    currentStep,
    totalSteps,
    updateStep,
    goToNextStep,
    goToStep,
  } = useProblemSteps(problem)

  useEffect(() => {
    async function fetchData() {
      try {
        const resolvedParams = await params
        const [problemData, problemSetsData] = await Promise.all([
          getProblem(resolvedParams.id),
          getProblemSets()
        ])

        if (!problemData) {
          notFound()
        }

        setProblem(problemData)
        setProblemSets(problemSetsData)

        // 選択された問題セットを取得
        const savedSetId = localStorage.getItem('selectedProblemSetId')
        if (savedSetId) {
          setSelectedProblemSetId(savedSetId)

          // 現在の問題の順番を取得
          const currentOrder = await getCurrentProblemOrder(savedSetId, resolvedParams.id)
          if (currentOrder !== null) {
            setProblemNumber(currentOrder)
          }

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  if (!problem) {
    notFound()
  }

  // 答え合わせ処理
  const handleAnswerCheck = async () => {
    if (!problem) return

    const stepNumber = currentStep as 1 | 2 | 3
    const uiFragment = steps[`step${stepNumber}` as keyof typeof steps]
    const dbState = mapUiToDbState(steps as any)
    const dbFragment = dbState[`step${stepNumber}` as 'step1' | 'step2' | 'step3']
    const isCorrect = isStepCorrect(problem.correct_answers, stepNumber, dbFragment)

    console.log(`[check-step][client] step=${stepNumber} isCorrect=${isCorrect ? 'correct' : 'incorrect'}`)

    // ログ送信（研究用）
    logClientCheck({
      problemId: problem.problem_id,
      step: stepNumber,
      isCorrect,
      payload: dbFragment,
    })

    if (isCorrect) {
      setFeedbackType('success')
      setFeedbackVisible(true)
      updateStep(stepNumber, { ...uiFragment, isPassed: true })
      
      setTimeout(() => {
        setFeedbackVisible(false)
        if (stepNumber < totalSteps) {
          goToNextStep()
        } else {
          setIsClearOpen(true)
        }
      }, 1500)
    } else {
      setFeedbackType('error')
      setFeedbackVisible(true)
      setShakeToken((t) => t + 1)
      
      setTimeout(() => {
        setFeedbackVisible(false)
      }, 2000)
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-background">
      {/* メインコンテンツ */}
      <ProblemDetailLayout problem={problem} problemNumber={problemNumber} slots={{
        header: (
          <>
            <h3 className="text-xl font-semibold tracking-tight mb-3">問題{problemNumber}</h3>
            <ProblemDisplay problem={problem} />
          </>
        ),
        leftPanel: (
          <ProblemStepDisplay
            problem={problem}
            currentStep={currentStep}
            onStepChange={goToStep}
            shakeNext={shakeToken}
            inferenceTypeValue={steps.step3?.inferenceType || ''}
            validityValue={steps.step3?.validity === null ? '' : (steps.step3?.validity ? '妥当' : '非妥当')}
            onInferenceTypeChange={(value) => updateStep(3, { ...steps.step3, inferenceType: value })}
            onValidityChange={(value) => updateStep(3, { ...steps.step3, validity: value === '妥当' })}
            onRequestNext={handleAnswerCheck}
            stepsState={steps}
          />
        ),
        rightPanel: (
          <TriangleLogicDisplay
            options={problem.options ?? ['選択肢が設定されていません']}
            onAntecedentChange={(value) => updateStep(1, { ...steps.step1, antecedent: value })}
            onConsequentChange={(value) => updateStep(1, { ...steps.step1, consequent: value })}
            onPremiseChange={(value) => updateStep(2, { ...steps.step2, premise: value })}
            onLinkDirectionToggle={(linkType) => {
              const currentDirections = steps.step2?.linkDirections || { antecedentLink: true, consequentLink: true }
              updateStep(2, {
                ...steps.step2,
                linkDirections: {
                  ...currentDirections,
                  [linkType === 'antecedent' ? 'antecedentLink' : 'consequentLink']:
                    !currentDirections[linkType === 'antecedent' ? 'antecedentLink' : 'consequentLink']
                }
              })
            }}
            onInferenceTypeChange={(value) => updateStep(3, { ...steps.step3, inferenceType: value })}
            onValidityChange={(value) => updateStep(3, { ...steps.step3, validity: value === '妥当' })}
            inferenceTypeValue={steps.step3?.inferenceType || ''}
            validityValue={steps.step3?.validity === null ? '' : (steps.step3?.validity ? '妥当' : '非妥当')}
            antecedentValue={steps.step1?.antecedent || ''}
            consequentValue={steps.step1?.consequent || ''}
            premiseValue={steps.step2?.premise || ''}
            antecedentLinkDirection={steps.step2?.linkDirections?.antecedentLink ?? true}
            consequentLinkDirection={steps.step2?.linkDirections?.consequentLink ?? true}
            currentStep={currentStep}
            impossibleValue={steps.step2?.impossible || false}
            onImpossibleToggle={(value) => updateStep(2, { ...steps.step2, impossible: value })}
          />
        ),
        footer: (
          <div className="w-full flex items-center justify-between">
            <Link href="/problems">
              <Button variant="outline" size="default">
                <ArrowLeft className="w-5 h-5 mr-2" />
                問題一覧に戻る
              </Button>
            </Link>
            <Button
              onClick={() => {
                const maybePromise = handleAnswerCheck()
                if (maybePromise instanceof Promise) maybePromise.catch(() => { })
              }}
              size="lg"
              className="min-w-[200px]"
            >
              答え合わせ
            </Button>
          </div>
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
        description={
          feedbackType === 'success' 
            ? '次のステップに進みましょう' 
            : '前件と後件の関係を確認してください'
        }
      />
    </div>
  )
}

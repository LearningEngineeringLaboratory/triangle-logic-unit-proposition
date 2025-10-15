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
import { useProblemSteps } from '@/hooks/useProblemSteps'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { mapUiToDbState, isStepCorrect, logClientCheck } from '@/lib/utils'
import { toast } from 'sonner'

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
      toast.success('正解です！')
      updateStep(stepNumber, { ...uiFragment, isPassed: true })
      if (stepNumber < totalSteps) {
        goToNextStep()
      } else {
        setIsClearOpen(true)
      }
    } else {
      toast.error('不正解...')
      setShakeToken((t) => t + 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/problems">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                問題一覧に戻る
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <ProblemDetailLayout problem={problem} problemNumber={problemNumber}>
        {{
          leftPanel: (
            <>
              <ProblemDisplay problem={problem} />
              <div className="flex-1 flex flex-col">
                <ClearDialog
                  isOpen={isClearOpen}
                  onOpenChange={setIsClearOpen}
                  isLastProblem={isLastProblem}
                  onBackToProblems={handleBackToProblems}
                  onNextProblem={handleNextProblem}
                  nextProblem={nextProblem}
                />
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
              </div>
            </>
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
          )
        }}
      </ProblemDetailLayout>
    </div>
  )
}

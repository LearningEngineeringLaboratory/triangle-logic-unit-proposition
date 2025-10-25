'use client'

import { getProblem, getProblemSets, getNextProblemInSet, getCurrentProblemOrder } from '@/lib/problems'
import { ProblemSet, ProblemDetail } from '@/lib/types'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ProblemStepDisplay } from '@/components/features/problem-detail/problem-step-display'
import { TriangleLogicFlow } from '@/components/features/triangle-logic/triangle-logic-flow'
import { ProblemDetailLayout } from '@/components/features/problem-detail/ProblemDetailLayout'
import { ProblemDisplay } from '@/components/features/problem-detail/ProblemDisplay'
import { ClearDialog } from '@/components/features/problem-detail/ClearDialog'
import { FeedbackDrawer } from '@/components/ui/feedback-drawer'
import { Header } from '@/components/layout/Header'
import { useProblemSteps } from '@/hooks/useProblemSteps'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { logClientCheck } from '@/lib/utils'

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
      <div className="h-screen overflow-hidden flex flex-col">
        <Header title="読み込み中..." />
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="container mx-auto px-4 h-full flex flex-col gap-6">
            {/* ヘッダー部分のスケルトン */}
            <div className="pt-6 flex-shrink-0">
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>

            {/* 中央部分のスケルトン */}
            <div className="flex-1 min-h-0 grid lg:grid-cols-[1fr_minmax(0,_560px)] gap-8 overflow-hidden">
              {/* 左パネルのスケルトン */}
              <div className="space-y-4">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            </div>

            {/* フッターのスケルトン */}
            <div className="border-t-2 border-border flex items-center justify-between py-4 flex-shrink-0">
              <Skeleton className="h-10 w-40 rounded-xl" />
              <Skeleton className="h-14 w-[200px] rounded-xl" />
            </div>
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
    const uiFragment = steps[stepKey]
    
    if (!uiFragment) return

    // 新しいステップ構造に合わせた正誤判定
    let isCorrect = false
    
    switch (stepNumber) {
      case 1:
        isCorrect = uiFragment.antecedent === problem.correct_answers.step1?.antecedent &&
                   uiFragment.consequent === problem.correct_answers.step1?.consequent
        break
      case 2:
        // Step2の正誤判定（リンク構造の比較）
        const correctLinks = problem.correct_answers.step2?.links || []
        const correctPremise = problem.correct_answers.step2?.premise
        
        // premiseの比較（データベースの"Qである"は実際の選択肢に置き換える）
        let premiseMatch = false
        if (correctPremise === "Qである") {
          // "Qである"は実際の選択肢に置き換える（問題に応じて調整）
          premiseMatch = uiFragment.premise === "哺乳類である"
        } else {
          premiseMatch = uiFragment.premise === correctPremise
        }
        
        // linksの比較（fromとtoの順序を考慮）
        const normalizeLinks = (links: any[]) => {
          return links.map(link => ({
            from: link.from,
            to: link.to
          })).sort((a, b) => {
            if (a.from !== b.from) return a.from.localeCompare(b.from)
            return a.to.localeCompare(b.to)
          })
        }
        
        const uiLinks = normalizeLinks(uiFragment.links || [])
        const correctLinksNormalized = normalizeLinks(correctLinks)
        
        isCorrect = premiseMatch && 
                   JSON.stringify(uiLinks) === JSON.stringify(correctLinksNormalized)
        break
      case 3:
        isCorrect = uiFragment.inferenceType === problem.correct_answers.step3?.inference_type &&
                   uiFragment.validity === problem.correct_answers.step3?.validity
        break
      case 4:
        // Step4の正誤判定（活性/非活性リンクの比較）
        const correctActiveLinks = problem.correct_answers.step4?.links || []
        isCorrect = JSON.stringify(uiFragment.links?.sort()) === JSON.stringify(correctActiveLinks.sort())
        break
      case 5:
        // Step5の正誤判定（論証構成の比較）
        const correctPremises = problem.correct_answers.step5?.premises || []
        isCorrect = JSON.stringify(uiFragment.premises?.sort()) === JSON.stringify(correctPremises.sort())
        break
    }

    console.log(`[check-step][client] step=${stepNumber} isCorrect=${isCorrect ? 'correct' : 'incorrect'}`)

    // ログ送信（研究用）
    logClientCheck({
      problemId: problem.problem_id,
      step: stepNumber as 1 | 2 | 3,
      isCorrect,
      payload: uiFragment as any,
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
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      <Header title={`問題${problemNumber}`} />
      
      {/* メインコンテンツ */}
      <ProblemDetailLayout problem={problem} problemNumber={problemNumber} slots={{
        header: (
          <ProblemDisplay problem={problem} />
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
            stepsState={steps as any}
          />
        ),
        rightPanel: (
          <TriangleLogicFlow
            options={problem.options ?? ['選択肢が設定されていません']}
            currentStep={currentStep}
            antecedentValue={steps.step1?.antecedent || ''}
            consequentValue={steps.step1?.consequent || ''}
            onAntecedentChange={(value) => updateStep(1, { ...steps.step1, antecedent: value })}
            onConsequentChange={(value) => updateStep(1, { ...steps.step1, consequent: value })}
            premiseValue={steps.step2?.premise || ''}
            onPremiseChange={(value) => updateStep(2, { ...steps.step2, premise: value })}
            links={steps.step2?.links || []}
            onLinksChange={(links) => updateStep(2, { ...steps.step2, links })}
            activeLinks={steps.step4?.links || []}
            onActiveLinksChange={(links) => updateStep(4, { ...steps.step4, links })}
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
      />
    </div>
  )
}

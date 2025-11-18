'use client'

import { getProblem, getNextProblemInSet, getCurrentProblemOrder, getProblemsBySet } from '@/lib/problems'
import { Problem, ProblemDetail, NodeValues, Step2State, Step4State, Step5State, TriangleLink, ActiveTriangleLink, PremiseSelection } from '@/lib/types'
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
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { logClientCheck } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

interface ProblemDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProblemDetailPage({ params }: ProblemDetailPageProps) {
  const router = useRouter()
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
        <Header />
        
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
    const currentStateFragment = steps[stepKey]
    
    if (!currentStateFragment) return

    // 新しいステップ構造に合わせた正誤判定
    let isCorrect = false
    
    const resolveNodeValue = (nodeId: string): string => {
      if (nodeId === 'antecedent') return nodeValues.antecedent
      if (nodeId === 'consequent') return nodeValues.consequent
      if (nodeId.startsWith('premise-')) {
        const premiseNode = nodeValues.premiseNodes.find(node => node.id === nodeId)
        return premiseNode?.value ?? ''
      }
      return nodeId
    }

    switch (stepNumber) {
      case 1: {
        const step1State = steps.step1
        if (!step1State) break
        isCorrect = step1State.antecedent === problem.correct_answers.step1?.antecedent &&
                   step1State.consequent === problem.correct_answers.step1?.consequent
        break
      }
      case 2: {
        const rawStep2 = problem.correct_answers.step2
        const correctLinks: TriangleLink[] = Array.isArray(rawStep2)
          ? rawStep2
          : rawStep2?.links ?? []

        const step2State = steps.step2 as Step2State | undefined
        const uiLinks = step2State?.links ?? []

        const uiLinksWithValues = uiLinks.map(link => ({
          from: resolveNodeValue(link.from),
          to: resolveNodeValue(link.to)
        }))

        const linksMatch = correctLinks.every(correctLink =>
          uiLinksWithValues.some(uiLink =>
            uiLink.from === correctLink.from && uiLink.to === correctLink.to
          )
        ) && correctLinks.length === uiLinksWithValues.length

        console.log(`[debug-step2] correctLinks:`, correctLinks)
        console.log(`[debug-step2] uiLinks:`, uiLinks)
        console.log(`[debug-step2] uiLinksWithValues:`, uiLinksWithValues)
        console.log(`[debug-step2] linksMatch:`, linksMatch)

        isCorrect = linksMatch
        break
      }
      case 3: {
        const step3State = steps.step3
        if (!step3State) break
        const expectedStep3 = problem.correct_answers.step3
        if (!expectedStep3) break
        const verificationMatches =
          expectedStep3.verification === undefined ||
          step3State.verification === expectedStep3.verification
        isCorrect =
          step3State.inferenceType === expectedStep3.inference_type &&
          step3State.validity === expectedStep3.validity &&
          verificationMatches
        break
      }
      case 4: {
        // Step4の正誤判定（活性/非活性リンクの比較）
        const rawStep4 = problem.correct_answers.step4
        const correctActiveLinks4: ActiveTriangleLink[] = Array.isArray(rawStep4)
          ? rawStep4
          : rawStep4?.links ?? []
        const step4State = steps.step4 as Step4State | undefined
        
        console.log(`[debug-step4] correctActiveLinks4:`, correctActiveLinks4)
        console.log(`[debug-step4] uiFragment:`, step4State)
        
        // UIリンクを実際の値に変換
        const uiLinks4 = step4State?.links ?? []
        
        // active: trueのリンクのみを抽出
        const activeUiLinks4 = uiLinks4.filter(link => link.active !== false)

        const uiLinksWithValues4 = activeUiLinks4.map(link => ({
          from: resolveNodeValue(link.from),
          to: resolveNodeValue(link.to),
        }))
        
        // 正解リンクとUIリンクを比較（activeのみが正解）
        const correctLinksActiveOnly4 = correctActiveLinks4.filter(link => link.active)
        
        // リンクの存在と数を比較
        const linksMatch4 = correctLinksActiveOnly4.every(correctLink => 
          uiLinksWithValues4.some(uiLink => 
            uiLink.from === correctLink.from && uiLink.to === correctLink.to
          )
        ) && correctLinksActiveOnly4.length === uiLinksWithValues4.length
        
        console.log(`[debug-step4] uiLinks4:`, uiLinks4)
        console.log(`[debug-step4] uiLinksWithValues4:`, uiLinksWithValues4)
        console.log(`[debug-step4] correctLinksActiveOnly4:`, correctLinksActiveOnly4)
        console.log(`[debug-step4] linksMatch4:`, linksMatch4)
        
        isCorrect = linksMatch4
        break
      }
      case 5: {
        // Step5の正誤判定（論証構成の比較、順不同）
        // 2つのpremiseの順序は入れ替え可能だが、各premiseのantecedentとconsequentの組み合わせは固定
        const rawStep5 = problem.correct_answers.step5
        const correctPremises: PremiseSelection[] = Array.isArray(rawStep5)
          ? rawStep5
          : rawStep5?.premises ?? []
        const step5State = steps.step5 as Step5State | undefined
        const userPremises = step5State?.premises ?? []
        
        // 各premiseをJSON文字列に変換（順序は保持）
        const normalizePremise = (premise: { antecedent: string; consequent: string }): string => {
          return JSON.stringify(premise)
        }
        
        // 2つのpremiseの順序を入れ替え可能にするため、配列をソート
        const normalizedCorrect = correctPremises.map(normalizePremise).sort()
        const normalizedUser = userPremises.map(normalizePremise).sort()
        
        const premisesMatch =
          normalizedCorrect.length === normalizedUser.length &&
          normalizedCorrect.every(correctPremise => normalizedUser.includes(correctPremise))
        
        console.log(`[debug-step5] correctPremises:`, correctPremises)
        console.log(`[debug-step5] userPremises:`, userPremises)
        console.log(`[debug-step5] normalizedCorrect:`, normalizedCorrect)
        console.log(`[debug-step5] normalizedUser:`, normalizedUser)
        console.log(`[debug-step5] premisesMatch:`, premisesMatch)
        
        isCorrect = premisesMatch
        break
      }
    }

    console.log(`[check-step][client] step=${stepNumber} isCorrect=${isCorrect ? 'correct' : 'incorrect'}`)
    console.log(`[debug] stepState:`, currentStateFragment)
    console.log(`[debug] correct_answers:`, problem.correct_answers)

    // ログ送信（研究用）
    logClientCheck({
      problemId: problem.problem_id,
      step: stepNumber as 1 | 2 | 3 | 4 | 5,
      isCorrect,
      payload: currentStateFragment,
    })

    if (isCorrect) {
      setFeedbackType('success')
      setFeedbackVisible(true)
      updateStep(stepNumber, { ...currentStateFragment, isPassed: true })
      
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
            premiseValue={steps.step2?.premise || ''}
            onPremiseChange={(value) => updateStep(2, { ...steps.step2, premise: value })}
            links={steps.step2?.links || []}
            onLinksChange={(links) => updateStep(2, { ...steps.step2, links })}
            activeLinks={steps.step4?.links || []}
            onActiveLinksChange={(links) => updateStep(4, { ...steps.step4, links })}
            onGetNodeValues={handleNodeValuesChange}
          />
        ),
        footer: (
          <div className="w-full flex items-center justify-between gap-6">
            <Link 
              href="/problems"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              問題一覧に戻る
            </Link>
            
            {/* 問題番号と進捗（中央配置） */}
            <div className="flex items-center gap-4 flex-1 justify-center max-w-md mx-auto">
              {totalProblems > 0 && (
                <>
                  <div className="text-sm font-medium text-foreground whitespace-nowrap">
                    問題{problemNumber}
                  </div>
                  <div className="flex-1">
                    {(() => {
                      // 完了した問題数（現在の問題より前の問題は完了と仮定）
                      const completedProblems = problemNumber - 1
                      // 現在の問題の進捗率（ステップ進捗を考慮）
                      const currentProblemProgress = totalSteps > 0 ? completedSteps / totalSteps : 0
                      // 全体の進捗率 = (完了した問題数 + 現在の問題の進捗) / 総問題数
                      const overallProgress = ((completedProblems + currentProblemProgress) / totalProblems) * 100
                      return <Progress value={overallProgress} className="h-2" />
                    })()}
                  </div>
                </>
              )}
              {totalProblems === 0 && (
                <div className="text-sm font-medium text-foreground">
                  問題{problemNumber}
                </div>
              )}
            </div>
            
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

'use client'

import { getProblem, getProblemSets, getNextProblemInSet, getCurrentProblemOrder, getProblemsBySet } from '@/lib/problems'
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
  const [problemSets, setProblemSets] = useState<ProblemSet[]>([])
  const [problemNumber, setProblemNumber] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedProblemSetId, setSelectedProblemSetId] = useState<string | null>(null)
  const [nextProblem, setNextProblem] = useState<any>(null)
  const [isLastProblem, setIsLastProblem] = useState(false)
  const [totalProblems, setTotalProblems] = useState<number>(0)
  const [isClearOpen, setIsClearOpen] = useState(false)
  const [shakeToken, setShakeToken] = useState(0)
  const [feedbackVisible, setFeedbackVisible] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success')
  const [nodeValues, setNodeValues] = useState<{ antecedent: string; consequent: string; premiseNodes: Array<{ id: string; value: string }> }>({
    antecedent: '',
    consequent: '',
    premiseNodes: []
  })

  // ノードの値を更新するコールバック
  const handleNodeValuesChange = useCallback((values: { antecedent: string; consequent: string; premiseNodes: Array<{ id: string; value: string }> }) => {
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
        // Step2の正誤判定（新スキーマ：配列のリンクのみで比較）
        // 旧データ（オブジェクトや未定義）に対しては空配列として扱う
        const rawStep2 = (problem.correct_answers as any)?.step2
        const correctLinks = Array.isArray(rawStep2) ? rawStep2 : []

        // UIのリンク（ノードID）を実値に変換して比較
        const uiLinks = uiFragment.links || []

        const getNodeValue = (nodeId: string) => {
          if (nodeId === 'antecedent') return nodeValues.antecedent
          if (nodeId === 'consequent') return nodeValues.consequent
          if (nodeId.startsWith('premise-')) {
            const premiseNode = nodeValues.premiseNodes.find(node => node.id === nodeId)
            return premiseNode?.value || ''
          }
          return nodeId
        }

        const uiLinksWithValues = uiLinks.map((link: any) => ({
          from: getNodeValue(link.from),
          to: getNodeValue(link.to)
        }))

        const linksMatch = correctLinks.every((correctLink: any) =>
          uiLinksWithValues.some((uiLink: any) =>
            uiLink.from === correctLink.from && uiLink.to === correctLink.to
          )
        ) && correctLinks.length === uiLinksWithValues.length

        console.log(`[debug-step2] correctLinks:`, correctLinks)
        console.log(`[debug-step2] uiLinks:`, uiLinks)
        console.log(`[debug-step2] uiLinksWithValues:`, uiLinksWithValues)
        console.log(`[debug-step2] linksMatch:`, linksMatch)

        isCorrect = linksMatch
        break
      case 3:
        isCorrect = uiFragment.inferenceType === problem.correct_answers.step3?.inference_type &&
                   uiFragment.validity === problem.correct_answers.step3?.validity &&
                   uiFragment.verification === problem.correct_answers.step3?.verification
        break
      case 4: {
        // Step4の正誤判定（活性/非活性リンクの比較）
        const rawStep4 = (problem.correct_answers as any)?.step4
        const correctActiveLinks4 = Array.isArray(rawStep4) ? rawStep4 : []
        
        console.log(`[debug-step4] correctActiveLinks4:`, correctActiveLinks4)
        console.log(`[debug-step4] uiFragment:`, uiFragment)
        
        // UIリンクを実際の値に変換
        const uiLinks4 = uiFragment.links || []
        
        // active: trueのリンクのみを抽出
        const activeUiLinks4 = uiLinks4.filter((link: any) => link.active !== false)
        
        const getNodeValue4 = (nodeId: string) => {
          if (nodeId === 'antecedent') return nodeValues.antecedent
          if (nodeId === 'consequent') return nodeValues.consequent
          if (nodeId.startsWith('premise-')) {
            const premiseNode = nodeValues.premiseNodes.find(node => node.id === nodeId)
            return premiseNode?.value || nodeId
          }
          return nodeId
        }
        
        const uiLinksWithValues4 = activeUiLinks4.map((link: any) => ({
          from: getNodeValue4(link.from),
          to: getNodeValue4(link.to),
        }))
        
        // 正解リンクとUIリンクを比較（activeのみが正解）
        const correctLinksActiveOnly4 = correctActiveLinks4.filter((link: any) => link.active)
        
        // リンクの存在と数を比較
        const linksMatch4 = correctLinksActiveOnly4.every((correctLink: any) => 
          uiLinksWithValues4.some((uiLink: any) => 
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
        const rawStep5 = (problem.correct_answers as any)?.step5
        const correctPremises = Array.isArray(rawStep5) ? rawStep5 : []
        const userPremises = uiFragment.premises || []
        
        // 各premiseをJSON文字列に変換（順序は保持）
        const normalizePremise = (premise: { antecedent: string; consequent: string }): string => {
          return JSON.stringify(premise)
        }
        
        // 2つのpremiseの順序を入れ替え可能にするため、配列をソート
        const normalizedCorrect = correctPremises.map(normalizePremise).sort()
        const normalizedUser = userPremises.map(normalizePremise).sort()
        
        // 各premiseが正しいかチェック（2つのpremiseの順序は問わない）
        const premisesMatch = normalizedCorrect.length === normalizedUser.length &&
          normalizedCorrect.length === 2 &&
          normalizedCorrect.every((correctPremise: string) => 
            normalizedUser.some((userPremise: string) => userPremise === correctPremise)
          )
        
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
    console.log(`[debug] uiFragment:`, uiFragment)
    console.log(`[debug] correct_answers:`, problem.correct_answers)

    // ログ送信（研究用）
    logClientCheck({
      problemId: problem.problem_id,
      step: stepNumber as 1 | 2 | 3 | 4 | 5,
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
      <Header 
        problemDisplay={<ProblemDisplay problem={problem} />}
      />
      
      {/* メインコンテンツ */}
      <ProblemDetailLayout problem={problem} problemNumber={problemNumber} slots={{
        header: null,
        leftPanel: (
          <div className="h-full overflow-y-scroll bg-transparent scrollbar-gutter-stable">
            <ProblemStepDisplay
                problem={problem}
                currentStep={currentStep}
                onStepChange={goToStep}
                shakeNext={shakeToken}
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
                onRequestNext={handleAnswerCheck}
                stepsState={steps as any}
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

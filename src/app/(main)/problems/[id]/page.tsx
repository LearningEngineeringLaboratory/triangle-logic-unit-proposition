'use client'

import { getProblem, getProblemSets, getNextProblemInSet, getCurrentProblemOrder, ProblemDetail } from '@/lib/problems'
import { ProblemSet } from '@/lib/types'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ProblemStepDisplay } from '@/components/problem-step-display'
import { TriangleLogicDisplay } from '@/components/triangle-logic/triangle-logic-display'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { mapUiToDbState, isStepCorrect, logClientCheck } from '@/lib/utils'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

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
  const [currentStep, setCurrentStep] = useState(1)
  const [shakeToken, setShakeToken] = useState(0)
  const [steps, setSteps] = useState({
    step1: {
      antecedent: '',
      consequent: '',
      isPassed: false,
    },
    step2: {
      impossible: false,
      premise: '',
      linkDirections: {
        antecedentLink: true,
        consequentLink: true,
      },
      isPassed: false,
    },
    step3: {
      inferenceType: '',
      validity: null as null | boolean,
      isPassed: false,
    },
  })

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
      <div className="container mx-auto px-4 py-8">
        {/* PC画面: 左右分割レイアウト（右パネルは縦線で区切り、カード廃止） */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8 lg:h-[calc(100vh-120px)]">
          {/* 左側パネル */}
          <div className="flex flex-col space-y-6 h-full">
            {/* ステップ問題文（カード形式を廃止） */}
            <section className="flex-1 flex flex-col">
              <h3 className="text-xl font-semibold tracking-tight mb-4">問題{problemNumber}</h3>
              {/* 論証文カード（タイトル・説明とステップの間に挿入） */}
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>論証</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">{problem.argument}</p>
                </CardContent>
              </Card>
              <div className="flex-1 flex flex-col">
                {/* クリアダイアログ */}
                <Dialog open={isClearOpen} onOpenChange={setIsClearOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{isLastProblem ? 'すべての問題をクリアしました！' : '問題クリア！'}</DialogTitle>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2">
                      <Button variant="outline" onClick={handleBackToProblems} className="flex-1">
                        問題一覧に戻る
                      </Button>
                      {!isLastProblem && nextProblem && (
                        <Button onClick={handleNextProblem} className="flex-1">
                          次の問題に進む
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <ProblemStepDisplay
                  problem={problem}
                  currentStep={currentStep}
                  onStepChange={setCurrentStep}
                  shakeNext={shakeToken}
                  inferenceTypeValue={steps.step3.inferenceType}
                  validityValue={steps.step3.validity === null ? '' : (steps.step3.validity ? '妥当' : '非妥当')}
                  onInferenceTypeChange={(value) => setSteps(prev => ({
                    ...prev,
                    step3: { ...prev.step3, inferenceType: value },
                  }))}
                  onValidityChange={(value) => setSteps(prev => ({
                    ...prev,
                    step3: { ...prev.step3, validity: value === '妥当' },
                  }))}
                  onRequestNext={async () => {
                    if (!problem) return
                    const stepNumber = currentStep as 1 | 2 | 3
                    const uiFragment = stepNumber === 1 ? steps.step1 : stepNumber === 2 ? steps.step2 : steps.step3
                    const dbState = mapUiToDbState({ step1: steps.step1, step2: steps.step2, step3: steps.step3 })
                    const dbFragment = dbState[`step${stepNumber}` as 'step1' | 'step2' | 'step3']
                    const isCorrect = isStepCorrect((problem as any).correct_answers, stepNumber, dbFragment)
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
                      setSteps(prev => ({
                        ...prev,
                        [`step${stepNumber}`]: { ...uiFragment, isPassed: true } as any,
                      }))
                      if (stepNumber < 3) {
                        setCurrentStep(Math.min(3, currentStep + 1))
                      } else {
                        setIsClearOpen(true)
                      }
                    } else {
                      toast.error('不正解...')
                      setShakeToken((t) => t + 1)
                    }
                  }}
                />
              </div>
            </section>
          </div>

          {/* 右側パネル（カードなし・左側に縦罫線） */}
          <div className="flex-1 flex items-center justify-center border-l pl-8">
            <TriangleLogicDisplay
              options={problem.options ?? ['選択肢が設定されていません']}
              onAntecedentChange={(value) => setSteps(prev => ({
                ...prev,
                step1: { ...prev.step1, antecedent: value },
              }))}
              onConsequentChange={(value) => setSteps(prev => ({
                ...prev,
                step1: { ...prev.step1, consequent: value },
              }))}
              onPremiseChange={(value) => setSteps(prev => ({
                ...prev,
                step2: { ...prev.step2, premise: value },
              }))}
              onLinkDirectionToggle={(linkType) => setSteps(prev => ({
                ...prev,
                step2: {
                  ...prev.step2,
                  linkDirections: {
                    ...prev.step2.linkDirections,
                    antecedentLink: linkType === 'antecedent' ? !prev.step2.linkDirections.antecedentLink : prev.step2.linkDirections.antecedentLink,
                    consequentLink: linkType === 'consequent' ? !prev.step2.linkDirections.consequentLink : prev.step2.linkDirections.consequentLink,
                  }
                }
              }))}
              onInferenceTypeChange={(value) => setSteps(prev => ({
                ...prev,
                step3: { ...prev.step3, inferenceType: value },
              }))}
              onValidityChange={(value) => setSteps(prev => ({
                ...prev,
                step3: { ...prev.step3, validity: value === '妥当' },
              }))}
              inferenceTypeValue={steps.step3.inferenceType}
              validityValue={steps.step3.validity === null ? '' : (steps.step3.validity ? '妥当' : '非妥当')}
              antecedentValue={steps.step1.antecedent}
              consequentValue={steps.step1.consequent}
              premiseValue={steps.step2.premise}
              antecedentLinkDirection={steps.step2.linkDirections.antecedentLink}
              consequentLinkDirection={steps.step2.linkDirections.consequentLink}
              currentStep={currentStep}
              impossibleValue={steps.step2.impossible}
              onImpossibleToggle={(value) => setSteps(prev => ({
                ...prev,
                step2: { ...prev.step2, impossible: value },
              }))}
            />
          </div>
        </div>

        {/* モバイル画面: 上下分割レイアウト */}
        <div className="lg:hidden space-y-4">

          {/* ステップ問題文（カルーセル形式） */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold tracking-tight mb-1">問題{problemNumber}</h3>
            </CardHeader>
            <CardContent>
              {/* 論証文表示 */}
              <Card>
                <CardHeader>
                  <CardTitle>論証文</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">{problem.argument}</p>
                </CardContent>
              </Card>
              {/* クリアダイアログ（モバイル版） */}
              <Dialog open={isClearOpen} onOpenChange={setIsClearOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{isLastProblem ? 'すべての問題をクリアしました！' : '問題クリア！'}</DialogTitle>
                  </DialogHeader>
                  <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={handleBackToProblems} className="flex-1">
                      問題一覧に戻る
                    </Button>
                    {!isLastProblem && nextProblem && (
                      <Button onClick={handleNextProblem} className="flex-1">
                        次の問題に進む
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <ProblemStepDisplay
                problem={problem}
                currentStep={currentStep}
                onStepChange={setCurrentStep}
                shakeNext={shakeToken}
                inferenceTypeValue={steps.step3.inferenceType}
                validityValue={steps.step3.validity === null ? '' : (steps.step3.validity ? '妥当' : '非妥当')}
                onInferenceTypeChange={(value) => setSteps(prev => ({
                  ...prev,
                  step3: { ...prev.step3, inferenceType: value },
                }))}
                onValidityChange={(value) => setSteps(prev => ({
                  ...prev,
                  step3: { ...prev.step3, validity: value === '妥当' },
                }))}
                onRequestNext={async () => {
                  if (!problem) return
                  const stepNumber = currentStep as 1 | 2 | 3
                  const uiFragment = stepNumber === 1 ? steps.step1 : stepNumber === 2 ? steps.step2 : steps.step3
                  const dbState = mapUiToDbState({ step1: steps.step1, step2: steps.step2, step3: steps.step3 })
                  const dbFragment = dbState[`step${stepNumber}` as 'step1' | 'step2' | 'step3']
                  const isCorrect = isStepCorrect((problem as any).correct_answers, stepNumber, dbFragment)
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
                    setSteps(prev => ({
                      ...prev,
                      [`step${stepNumber}`]: { ...uiFragment, isPassed: true } as any,
                    }))
                    if (stepNumber < 3) {
                      setCurrentStep(Math.min(3, currentStep + 1))
                    } else {
                      setIsClearOpen(true)
                    }
                  } else {
                    toast.error('不正解...')
                    setShakeToken((t) => t + 1)
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* 単位命題三角ロジック表示エリア */}
          <Card>
            <CardHeader>
              <CardTitle>単位命題三角ロジック</CardTitle>
            </CardHeader>
            <CardContent>
              <TriangleLogicDisplay
                options={problem.options ?? ['Pである', 'Qである', 'Rである']}
                onAntecedentChange={(value) => setSteps(prev => ({ ...prev, step1: { ...prev.step1, antecedent: value } }))}
                onConsequentChange={(value) => setSteps(prev => ({ ...prev, step1: { ...prev.step1, consequent: value } }))}
                onPremiseChange={(value) => setSteps(prev => ({ ...prev, step2: { ...prev.step2, premise: value } }))}
                onLinkDirectionToggle={(linkType) => setSteps(prev => ({
                  ...prev,
                  step2: {
                    ...prev.step2,
                    linkDirections: {
                      ...prev.step2.linkDirections,
                      antecedentLink: linkType === 'antecedent' ? !prev.step2.linkDirections.antecedentLink : prev.step2.linkDirections.antecedentLink,
                      consequentLink: linkType === 'consequent' ? !prev.step2.linkDirections.consequentLink : prev.step2.linkDirections.consequentLink,
                    }
                  }
                }))}
                onInferenceTypeChange={(value) => setSteps(prev => ({ ...prev, step3: { ...prev.step3, inferenceType: value } }))}
                onValidityChange={(value) => setSteps(prev => ({ ...prev, step3: { ...prev.step3, validity: value === '妥当' } }))}
                inferenceTypeValue={steps.step3.inferenceType}
                validityValue={steps.step3.validity === null ? '' : (steps.step3.validity ? '妥当' : '非妥当')}
                antecedentValue={steps.step1.antecedent}
                consequentValue={steps.step1.consequent}
                premiseValue={steps.step2.premise}
                antecedentLinkDirection={steps.step2.linkDirections.antecedentLink}
                consequentLinkDirection={steps.step2.linkDirections.consequentLink}
                currentStep={currentStep}
                impossibleValue={steps.step2.impossible}
                onImpossibleToggle={(value) => setSteps(prev => ({ ...prev, step2: { ...prev.step2, impossible: value } }))}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

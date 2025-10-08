'use client'

import { getProblem, ProblemDetail } from '@/lib/problems'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ProblemStepDisplay } from '@/components/problem-step-display'
import { TriangleLogicDisplay } from '@/components/triangle-logic/triangle-logic-display'
import { useEffect, useState } from 'react'

interface ProblemDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProblemDetailPage({ params }: ProblemDetailPageProps) {
  const [problem, setProblem] = useState<ProblemDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState({
    antecedent: '',
    consequent: '',
    premise: '',
    antecedentLinkDirection: true,
    consequentLinkDirection: true,
    inferenceType: '',
    validity: ''
  })

  useEffect(() => {
    async function fetchProblem() {
      try {
        const resolvedParams = await params
        const data = await getProblem(resolvedParams.id)
        if (!data) {
          notFound()
        }
        setProblem(data)
      } catch (error) {
        console.error('Error fetching problem:', error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchProblem()
  }, [params])

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

      {/* 問題進捗インジケーター */}
      <div className="border-b bg-muted/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: 5 }, (_, i) => i + 1).map((num) => (
              <div key={num} className="flex items-center">
                <Badge
                  variant={num <= 1 ? "default" : "outline"}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                >
                  {num}
                </Badge>
                {num < 5 && (
                  <div className="w-8 h-0.5 bg-border mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-8">
        {/* PC画面: 左右分割レイアウト */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8 lg:h-[calc(100vh-200px)]">
                    {/* 左側パネル */}
                    <div className="flex flex-col space-y-6">
                        {/* ステップ問題文（カード形式を廃止） */}
                        <section className="flex-1">
                            <h3 className="text-xl font-semibold tracking-tight mb-1">{problem.title}</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                以下のステップに従って、単位命題三角ロジックを構成してください
                            </p>
                            {/* 論証文カード（タイトル・説明とステップの間に挿入） */}
                            <Card className="mb-4">
                                <CardHeader>
                                    <CardTitle>論証文</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg leading-relaxed">{problem.argument}</p>
                                </CardContent>
                            </Card>
                            <ProblemStepDisplay
                                problem={problem}
                                currentStep={currentStep}
                                onStepChange={setCurrentStep}
                            />
                        </section>
                    </div>

          {/* 右側パネル */}
          <div className="flex flex-col space-y-4">
            {/* 単位命題三角ロジック表示エリア */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>単位命題三角ロジック</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <TriangleLogicDisplay
                  options={['Pである', 'Qである', 'Rである']}
                  onAntecedentChange={(value) => setAnswers(prev => ({ ...prev, antecedent: value }))}
                  onConsequentChange={(value) => setAnswers(prev => ({ ...prev, consequent: value }))}
                  onPremiseChange={(value) => setAnswers(prev => ({ ...prev, premise: value }))}
                  onLinkDirectionToggle={(linkType) => {
                    if (linkType === 'antecedent') {
                      setAnswers(prev => ({ ...prev, antecedentLinkDirection: !prev.antecedentLinkDirection }))
                    } else {
                      setAnswers(prev => ({ ...prev, consequentLinkDirection: !prev.consequentLinkDirection }))
                    }
                  }}
                  onInferenceTypeChange={(value) => setAnswers(prev => ({ ...prev, inferenceType: value }))}
                  onValidityChange={(value) => setAnswers(prev => ({ ...prev, validity: value }))}
                  inferenceTypeValue={answers.inferenceType}
                  validityValue={answers.validity}
                  antecedentValue={answers.antecedent}
                  consequentValue={answers.consequent}
                  premiseValue={answers.premise}
                  antecedentLinkDirection={answers.antecedentLinkDirection}
                  consequentLinkDirection={answers.consequentLinkDirection}
                  currentStep={currentStep}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* モバイル画面: 上下分割レイアウト */}
        <div className="lg:hidden space-y-4">
          {/* 論証文表示 */}
          <Card>
            <CardHeader>
              <CardTitle>論証文</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{problem.argument}</p>
            </CardContent>
          </Card>

          {/* ステップ問題文（カルーセル形式） */}
          <Card>
            <CardHeader>
              <CardTitle>ステップ問題文</CardTitle>
              <CardDescription>
                以下のステップに従って、単位命題三角ロジックを構成してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProblemStepDisplay
                problem={problem}
                currentStep={currentStep}
                onStepChange={setCurrentStep}
              />
            </CardContent>
          </Card>

          {/* 単位命題三角ロジック表示エリア */}
          <Card>
            <CardHeader>
              <CardTitle>単位命題三角ロジック</CardTitle>
              <CardDescription>
                選択肢から単位命題を選択し、三角ロジックを構成してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TriangleLogicDisplay
                options={['Pである', 'Qである', 'Rである']}
                onAntecedentChange={(value) => setAnswers(prev => ({ ...prev, antecedent: value }))}
                onConsequentChange={(value) => setAnswers(prev => ({ ...prev, consequent: value }))}
                onPremiseChange={(value) => setAnswers(prev => ({ ...prev, premise: value }))}
                onLinkDirectionToggle={(linkType) => {
                  if (linkType === 'antecedent') {
                    setAnswers(prev => ({ ...prev, antecedentLinkDirection: !prev.antecedentLinkDirection }))
                  } else {
                    setAnswers(prev => ({ ...prev, consequentLinkDirection: !prev.consequentLinkDirection }))
                  }
                }}
                onInferenceTypeChange={(value) => setAnswers(prev => ({ ...prev, inferenceType: value }))}
                onValidityChange={(value) => setAnswers(prev => ({ ...prev, validity: value }))}
                inferenceTypeValue={answers.inferenceType}
                validityValue={answers.validity}
                antecedentValue={answers.antecedent}
                consequentValue={answers.consequent}
                premiseValue={answers.premise}
                antecedentLinkDirection={answers.antecedentLinkDirection}
                consequentLinkDirection={answers.consequentLinkDirection}
                currentStep={currentStep}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

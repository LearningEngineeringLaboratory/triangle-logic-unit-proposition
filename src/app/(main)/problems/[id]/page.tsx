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
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/problems">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              問題一覧に戻る
            </Button>
          </Link>
          <Badge variant="secondary">
            {problem.total_steps}ステップ
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{problem.title}</h1>
        <p className="text-muted-foreground mt-2">
          単位命題三角ロジック演習システム
        </p>
      </div>

      {/* 問題文 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>問題文</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">{problem.argument}</p>
        </CardContent>
      </Card>

      {/* ステップ型演習UI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左側: ステップ問題文 */}
        <Card>
          <CardHeader>
            <CardTitle>ステップ型演習</CardTitle>
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

        {/* 右側: 単位命題三角ロジック表示エリア */}
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

      {/* 答え合わせボタン */}
      <div className="flex justify-center mt-8">
        <Button size="lg">
          答え合わせ
        </Button>
      </div>
    </div>
  )
}

'use client'

import { getProblems, getProblemSets, getProblemsBySet } from '@/lib/problems'
import { Problem, ProblemSet } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ProblemSetSelector } from '@/components/problem-set-selector'
import Link from 'next/link'
import { Suspense, useState, useEffect } from 'react'

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [problemSets, setProblemSets] = useState<ProblemSet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [problemsData, problemSetsData] = await Promise.all([
          getProblems(),
          getProblemSets()
        ])
        setProblems(problemsData)
        setProblemSets(problemSetsData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">問題一覧</h1>
          <p className="text-muted-foreground mt-2">
            単位命題三角ロジック演習システム
          </p>
        </div>
        <div className="flex justify-center py-12">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">問題一覧</h1>
        <p className="text-muted-foreground mt-2">
          単位命題三角ロジック演習システム
        </p>
      </div>

      <ProblemsListWithSetSelector 
        initialProblems={problems} 
        problemSets={problemSets} 
      />
    </div>
  )
}

interface ProblemsListWithSetSelectorProps {
  initialProblems: Problem[]
  problemSets: ProblemSet[]
}

function ProblemsListWithSetSelector({ initialProblems, problemSets }: ProblemsListWithSetSelectorProps) {
  const [problems, setProblems] = useState<Problem[]>([])
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSetChange = async (setId: string | null) => {
    setSelectedSetId(setId)
    setIsLoading(true)
    
    try {
      if (setId) {
        const problemsFromSet = await getProblemsBySet(setId)
        setProblems(problemsFromSet)
      } else {
        // セットが選択されていない場合は空の配列を表示
        setProblems([])
      }
    } catch (error) {
      console.error('Error loading problems:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <ProblemSetSelector
        problemSets={problemSets}
        selectedSetId={selectedSetId}
        onSetChange={handleSetChange}
        isLoading={isLoading}
      />

      {problems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-lg">
              {isLoading ? '読み込み中...' : selectedSetId ? 'このセットに問題が見つかりませんでした' : '問題セットを選択してください'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem: Problem) => (
            <ProblemCard key={problem.problem_id} problem={problem} />
          ))}
        </div>
      )}
    </>
  )
}

interface ProblemCardProps {
  problem: Problem
}

function ProblemCard({ problem }: ProblemCardProps) {
  const totalSteps = problem.correct_answers ? Object.keys(problem.correct_answers).length : 0
  const done = problem.completed_steps || 0
  const progress = totalSteps > 0 ? (done / totalSteps) * 100 : 0

  return (
    <Link href={`/problems/${problem.problem_id}`} className="block">
      <Card className="hover:shadow-md transition-shadow hover:ring-1 hover:ring-primary cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{problem.title}</CardTitle>
            <Badge variant={progress === 100 ? "default" : "secondary"}>
              {done}/{totalSteps}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
        {problem.argument}
        </CardContent>
      </Card>
    </Link>
  )
}

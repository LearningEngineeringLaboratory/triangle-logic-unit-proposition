'use client'

import { getProblems, getProblemSets, getProblemsBySet } from '@/lib/problems'
import { Problem, ProblemSet } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ProblemSetSelector } from '@/components/features/problem-list/problem-set-selector'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'

// 問題選択画面用のヘッダー（ダークモード切り替え付き）
function HeaderWithTheme() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">
            単位命題三角ロジック演習システム
          </h1>

          {/* ダークモード切り替えメニュー */}
          <div className="flex items-center">
            {mounted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 px-0">
                    {theme === "light" && <Sun className="h-4 w-4" />}
                    {theme === "dark" && <Moon className="h-4 w-4" />}
                    {theme === "system" && <Monitor className="h-4 w-4" />}
                    {!theme && <Monitor className="h-4 w-4" />}
                    <span className="sr-only">テーマを切り替え</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>ライト</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>ダーク</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>システム</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

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
      <>
        <HeaderWithTheme />
        <div className="container mx-auto px-4 py-8">
          {/* 問題セットセレクターのSkeleton */}
          <div className="mb-8">
            <Skeleton className="h-12 w-64 rounded-xl mb-4" />
          </div>

          {/* 問題カードのSkeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-24 rounded-lg" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full rounded-md mb-2" />
                  <Skeleton className="h-4 w-5/6 rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <HeaderWithTheme />
      <div className="container mx-auto px-4 py-8">
        <ProblemsListWithSetSelector 
          initialProblems={problems} 
          problemSets={problemSets} 
        />
      </div>
    </>
  )
}

interface ProblemsListWithSetSelectorProps {
  initialProblems: Problem[]
  problemSets: ProblemSet[]
}

function ProblemsListWithSetSelector({ initialProblems, problemSets }: ProblemsListWithSetSelectorProps) {
  const [problems, setProblems] = useState<Problem[]>(initialProblems)
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const handleSetChange = useCallback(async (setId: string | null) => {
    setSelectedSetId(setId)
    setIsLoading(true)
    
    // localStorageに選択状態を保存
    if (setId) {
      localStorage.setItem('selectedProblemSetId', setId)
    } else {
      localStorage.removeItem('selectedProblemSetId')
    }
    
    try {
      if (setId) {
        const problemsFromSet = await getProblemsBySet(setId)
        setProblems(problemsFromSet)
      } else {
        // セットが選択されていない場合は初期問題を表示
        setProblems(initialProblems)
      }
    } catch (error) {
      console.error('Error loading problems:', error)
    } finally {
      setIsLoading(false)
    }
  }, [initialProblems])

  // 初期化時にlocalStorageから選択状態を復元
  useEffect(() => {
    if (!isInitialized && problemSets.length > 0) {
      const savedSetId = localStorage.getItem('selectedProblemSetId')
      if (savedSetId && problemSets.some(set => set.set_id === savedSetId)) {
        // 保存されたセットIDが有効な場合、自動選択
        handleSetChange(savedSetId)
      }
      setIsInitialized(true)
    }
  }, [problemSets, isInitialized, handleSetChange])

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
  const problemNumber = problem.order_index || 1

  return (
    <Link href={`/problems/${problem.problem_id}`} className="block">
      <Card className="hover:shadow-md transition-shadow hover:ring-1 hover:ring-primary cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">問題{problemNumber}</CardTitle>
            {/* <Badge variant={progress === 100 ? "default" : "secondary"}>
              {done}/{totalSteps}
            </Badge> */}
          </div>
        </CardHeader>
        <CardContent>
        {problem.argument}
        </CardContent>
      </Card>
    </Link>
  )
}

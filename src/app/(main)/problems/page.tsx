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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Menu, RotateCcw, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from '@/hooks/useSession'
import { UserRegistrationDialog } from '@/components/features/auth/UserRegistrationDialog'
import { Badge } from '@/components/ui/badge'

// 問題選択画面用のヘッダー（ハンバーガーメニュー付き）
interface HeaderWithThemeProps {
  sessionInfo: { sessionId: string; userId: string; userName: string; userEmail: string } | null
  onLogout: () => void
  onResetAll: () => void
  completedCount: number
}

function HeaderWithTheme({ sessionInfo, onLogout, onResetAll, completedCount }: HeaderWithThemeProps) {
  const [showResetDialog, setShowResetDialog] = useState(false)

  const handleResetClick = () => {
    setShowResetDialog(true)
  }

  const handleResetConfirm = () => {
    setShowResetDialog(false)
    onResetAll()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">
            単位命題三角ロジック演習システム
          </h1>

          {/* ハンバーガーメニュー */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 px-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">メニューを開く</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* ログイン状況 */}
                {sessionInfo && (
                  <>
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{sessionInfo.userName}</p>
                        <p className="text-xs text-muted-foreground">{sessionInfo.userEmail}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* クリア済みリセット */}
                {sessionInfo && completedCount > 0 && (
                  <>
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={handleResetClick}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        <span>全クリア済みをリセット ({completedCount})</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* ログアウト */}
                {sessionInfo && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} variant="destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>ログアウト</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* リセット確認ダイアログ */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>全クリア済みをリセット</DialogTitle>
            <DialogDescription>
              {completedCount}件のクリア済み問題をリセットしますか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleResetConfirm}>
              <RotateCcw className="mr-2 h-4 w-4" />
              リセット
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [problemSets, setProblemSets] = useState<ProblemSet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [completedCount, setCompletedCount] = useState(0)
  const { sessionInfo, isLoading: isSessionLoading, needsRegistration, handleRegistrationSuccess, handleLogout } = useSession()

  // 全クリア済みをリセット
  const handleResetAll = useCallback(async () => {
    if (!sessionInfo) return

    try {
      const res = await fetch('/api/response/reset-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      
      if (data.success) {
        setCompletedCount(0)
        // ページをリロードして状態を更新
        window.location.reload()
      }
    } catch (err) {
      console.error('Error resetting all completions:', err)
    }
  }, [sessionInfo])

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

  if (isLoading || isSessionLoading) {
    return (
      <>
        <HeaderWithTheme 
          sessionInfo={sessionInfo}
          onLogout={handleLogout}
          onResetAll={handleResetAll}
          completedCount={completedCount}
        />
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
      <HeaderWithTheme 
        sessionInfo={sessionInfo}
        onLogout={handleLogout}
        onResetAll={handleResetAll}
        completedCount={completedCount}
      />
      <div className="container mx-auto px-4 py-8">
        <ProblemsListWithSetSelector 
          initialProblems={problems} 
          problemSets={problemSets}
          onCompletedCountChange={setCompletedCount}
        />
      </div>
      <UserRegistrationDialog
        open={needsRegistration}
        onSuccess={handleRegistrationSuccess}
      />
    </>
  )
}

interface ProblemsListWithSetSelectorProps {
  initialProblems: Problem[]
  problemSets: ProblemSet[]
  onCompletedCountChange: (count: number) => void
}

function ProblemsListWithSetSelector({ initialProblems, problemSets, onCompletedCountChange }: ProblemsListWithSetSelectorProps) {
  const onCompletedCountChangeRef = useRef(onCompletedCountChange)
  
  useEffect(() => {
    onCompletedCountChangeRef.current = onCompletedCountChange
  }, [onCompletedCountChange])
  const [problems, setProblems] = useState<Problem[]>(initialProblems)
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [completedProblemIds, setCompletedProblemIds] = useState<Set<string>>(new Set())
  const { sessionInfo } = useSession()

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

  // クリア済み問題の状態を取得
  useEffect(() => {
    async function fetchCompletionStatus() {
      if (!sessionInfo) {
        setCompletedProblemIds(new Set<string>())
        return
      }

      try {
        const res = await fetch('/api/response/completion-status', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        const data = await res.json()
        
        if (data.success && data.data) {
          const completedIds = new Set<string>(
            Array.isArray(data.data.completedProblemIds) 
              ? data.data.completedProblemIds as string[]
              : []
          )
          setCompletedProblemIds(completedIds)
          onCompletedCountChangeRef.current(completedIds.size)
        } else {
          onCompletedCountChangeRef.current(0)
        }
      } catch (err) {
        console.error('Error fetching completion status:', err)
      }
    }

    fetchCompletionStatus()
  }, [sessionInfo])


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
            <ProblemCard 
              key={problem.problem_id} 
              problem={problem}
              isCompleted={completedProblemIds.has(problem.problem_id)}
            />
          ))}
        </div>
      )}
    </>
  )
}

interface ProblemCardProps {
  problem: Problem
  isCompleted: boolean
}

function ProblemCard({ problem, isCompleted }: ProblemCardProps) {
  const problemNumber = problem.order_index || 1

  return (
    <div className="relative">
      {isCompleted ? (
        <Card className="bg-muted/50 border-muted-foreground/20 opacity-75">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">問題{problemNumber}</CardTitle>
              <Badge variant="default" className="bg-green-600">
                クリア済み
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{problem.argument}</p>
          </CardContent>
        </Card>
      ) : (
        <Link href={`/problems/${problem.problem_id}`} className="block">
          <Card className="hover:shadow-md transition-shadow hover:ring-1 hover:ring-primary cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">問題{problemNumber}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {problem.argument}
            </CardContent>
          </Card>
        </Link>
      )}
    </div>
  )
}

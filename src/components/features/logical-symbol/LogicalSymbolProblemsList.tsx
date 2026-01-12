'use client'

import { getProblemsBySet } from '@/lib/problems'
import { Problem, ProblemSet } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { ProblemSetSelector } from '@/components/features/problem-list/problem-set-selector'
import { LogicalSymbolProblemCard } from './LogicalSymbolProblemCard'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Loading } from '@/components/ui/loading'

interface LogicalSymbolProblemsListProps {
  initialProblems: Problem[]
  problemSets: ProblemSet[]
  onCompletedCountChange: (count: number) => void
  sessionInfo: { sessionId: string; userId: string; userName: string; userStudentId: string } | null
}

// 問題セット選択とそれに応じた問題一覧の表示、およびクリア済み問題数の集計を行うコンポーネント
export function LogicalSymbolProblemsList({ 
  initialProblems, 
  problemSets, 
  onCompletedCountChange,
  sessionInfo
}: LogicalSymbolProblemsListProps) {
  // 親から渡されたクリア済み問題数更新コールバックを常に最新に保つためのref
  const onCompletedCountChangeRef = useRef(onCompletedCountChange)
  
  useEffect(() => {
    onCompletedCountChangeRef.current = onCompletedCountChange
  }, [onCompletedCountChange])

  // 表示対象の問題一覧（問題セット未選択時は空にしてメッセージのみ表示）
  const [problems, setProblems] = useState<Problem[]>([])
  // 現在選択されている問題セットID（null の場合は全体）
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null)
  // 問題セット変更時のローディング状態
  const [isLoading, setIsLoading] = useState(false)
  // localStorage からの初期復元が完了したかどうか
  const [isInitialized, setIsInitialized] = useState(false)
  // クリア済みの problem_id の集合
  const [completedProblemIds, setCompletedProblemIds] = useState<Set<string>>(new Set())
  // フェッチ中の重複リクエストを防ぐためのref
  const isFetchingRef = useRef(false)

  // 問題セット選択変更時に、選択状態を保持しつつ問題一覧を切り替える
  const handleSetChange = useCallback(async (setId: string | null) => {
    setSelectedSetId(setId)
    setIsLoading(true)
    
    // localStorageに選択状態を保存（比較実験用は別のキーを使用）
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
        // セットが選択されていない場合は問題を表示せず、案内メッセージのみ表示
        setProblems([])
      }
    } catch (error) {
      console.error('Error loading problems:', error)
    } finally {
      setIsLoading(false)
    }
  }, [initialProblems])

  // 初期化時に localStorage から直近の問題セット選択状態を復元
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

  // ログイン済みセッションに紐づく「クリア済み問題ID一覧」を取得し、カードの表示とカウンタに反映
  useEffect(() => {
    async function fetchCompletionStatus() {
      // 既にフェッチ中の場合はスキップ
      if (isFetchingRef.current) {
        return
      }
      
      if (!sessionInfo) {
        setCompletedProblemIds(new Set<string>())
        return
      }

      isFetchingRef.current = true
      try {
        const res = await fetch('/api/attempt/completion-status?systemType=logical_symbol', {
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
      } finally {
        isFetchingRef.current = false
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

      {/* 選択中のセットに問題が無い場合の状態表示 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loading />
        </div>
      ) : problems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-lg">
              {selectedSetId ? 'このセットに問題が見つかりませんでした' : '問題セットを選択してください'}
            </p>
          </CardContent>
        </Card>
      ) : (
        // 問題一覧カード（クリア済みは `isCompleted` フラグで視覚的に区別）
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem: Problem) => (
            <LogicalSymbolProblemCard 
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


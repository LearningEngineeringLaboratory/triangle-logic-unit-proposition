'use client'

import { getProblemsBySet } from '@/lib/problems'
import { Problem, ProblemSet } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { ProblemSetSelector } from './problem-set-selector'
import { ProblemCard } from './ProblemCard'
import { useState, useEffect, useCallback } from 'react'
import { Loading } from '@/components/ui/loading'

interface ProblemsListWithSetSelectorProps {
  initialProblems: Problem[]
  problemSets: ProblemSet[]
  sessionInfo: { sessionId: string; userId: string; userName: string; userStudentId: string } | null
}

// 問題セット選択とそれに応じた問題一覧の表示、およびクリア済み問題数の集計を行うコンポーネント
export function ProblemsListWithSetSelector({ 
  initialProblems, 
  problemSets, 
  sessionInfo
}: ProblemsListWithSetSelectorProps) {
  // 表示対象の問題一覧（問題セット未選択時は空にしてメッセージのみ表示）
  const [problems, setProblems] = useState<Problem[]>([])
  // 現在選択されている問題セットID（null の場合は全体）
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null)
  // 問題セット変更時のローディング状態
  const [isLoading, setIsLoading] = useState(false)
  // localStorage からの初期復元が完了したかどうか
  const [isInitialized, setIsInitialized] = useState(false)
  // クリア状態はイベントログのみで管理するため常に未完とする
  const [completedProblemIds] = useState<Set<string>>(new Set())

  // 問題セット選択変更時に、選択状態を保持しつつ問題一覧を切り替える
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


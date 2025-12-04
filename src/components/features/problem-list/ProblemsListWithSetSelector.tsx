'use client'

import { getProblemsBySet } from '@/lib/problems'
import { Problem, ProblemSet } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { ProblemSetSelector } from './problem-set-selector'
import { ProblemCard } from './ProblemCard'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from '@/hooks/useSession'

interface ProblemsListWithSetSelectorProps {
  initialProblems: Problem[]
  problemSets: ProblemSet[]
  onCompletedCountChange: (count: number) => void
}

export function ProblemsListWithSetSelector({ 
  initialProblems, 
  problemSets, 
  onCompletedCountChange 
}: ProblemsListWithSetSelectorProps) {
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


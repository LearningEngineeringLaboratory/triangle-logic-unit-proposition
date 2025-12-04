'use client'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ProblemDetailFooterProps {
  problemNumber: number
  totalProblems: number
  completedSteps: number
  totalSteps: number
  onAnswerCheck: () => void | Promise<void>
}

export function ProblemDetailFooter({
  problemNumber,
  totalProblems,
  completedSteps,
  totalSteps,
  onAnswerCheck,
}: ProblemDetailFooterProps) {
  return (
    <div className="w-full flex items-center justify-between gap-6 px-4">
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
        onClick={async () => {
          const result = onAnswerCheck()
          if (result instanceof Promise) {
            result.catch(() => { })
          }
        }}
        size="lg"
        className="min-w-[200px]"
      >
        答え合わせ
      </Button>
    </div>
  )
}


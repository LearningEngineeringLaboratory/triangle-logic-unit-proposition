'use client'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ProblemDetailFooterProps {
  problemNumber: number
  totalProblems: number
  completedProblems: number
  onAnswerCheck: () => void | Promise<void>
}

export function ProblemDetailFooter({
  problemNumber,
  totalProblems,
  completedProblems,
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
      
      {/* 進捗（中央配置） */}
      <div className="flex items-center gap-4 flex-1 justify-center max-w-md mx-auto">
        {totalProblems > 0 && (
          <>
            <div className="flex-1">
              {(() => {
                // 完了した問題数のみで進捗率を計算
                const overallProgress = (completedProblems / totalProblems) * 100
                return <Progress value={overallProgress} className="h-2" />
              })()}
            </div>
            <div className="text-xs font-medium text-muted-foreground whitespace-nowrap px-3 py-1.5 rounded-md bg-background border-2 border-border">
              問題{problemNumber}/{totalProblems}
            </div>
          </>
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


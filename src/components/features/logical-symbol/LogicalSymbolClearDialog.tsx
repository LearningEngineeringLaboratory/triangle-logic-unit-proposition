'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trophy, Sparkles, ArrowRight } from 'lucide-react'
import { Problem } from '@/lib/types'

interface LogicalSymbolClearDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isLastProblem: boolean
  onBackToProblems: () => void
  onNextProblem?: () => void
  nextProblem?: Problem | null
}

export function LogicalSymbolClearDialog({
  isOpen,
  onOpenChange,
  isLastProblem,
  onBackToProblems,
  onNextProblem,
  nextProblem
}: LogicalSymbolClearDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-linear-to-br from-success to-success/70 flex items-center justify-center shadow-xl animate-in zoom-in duration-500">
            {isLastProblem ? (
              <Sparkles className="w-10 h-10 text-white" />
            ) : (
              <Trophy className="w-10 h-10 text-white" />
            )}
          </div>
          <DialogTitle className="text-2xl">
            {isLastProblem ? 'すべての問題をクリアしました！' : '問題クリア！'}
          </DialogTitle>
          <p className="text-muted-foreground">
            {isLastProblem 
              ? 'お疲れさまでした。すべての問題を解き終えました。' 
              : '素晴らしい！次の問題にチャレンジしましょう。'}
          </p>
        </DialogHeader>
        <DialogFooter className="flex gap-3 sm:flex-col">
          {!isLastProblem && nextProblem && onNextProblem && (
            <Button onClick={onNextProblem} size="lg" className="flex-1">
              次の問題に進む
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
          <Button variant="outline" onClick={onBackToProblems} size="lg" className="flex-1">
            問題一覧に戻る
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


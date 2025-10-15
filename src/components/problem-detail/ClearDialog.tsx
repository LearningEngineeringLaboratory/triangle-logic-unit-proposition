'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ClearDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isLastProblem: boolean
  onBackToProblems: () => void
  onNextProblem?: () => void
  nextProblem?: any
}

export function ClearDialog({
  isOpen,
  onOpenChange,
  isLastProblem,
  onBackToProblems,
  onNextProblem,
  nextProblem
}: ClearDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isLastProblem ? 'すべての問題をクリアしました！' : '問題クリア！'}
          </DialogTitle>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onBackToProblems} className="flex-1">
            問題一覧に戻る
          </Button>
          {!isLastProblem && nextProblem && onNextProblem && (
            <Button onClick={onNextProblem} className="flex-1">
              次の問題に進む
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

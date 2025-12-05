'use client'

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
import { useState } from 'react'

interface ProblemsPageHeaderProps {
  sessionInfo: { sessionId: string; userId: string; userName: string; userStudentId: string } | null
  onLogout: () => void
  onResetAll: () => void
  completedCount: number
}

export function ProblemsPageHeader({ sessionInfo, onLogout, onResetAll, completedCount }: ProblemsPageHeaderProps) {
  const [showResetDialog, setShowResetDialog] = useState(false)

  const handleResetClick = () => {
    setShowResetDialog(true)
  }

  const handleResetConfirm = () => {
    setShowResetDialog(false)
    onResetAll()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
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
                        <p className="text-xs text-muted-foreground">{sessionInfo.userStudentId}</p>
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


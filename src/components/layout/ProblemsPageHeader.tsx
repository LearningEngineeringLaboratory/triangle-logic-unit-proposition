'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Menu, LogOut } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface ProblemsPageHeaderProps {
  sessionInfo: { sessionId: string; userId: string; userName: string; userStudentId: string } | null
  onLogout: () => void
}

export function ProblemsPageHeader({ sessionInfo, onLogout }: ProblemsPageHeaderProps) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogoutClick = () => {
    setShowLogoutDialog(true)
  }

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false)
    onLogout()
  }

  // ゲストユーザーかどうかを判定
  const isGuestUser = sessionInfo?.userStudentId?.startsWith('unknownuser') ?? false

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">
            単位命題三角ロジック演習システム
          </h1>

          {/* ログイン情報とハンバーガーメニュー */}
          <div className="flex items-center gap-3">
            {/* ログイン情報 */}
            {sessionInfo && (
              <>
                {isGuestUser ? (
                  <Badge variant="outline" className="text-xs text-destructive border-destructive">
                    ログインしていません
                  </Badge>
                ) : (
                  <div className="flex flex-col items-end text-right">
                    <p className="text-xs text-muted-foreground">{sessionInfo.userName}</p>
                    <p className="text-xs text-muted-foreground">{sessionInfo.userStudentId}</p>
                  </div>
                )}
              </>
            )}

            {/* ハンバーガーメニュー */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 px-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">メニューを開く</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* ログアウト */}
                {sessionInfo && (
                  <DropdownMenuItem onClick={handleLogoutClick} variant="destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>ログアウト</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ログアウト確認ダイアログ */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ログアウト</DialogTitle>
            <DialogDescription>
              ログアウトすると、現在の学習状況は提出され、セッションが終了します。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="font-medium text-destructive">
              再度ログインすることはできません。新しいセッションとして開始されます。
            </div>
            <div>
              ログアウトしますか？
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleLogoutConfirm}>
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}


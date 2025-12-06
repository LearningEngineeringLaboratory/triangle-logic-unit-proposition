'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
                  </>
                )}

                {/* ログアウト */}
                {sessionInfo && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogoutClick} variant="destructive">
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

      {/* ログアウト確認ダイアログ */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ログアウト</DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                ログアウトすると、現在の学習状況は提出され、セッションが終了します。
              </p>
              <p className="font-medium text-destructive">
                再度ログインすることはできません。新しいセッションとして開始されます。
              </p>
              <p>
                ログアウトしますか？
              </p>
            </DialogDescription>
          </DialogHeader>
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


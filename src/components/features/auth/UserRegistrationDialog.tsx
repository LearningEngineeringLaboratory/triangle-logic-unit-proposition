'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { logUserRegistered, logSessionCreated } from '@/lib/logging'
import { setUserIdClient } from '@/lib/session-client'

interface UserRegistrationDialogProps {
  open: boolean
  onSuccess: (userId: string, sessionId: string, userName: string, userStudentId: string) => void
}

export function UserRegistrationDialog({
  open,
  onSuccess,
}: UserRegistrationDialogProps) {
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showGuestConfirmDialog, setShowGuestConfirmDialog] = useState(false)

  const generateGuestCredentials = () => {
    // 日時をYYYYMMDDHHmmss形式で取得
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`
    
    const guestStudentId = `unknownuser${timestamp}`
    return {
      studentId: guestStudentId,
      name: guestStudentId, // 学籍番号と同一
    }
  }

  const handleGuestStartClick = () => {
    setShowGuestConfirmDialog(true)
  }

  const handleGuestStart = async () => {
    setShowGuestConfirmDialog(false)
    setError(null)
    setIsLoading(true)

    try {
      const { studentId: guestStudentId, name: guestName } = generateGuestCredentials()

      // ユーザー登録（常に新規ユーザーを作成）
      const registerRes = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: guestName, student_id: guestStudentId }),
      })

      const registerData = await registerRes.json()

      if (!registerData.success) {
        throw new Error(registerData.error || 'ユーザー登録に失敗しました')
      }

      const userId = registerData.data.user_id
      const userName = registerData.data.name

      // ユーザーIDをlocalStorageに保存
      setUserIdClient(userId)

      // ログ記録
      await logUserRegistered({
        name: userName,
        studentId: guestStudentId,
        userId,
      })

      // セッション作成
      const sessionRes = await fetch('/api/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      })

      const sessionData = await sessionRes.json()

      if (!sessionData.success) {
        throw new Error('セッション作成に失敗しました')
      }

      const sessionId = sessionData.data.session_id

      // ログ記録
      await logSessionCreated({
        sessionId,
        userId,
      })

      onSuccess(userId, sessionId, userName, guestStudentId)
    } catch (err) {
      console.error('Guest registration error:', err)
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const trimmedName = name.trim()
      const trimmedStudentId = studentId.trim()

      // バリデーション
      if (!trimmedName) {
        throw new Error('名前を入力してください')
      }
      if (!trimmedStudentId) {
        throw new Error('学籍番号を入力してください')
      }
      if (!/^[A-Za-z0-9]+$/.test(trimmedStudentId)) {
        throw new Error('学籍番号は半角英数字で入力してください')
      }

      // ユーザー登録（常に新規ユーザーを作成）
      const registerRes = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, student_id: trimmedStudentId }),
      })

      const registerData = await registerRes.json()

      if (!registerData.success) {
        throw new Error(registerData.error || 'ユーザー登録に失敗しました')
      }

      const userId = registerData.data.user_id
      const userName = registerData.data.name

      // ユーザーIDをlocalStorageに保存
      setUserIdClient(userId)

      // ログ記録
      await logUserRegistered({
        name: userName,
        studentId: trimmedStudentId,
        userId,
      })

      // セッション作成
      const sessionRes = await fetch('/api/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      })

      const sessionData = await sessionRes.json()

      if (!sessionData.success) {
        throw new Error('セッション作成に失敗しました')
      }

      const sessionId = sessionData.data.session_id

      // ログ記録
      await logSessionCreated({
        sessionId,
        userId,
      })

      onSuccess(userId, sessionId, userName, trimmedStudentId)
    } catch (err) {
      console.error('Registration error:', err)
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]" showCloseButton={false}>
        <DialogHeader className="mb-4">
          <DialogTitle>ユーザー登録</DialogTitle>
          <DialogDescription className="mt-2">
            学籍番号（半角英数字）と名前を入力してください。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="studentId">学籍番号</Label>
            <Input
              id="studentId"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="（例）M123456"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">名前</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="（例）三角　ロジ郎"
              required
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="text-sm text-destructive mt-2">{error}</div>
          )}
          <div className="flex flex-col gap-3 pt-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '処理中...' : '開始する'}
            </Button>
            <button
              type="button"
              className="w-full text-center text-sm text-muted-foreground underline underline-offset-4 hover:text-muted-foreground/80 disabled:opacity-50 disabled:cursor-not-allowed py-2"
              onClick={handleGuestStartClick}
              disabled={isLoading}
            >
              ユーザー登録をせずに開始する
            </button>
          </div>
        </form>
      </DialogContent>

      {/* ゲスト開始確認ダイアログ */}
      <Dialog open={showGuestConfirmDialog} onOpenChange={setShowGuestConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ユーザー登録をせずに開始しますか？</DialogTitle>
            <DialogDescription>
              ゲストユーザーとして開始します。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGuestConfirmDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={handleGuestStart} disabled={isLoading}>
              {isLoading ? '処理中...' : '開始する'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}


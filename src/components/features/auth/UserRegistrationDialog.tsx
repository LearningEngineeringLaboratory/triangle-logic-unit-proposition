'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  const [checkingExisting, setCheckingExisting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      let userId: string
      let userName: string
      let isNewUser = false

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

      setCheckingExisting(true)

      // 1. 既存ユーザーとしてログインを試行
      const loginRes = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: trimmedStudentId, name: trimmedName }),
      })

      const loginData = await loginRes.json()

      if (loginData.success) {
        userId = loginData.data.user_id
        userName = loginData.data.name
      } else if (loginData.error === 'user_not_found') {
        // 2. ユーザーが存在しない場合は新規登録
        const registerRes = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: trimmedName, student_id: trimmedStudentId }),
        })

        const registerData = await registerRes.json()

        if (!registerData.success) {
          throw new Error(registerData.error || 'ユーザー登録に失敗しました')
        }

        userId = registerData.data.user_id
        userName = registerData.data.name
        isNewUser = registerData.data.isNewUser
      } else if (loginData.error === 'name_mismatch') {
        throw new Error('学籍番号と名前が一致しません')
      } else {
        throw new Error(loginData.error || 'ログインに失敗しました')
      }

      // ユーザーIDをlocalStorageに保存
      setUserIdClient(userId)

      // ログ記録（新規ユーザーの場合のみ）
      if (isNewUser) {
        await logUserRegistered({
          name: userName,
          studentId: trimmedStudentId,
          userId,
        })
      }

      setCheckingExisting(false)

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
      console.error('Registration/Login error:', err)
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      setIsLoading(false)
      setCheckingExisting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ユーザー登録/ログイン</DialogTitle>
          <DialogDescription>
            研究目的の教育アプリです。学籍番号（半角英数字）と名前を入力してください。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentId">学籍番号</Label>
            <Input
              id="studentId"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="学籍番号（半角英数字）"
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
              placeholder="山田太郎"
              required
              disabled={isLoading}
            />
            {checkingExisting && (
              <p className="text-xs text-muted-foreground">確認中...</p>
            )}
          </div>
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading || checkingExisting}>
            {isLoading ? '処理中...' : '開始する'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}


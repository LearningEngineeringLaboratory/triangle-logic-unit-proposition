'use client'

import { useState, useEffect } from 'react'
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
  onSuccess: (userId: string, sessionId: string, userName: string, userEmail: string) => void
}

export function UserRegistrationDialog({
  open,
  onSuccess,
}: UserRegistrationDialogProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExistingUser, setIsExistingUser] = useState(false)
  const [existingUserName, setExistingUserName] = useState<string | null>(null)
  const [checkingEmail, setCheckingEmail] = useState(false)

  // メールアドレスが変更されたら既存ユーザーをチェック
  useEffect(() => {
    const checkExistingUser = async () => {
      if (!email || !email.includes('@')) {
        setIsExistingUser(false)
        setExistingUserName(null)
        return
      }

      setCheckingEmail(true)
      try {
        const loginRes = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })

        const loginData = await loginRes.json()

        if (loginData.success && loginData.data) {
          setIsExistingUser(true)
          setExistingUserName(loginData.data.name)
        } else {
          setIsExistingUser(false)
          setExistingUserName(null)
        }
      } catch {
        setIsExistingUser(false)
        setExistingUserName(null)
      } finally {
        setCheckingEmail(false)
      }
    }

    // デバウンス処理（500ms待機）
    const timeoutId = setTimeout(checkExistingUser, 500)
    return () => clearTimeout(timeoutId)
  }, [email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      let userId: string
      let userName: string
      let isNewUser = false

      if (isExistingUser && existingUserName) {
        // 既存ユーザーの場合：メールアドレスのみでログイン
        const loginRes = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })

        const loginData = await loginRes.json()

        if (!loginData.success) {
          throw new Error(loginData.error || 'ログインに失敗しました')
        }

        userId = loginData.data.user_id
        userName = loginData.data.name
      } else {
        // 新規ユーザーの場合：名前とメールアドレスで登録
        // 既存ユーザー検出中の場合、少し待つ
        if (checkingEmail) {
          throw new Error('ユーザー情報を確認中です。しばらくお待ちください。')
        }

        // 名前のバリデーション（既存ユーザーでない場合のみ）
        if (!isExistingUser && (!name || name.trim() === '')) {
          throw new Error('名前を入力してください')
        }

        const registerRes = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email }),
        })

        const registerData = await registerRes.json()

        if (!registerData.success) {
          throw new Error(registerData.error || 'ユーザー登録に失敗しました')
        }

        userId = registerData.data.user_id
        userName = registerData.data.name
        isNewUser = registerData.data.isNewUser
      }

      // ユーザーIDをlocalStorageに保存
      setUserIdClient(userId)

      // ログ記録（新規ユーザーの場合のみ）
      if (isNewUser) {
        await logUserRegistered({
          name: userName,
          email,
          userId,
        })
      }

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

      onSuccess(userId, sessionId, userName, email)
    } catch (err) {
      console.error('Registration/Login error:', err)
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ユーザー登録/ログイン</DialogTitle>
          <DialogDescription>
            研究目的の教育アプリです。メールアドレスを入力してください。
            {isExistingUser && existingUserName && (
              <span className="block mt-2 text-primary font-medium">
                既存ユーザー「{existingUserName}」としてログインしますか？
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isExistingUser && (
            <div className="space-y-2">
              <Label htmlFor="name">名前</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="山田太郎"
                required={!isExistingUser}
                disabled={isLoading || checkingEmail}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@example.com"
              required
              disabled={isLoading}
            />
            {checkingEmail && (
              <p className="text-xs text-muted-foreground">確認中...</p>
            )}
          </div>
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading || checkingEmail}>
            {isLoading
              ? isExistingUser
                ? 'ログイン中...'
                : '登録中...'
              : isExistingUser
                ? 'ログインして開始'
                : '登録して開始'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}


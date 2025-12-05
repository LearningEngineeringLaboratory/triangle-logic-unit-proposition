'use client'

import { useState, useEffect, useCallback } from 'react'
import { logSessionRestored } from '@/lib/logging'
import { setUserIdClient } from '@/lib/session-client'

interface SessionInfo {
  sessionId: string
  userId: string
  userName: string
  userStudentId: string
}

export function useSession() {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [needsRegistration, setNeedsRegistration] = useState(false)

  const checkSession = useCallback(async () => {
    setIsLoading(true)
    try {
      // セッション復帰を試行
      const res = await fetch('/api/session/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (data.success && data.data) {
        // セッションが有効
        const session = data.data
        setUserIdClient(session.user.user_id)
        setSessionInfo({
          sessionId: session.session_id,
          userId: session.user.user_id,
          userName: session.user.name,
          userStudentId: session.user.student_id,
        })
        setNeedsRegistration(false)

        // ログ記録
        await logSessionRestored({
          sessionId: session.session_id,
          userId: session.user.user_id,
        })
      } else {
        // セッションがない、または期限切れ
        setNeedsRegistration(true)
        setSessionInfo(null)
      }
    } catch (err) {
      console.error('Session check error:', err)
      setNeedsRegistration(true)
      setSessionInfo(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleRegistrationSuccess = useCallback(
    (userId: string, sessionId: string, userName: string, userStudentId: string) => {
      setSessionInfo({
        sessionId,
        userId,
        userName,
        userStudentId,
      })
      setNeedsRegistration(false)
    },
    []
  )

  useEffect(() => {
    checkSession()
  }, [checkSession])

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/session/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      
      // localStorageからも削除
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user_id')
      }
      
      setSessionInfo(null)
      setNeedsRegistration(true)
      
      // ページをリロードしてセッション状態をリセット
      window.location.href = '/problems'
    } catch (err) {
      console.error('Logout error:', err)
    }
  }, [])

  return {
    sessionInfo,
    isLoading,
    needsRegistration,
    handleRegistrationSuccess,
    handleLogout,
    refreshSession: checkSession,
  }
}


import { useCallback } from 'react'

interface UseResetAllOptions {
  sessionInfo: { sessionId: string; userId: string; userName: string; userEmail: string } | null
  onSuccess?: () => void
}

export function useResetAll({ sessionInfo, onSuccess }: UseResetAllOptions) {
  const handleResetAll = useCallback(async () => {
    if (!sessionInfo) return

    try {
      const res = await fetch('/api/response/reset-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      
      if (data.success) {
        // ページをリロードして状態を更新
        if (onSuccess) {
          onSuccess()
        } else {
          window.location.reload()
        }
      }
    } catch (err) {
      console.error('Error resetting all completions:', err)
    }
  }, [sessionInfo, onSuccess])

  return { handleResetAll }
}


import { useEffect, useState } from 'react'
import { ProblemDetail } from '@/lib/types'
import { logAttemptStarted, logAttemptFinished } from '@/lib/logging'

interface UseProblemAttemptOptions {
  problem: ProblemDetail | null
  sessionInfo: { sessionId: string; userId: string } | null
  isSessionLoading: boolean
  onComplete?: (attemptId: string) => void
}

export function useProblemAttempt({ 
  problem, 
  sessionInfo, 
  isSessionLoading,
  onComplete 
}: UseProblemAttemptOptions) {
  const [attemptId, setAttemptId] = useState<string | null>(null)

  // attemptを開始
  useEffect(() => {
    async function startAttempt() {
      if (isSessionLoading) {
        console.log('[debug] Waiting for session info to load...')
        return
      }

      if (!sessionInfo || !problem) {
        console.warn('[warn] Cannot start attempt - missing sessionInfo or problem:', { 
          sessionInfo: !!sessionInfo, 
          problem: !!problem 
        })
        return
      }

      const sessionId = sessionInfo.sessionId
      const userId = sessionInfo.userId
      console.log('[debug] Attempt start:', { sessionId, userId, problemId: problem.problem_id })
      
      if (sessionId && userId) {
        try {
          const attemptRes = await fetch('/api/attempt/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: sessionId,
              user_id: userId,
              problem_id: problem.problem_id,
            }),
          })
          const attemptData = await attemptRes.json()
          console.log('[debug] Attempt start response:', attemptData)
          if (attemptData.success && attemptData.data) {
            const newAttemptId = attemptData.data.attempt_id
            setAttemptId(newAttemptId)
            await logAttemptStarted({
              attemptId: newAttemptId,
              problemId: problem.problem_id,
              sessionId,
              userId,
            })
            if (onComplete) {
              onComplete(newAttemptId)
            }
          } else {
            console.error('[error] Failed to start attempt:', attemptData.error || 'Unknown error', attemptData)
          }
        } catch (err) {
          console.error('[error] Failed to start attempt (exception):', err)
        }
      } else {
        console.warn('[warn] Cannot start attempt - missing sessionId or userId:', { sessionId, userId })
      }
    }

    startAttempt()
  }, [sessionInfo, problem, isSessionLoading, onComplete])

  const finishAttempt = async (success: boolean) => {
    if (!attemptId || !sessionInfo || !problem) return

    const sessionId = sessionInfo.sessionId
    const userId = sessionInfo.userId

    await logAttemptFinished({
      attemptId,
      problemId: problem.problem_id,
      success,
      sessionId,
      userId,
    })
    
    await fetch('/api/attempt/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attempt_id: attemptId,
        success,
      }),
    }).catch((err) => {
      console.error('Failed to finish attempt:', err)
    })
  }

  return { attemptId, finishAttempt }
}


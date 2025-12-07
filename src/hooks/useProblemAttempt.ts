import { useEffect, useState, useRef } from 'react'
import { ProblemDetail } from '@/lib/types'
import { logAttemptStarted, logAttemptFinished } from '@/lib/logging'

interface UseProblemAttemptOptions {
  problem: ProblemDetail | null
  sessionInfo: { sessionId: string; userId: string } | null
  isSessionLoading: boolean
  onComplete?: (attemptId: string) => void
}

// グローバルなリクエストフラグ（問題IDごとに管理）
const globalAttemptStarting = new Map<string, boolean>()

export function useProblemAttempt({ 
  problem, 
  sessionInfo, 
  isSessionLoading,
  onComplete 
}: UseProblemAttemptOptions) {
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const isStartingRef = useRef(false)

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
      const problemId = problem.problem_id
      
      // 既に開始中の場合はスキップ
      if (isStartingRef.current || globalAttemptStarting.get(problemId)) {
        console.log('[debug] Attempt start already in progress, skipping...')
        return
      }
      
      isStartingRef.current = true
      globalAttemptStarting.set(problemId, true)
      
      console.log('[debug] Attempt start:', { sessionId, userId, problemId })
      
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
        } finally {
          isStartingRef.current = false
          if (problem) {
            globalAttemptStarting.set(problem.problem_id, false)
          }
        }
      } else {
        console.warn('[warn] Cannot start attempt - missing sessionId or userId:', { sessionId, userId })
        isStartingRef.current = false
        if (problem) {
          globalAttemptStarting.set(problem.problem_id, false)
        }
      }
    }

    startAttempt()
  }, [sessionInfo, problem, isSessionLoading, onComplete])

  const updateCurrentStep = async (currentStep: number) => {
    if (!attemptId) return

    try {
      await fetch('/api/attempt/update-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attempt_id: attemptId,
          current_step: currentStep,
        }),
      }).catch((err) => {
        console.error('Failed to update current step:', err)
      })
    } catch (err) {
      console.error('Failed to update current step (exception):', err)
    }
  }

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

  return { attemptId, updateCurrentStep, finishAttempt }
}


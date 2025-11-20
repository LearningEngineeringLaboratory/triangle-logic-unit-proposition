import { ulid } from 'ulid'
import { cookies } from 'next/headers'

export interface SessionInfo {
  session_id: string
  user_id: string
}

/**
 * セッションIDをCookieから取得
 */
export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('session_id')?.value ?? null
}

/**
 * セッションIDをCookieに設定
 */
export async function setSessionId(sessionId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('session_id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24時間
    path: '/',
  })
}

/**
 * セッションIDをCookieから削除
 */
export async function clearSessionId(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session_id')
}

/**
 * ULIDを生成
 */
export function generateUlid(): string {
  return ulid()
}


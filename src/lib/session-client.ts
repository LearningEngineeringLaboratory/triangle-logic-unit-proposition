'use client'

/**
 * クライアント側でセッションIDを取得（Cookieから）
 */
export function getSessionIdClient(): string | null {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'session_id') {
      return decodeURIComponent(value)
    }
  }
  return null
}

/**
 * クライアント側でユーザーIDを取得（localStorageから）
 * 注意: セキュリティのため、本番環境ではサーバー側で管理すべき
 */
export function getUserIdClient(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('user_id')
}

/**
 * クライアント側でユーザーIDを保存（localStorage）
 */
export function setUserIdClient(userId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('user_id', userId)
}


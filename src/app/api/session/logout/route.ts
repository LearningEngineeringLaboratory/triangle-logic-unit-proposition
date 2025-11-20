import { NextResponse } from 'next/server'
import { clearSessionId } from '@/lib/session'

export async function POST() {
  try {
    // CookieからセッションIDを削除
    await clearSessionId()

    return NextResponse.json({
      success: true,
    })
  } catch (err) {
    console.error('Logout route error:', err)
    return NextResponse.json(
      { success: false, error: 'server_error' },
      { status: 500 }
    )
  }
}


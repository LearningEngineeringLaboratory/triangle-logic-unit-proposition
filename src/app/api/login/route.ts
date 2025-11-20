import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

interface LoginBody {
  email: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LoginBody

    // バリデーション
    if (!body.email) {
      return NextResponse.json(
        { success: false, error: 'email is required' },
        { status: 400 }
      )
    }

    // メールアドレスの形式チェック（簡易）
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'invalid email format' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // 既存ユーザーを検索
    const { data: existingUser, error: searchError } = await supabase
      .from('users')
      .select('user_id, name, email')
      .eq('email', body.email)
      .single()

    if (searchError && searchError.code !== 'PGRST116') {
      // PGRST116は「行が見つからない」エラー（正常）
      console.error('User search error:', searchError)
      return NextResponse.json(
        { success: false, error: 'database_error' },
        { status: 500 }
      )
    }

    // 既存ユーザーが見つからない場合
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'user_not_found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        user_id: existingUser.user_id,
        name: existingUser.name,
        email: existingUser.email,
      },
    })
  } catch (err) {
    console.error('Login route error:', err)
    return NextResponse.json(
      { success: false, error: 'server_error' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { generateUlid } from '@/lib/session'

interface RegisterBody {
  name: string
  email: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegisterBody

    // バリデーション
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: 'name and email are required' },
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

    // 既存ユーザーの場合
    if (existingUser) {
      return NextResponse.json({
        success: true,
        data: {
          user_id: existingUser.user_id,
          name: existingUser.name,
          email: existingUser.email,
          isNewUser: false,
        },
      })
    }

    // 新規ユーザーを作成
    const userId = generateUlid()
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        user_id: userId,
        name: body.name,
        email: body.email,
      })
      .select('user_id, name, email')
      .single()

    if (insertError) {
      console.error('User creation error:', insertError)
      return NextResponse.json(
        { success: false, error: 'user_creation_failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        user_id: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
        isNewUser: true,
      },
    })
  } catch (err) {
    console.error('Register route error:', err)
    return NextResponse.json(
      { success: false, error: 'server_error' },
      { status: 500 }
    )
  }
}


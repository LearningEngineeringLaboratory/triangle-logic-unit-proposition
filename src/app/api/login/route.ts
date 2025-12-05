import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

interface LoginBody {
  student_id: string
  name: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LoginBody

    // バリデーション
    if (!body.student_id || !body.name) {
      return NextResponse.json(
        { success: false, error: 'student_id and name are required' },
        { status: 400 }
      )
    }

    // 学籍番号の形式チェック（半角英数字）
    const studentIdRegex = /^[A-Za-z0-9]+$/
    if (!studentIdRegex.test(body.student_id)) {
      return NextResponse.json(
        { success: false, error: 'invalid student_id format' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // 既存ユーザーを検索
    const { data: existingUser, error: searchError } = await supabase
      .from('users')
      .select('user_id, name, student_id')
      .eq('student_id', body.student_id)
      .single()

    if (searchError && searchError.code !== 'PGRST116') {
      // PGRST116は「行が見つからない」エラー（正常）
      console.error('User search error:', searchError)
      return NextResponse.json(
        { success: false, error: 'database_error' },
        { status: 500 }
      )
    }

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'user_not_found' },
        { status: 404 }
      )
    }

    // 名前が一致するかチェック
    if (existingUser.name !== body.name) {
      return NextResponse.json(
        { success: false, error: 'name_mismatch' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        user_id: existingUser.user_id,
        name: existingUser.name,
        student_id: existingUser.student_id,
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


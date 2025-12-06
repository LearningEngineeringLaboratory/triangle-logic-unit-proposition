import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { generateUlid } from '@/lib/session'

interface RegisterBody {
  name: string
  student_id: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegisterBody

    // バリデーション
    if (!body.name || !body.student_id) {
      return NextResponse.json(
        { success: false, error: 'name and student_id are required' },
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

    // 新規ユーザーを作成
    const userId = generateUlid()
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        user_id: userId,
        name: body.name,
        student_id: body.student_id,
      })
      .select('user_id, name, student_id')
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
        student_id: newUser.student_id,
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


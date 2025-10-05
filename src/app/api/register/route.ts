import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { ApiResponse, RegisterRequestBody, RegisterResponse } from '@/lib/types'
import { ulid } from 'ulid'

export async function POST(req: NextRequest) {
  const body = (await req.json()) as RegisterRequestBody
  const name = body?.name?.trim()
  const email = body?.email?.trim().toLowerCase()

  if (!name || !email) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: 'invalid_request' }, { status: 400 })
  }

  // 既存ユーザー検索
  const { data: existing, error: selectError } = await supabase
    .from('users')
    .select('user_id, name, email')
    .eq('email', email)
    .maybeSingle()

  if (selectError) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: 'db_error' }, { status: 500 })
  }

  if (existing) {
    const res: RegisterResponse = {
      user_id: existing.user_id,
      name: existing.name,
      email: existing.email,
      isNewUser: false,
    }
    return NextResponse.json<ApiResponse<RegisterResponse>>({ success: true, data: res })
  }

  // 新規作成
  const user_id = ulid()
  const { error: insertError } = await supabase
    .from('users')
    .insert({ user_id, name, email })

  if (insertError) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: 'db_error' }, { status: 500 })
  }

  const res: RegisterResponse = { user_id, name, email, isNewUser: true }
  return NextResponse.json<ApiResponse<RegisterResponse>>({ success: true, data: res })
}



import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { ApiResponse, RegisterRequestBody, RegisterResponse } from '@/lib/types'
import { ulid } from 'ulid'

export async function POST(req: NextRequest) {
  let body: RegisterRequestBody
  try {
    body = (await req.json()) as RegisterRequestBody
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: 'invalid_request' }, { status: 400 })
  }
  const name = body?.name?.trim()
  const email = body?.email?.trim().toLowerCase()

  if (!name || !email) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: 'invalid_request' }, { status: 400 })
  }

  // 既存ユーザー検索
  const supabaseClient = supabase
  const { data: existing, error: selectError } = await supabaseClient
    .from('users')
    .select('user_id, name, email')
    .eq('email', email)
    .maybeSingle()

  if (selectError) {
    const detail = process.env.NODE_ENV !== 'production' ? selectError.message : undefined
    return NextResponse.json({ success: false, error: 'db_error_select', detail }, { status: 500 })
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
  const { error: insertError } = await supabaseClient
    .from('users')
    .insert({ user_id, name, email })

  if (insertError) {
    const detail = process.env.NODE_ENV !== 'production' ? insertError.message : undefined
    return NextResponse.json({ success: false, error: 'db_error_insert', detail }, { status: 500 })
  }

  const res: RegisterResponse = { user_id, name, email, isNewUser: true }
  return NextResponse.json<ApiResponse<RegisterResponse>>({ success: true, data: res })
}



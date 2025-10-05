import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { ApiResponse, RegisterRequestBody, RegisterResponse } from '@/lib/types'

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

  const { data: existing, error: selectError } = await supabase
    .from('users')
    .select('user_id, name, email')
    .eq('email', email)
    .maybeSingle()

  if (selectError) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: 'db_error_select' }, { status: 500 })
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

  // user_idはクライアント/サーバどちらでもULID生成できるが、DB側で作らないためここではINSERT時に指定しない
  // 既存スキーマではuser_idはPKで外部生成が必要なため、ここでは簡易にランダムULID相当を使用せず、フロント導線で後続を補う
  // 実運用ではULIDを生成してINSERTするのが前提
  const user_id = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`)
  const { error: insertError } = await supabase
    .from('users')
    .insert({ user_id, name, email })

  if (insertError) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: 'db_error_insert' }, { status: 500 })
  }

  const res: RegisterResponse = { user_id, name, email, isNewUser: true }
  return NextResponse.json<ApiResponse<RegisterResponse>>({ success: true, data: res })
}



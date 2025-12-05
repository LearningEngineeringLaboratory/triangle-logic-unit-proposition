import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { generateUlid } from '@/lib/session'

interface StartAttemptBody {
  session_id: string
  user_id: string
  problem_id: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as StartAttemptBody

    if (!body.session_id || !body.user_id || !body.problem_id) {
      return NextResponse.json(
        { success: false, error: 'session_id, user_id, and problem_id are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // 既存の進行中attemptを確認
    const { data: existingAttempt, error: checkError } = await supabase
      .from('attempts')
      .select('attempt_id')
      .eq('session_id', body.session_id)
      .eq('user_id', body.user_id)
      .eq('problem_id', body.problem_id)
      .eq('status', 'in_progress')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116は「行が見つからない」エラー（正常）
      console.error('[error] Error checking existing attempt:', checkError)
    }

    if (!checkError && existingAttempt) {
      // 既存のattemptを返す
      console.log('[info] Using existing attempt:', existingAttempt.attempt_id)
      return NextResponse.json({
        success: true,
        data: { attempt_id: existingAttempt.attempt_id },
      })
    }

    // 新しいattemptを作成
    const attemptId = generateUlid()
    const attemptData = {
      attempt_id: attemptId,
      session_id: body.session_id,
      user_id: body.user_id,
      problem_id: body.problem_id,
      started_at: new Date().toISOString(),
      status: 'in_progress' as const,
      current_step: 1, // 初期ステップは1
    }
    
    console.log('[debug] Creating attempt:', attemptData)
    
    const { data: attempt, error: insertError } = await supabase
      .from('attempts')
      .insert(attemptData)
      .select('attempt_id, session_id, user_id, problem_id, started_at, status, current_step')
      .single()

    if (insertError) {
      console.error('[error] Attempt creation error:', insertError, 'Attempt data:', attemptData)
      return NextResponse.json(
        { success: false, error: 'attempt_creation_failed', details: insertError.message },
        { status: 500 }
      )
    }

    console.log('[success] Attempt created:', attemptId)
    return NextResponse.json({
      success: true,
      data: attempt,
    })
  } catch (err) {
    console.error('Start attempt route error:', err)
    return NextResponse.json(
      { success: false, error: 'server_error' },
      { status: 500 }
    )
  }
}


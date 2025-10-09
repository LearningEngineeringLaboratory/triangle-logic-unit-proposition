import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

interface CheckStepBody {
  problemId: string
  stepNumber: 1 | 2 | 3
  state: any // DB形式（snake_case, ハイフンキー含む）かUI形式でも許容し内部で補正
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckStepBody
    const { problemId, stepNumber } = body

    if (!problemId || !stepNumber) {
      return NextResponse.json({ error: 'invalid_params' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data: problem, error } = await supabase
      .from('problems')
      .select('problem_id, steps')
      .eq('problem_id', problemId)
      .single()

    if (error || !problem) {
      return NextResponse.json({ error: 'problem_not_found' }, { status: 404 })
    }

    const steps = problem.steps || {}
    const rubric = steps[`step${stepNumber}`]?.rubric
    if (!rubric) {
      return NextResponse.json({ error: 'rubric_not_found' }, { status: 422 })
    }

    const correct = rubric.correct_answer
    let isCorrect = false

    // 受領stateはDB形式前提で比較（UI形式が来た場合に最低限補正）
    const incoming = normalizeStateFragment(stepNumber, body.state)

    if (stepNumber === 1) {
      isCorrect = Boolean(
        incoming?.antecedent === correct?.antecedent &&
          incoming?.consequent === correct?.consequent
      )
    } else if (stepNumber === 2) {
      const impossible = Boolean(incoming?.impossible)
      const correctImpossible = Boolean(correct?.impossible)
      console.log('[check-step][step2] incoming=', incoming)
      console.log('[check-step][step2] correct=', correct)
      console.log('[check-step][step2] impossible=', impossible, 'correctImpossible=', correctImpossible)
      if (impossible) {
        isCorrect = correctImpossible === true
      } else {
        const incLinks = incoming?.link_directions || {}
        const corLinks = correct?.link_directions || {}
        console.log('[check-step][step2] compare', {
          premiseIncoming: incoming?.premise,
          premiseCorrect: correct?.premise,
          incAnte: incLinks['antecedent-link'],
          corAnte: corLinks['antecedent-link'],
          incCons: incLinks['consequent-link'],
          corCons: corLinks['consequent-link'],
        })
        isCorrect = Boolean(
          correctImpossible === false &&
            incoming?.premise === correct?.premise &&
            incLinks['antecedent-link'] === corLinks['antecedent-link'] &&
            incLinks['consequent-link'] === corLinks['consequent-link']
        )
      }
    } else if (stepNumber === 3) {
      const left = {
        inference_type: incoming?.inference_type,
        validity: normalizeValidity(incoming?.validity),
      }
      const right = {
        inference_type: correct?.inference_type,
        validity: normalizeValidity(correct?.validity),
      }
      console.log('[check-step][step3] compare', { incoming: left, correct: right })
      isCorrect = Boolean(left.inference_type === right.inference_type && left.validity === right.validity)
    }

    return NextResponse.json({ isCorrect })
  } catch (err) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

function normalizeValidity(v: unknown): boolean | null {
  if (typeof v === 'boolean') return v
  if (v === '妥当') return true
  if (v === '非妥当') return false
  return null
}

function normalizeStateFragment(stepNumber: 1 | 2 | 3, incoming: any) {
  if (!incoming) return {}
  // 既にDB形式ならそのまま返す
  if (stepNumber === 1) {
    if ('antecedent' in incoming && 'consequent' in incoming) return incoming
    return incoming
  }
  if (stepNumber === 2) {
    // 既にDB形式ならそのまま返す
    if ('link_directions' in incoming || ('premise' in incoming && !('linkDirections' in incoming))) {
      return incoming
    }
    // UI形式: { impossible, premise, linkDirections: { antecedentLink, consequentLink } }
    if ('linkDirections' in incoming || 'impossible' in incoming) {
      const links = incoming.linkDirections
      return {
        impossible: !!incoming.impossible,
        premise: incoming.premise,
        link_directions: links
          ? {
              'antecedent-link': !!links.antecedentLink,
              'consequent-link': !!links.consequentLink,
            }
          : undefined,
      }
    }
    return incoming
  }
  if (stepNumber === 3) {
    // 既にDB形式ならそのまま返す
    if ('inference_type' in incoming || (typeof incoming?.validity === 'boolean' && !('inferenceType' in incoming))) {
      return incoming
    }
    // UI形式: { inferenceType, validity }
    if ('inferenceType' in incoming || 'validity' in incoming) {
      return {
        inference_type: incoming.inferenceType,
        validity: normalizeValidity(incoming.validity),
      }
    }
    return incoming
  }
}



import { supabase } from '@/lib/supabase'
import { Problem, ProblemSet, ProblemSetItem } from '@/lib/types'

export interface ProblemDetail extends Problem {
  correct_answers: any // JSONB形式の正解データ
  options?: string[]
}

export async function getProblems(): Promise<Problem[]> {
  try {
    // problemsテーブルから基本情報を取得
    const { data: problems, error: problemsError } = await supabase
      .from('problems')
      .select('problem_id, title, argument, correct_answers')
      .order('problem_id')

    if (problemsError) {
      console.error('Error fetching problems:', problemsError)
      return []
    }

    if (!problems || problems.length === 0) {
      return []
    }

    // 進捗情報を取得（現在はセッション情報がないため、プレースホルダー）
    // TODO: セッション情報に基づいて実際の進捗を取得
    const problemsWithProgress = problems.map(problem => ({
      ...problem,
      completed_steps: 0 // 仮の値
    }))

    return problemsWithProgress
  } catch (error) {
    console.error('Unexpected error in getProblems:', error)
    return []
  }
}

export async function getProblem(problemId: string): Promise<ProblemDetail | null> {
  try {
    const { data: problem, error } = await supabase
      .from('problems')
      .select('problem_id, title, argument, correct_answers, options')
      .eq('problem_id', problemId)
      .single()

    if (error) {
      console.error('Error fetching problem:', error)
      return null
    }

    if (!problem) {
      return null
    }

    return problem as ProblemDetail
  } catch (error) {
    console.error('Unexpected error in getProblem:', error)
    return null
  }
}

// 問題セット関連の関数

export async function getProblemSets(): Promise<ProblemSet[]> {
  try {
    const { data: problemSets, error } = await supabase
      .from('problem_sets')
      .select('set_id, name, description, version, is_active, created_at')
      .eq('is_active', true)
      .order('created_at')

    if (error) {
      console.error('Error fetching problem sets:', error)
      return []
    }

    return problemSets || []
  } catch (error) {
    console.error('Unexpected error in getProblemSets:', error)
    return []
  }
}

export async function getProblemsBySet(setId: string): Promise<Problem[]> {
  try {
    const { data: problems, error } = await supabase
      .from('problem_set_items')
      .select(`
        order_index,
        problems!inner(
          problem_id,
          title,
          argument,
          correct_answers,
          options
        )
      `)
      .eq('set_id', setId)
      .order('order_index')

    if (error) {
      console.error('Error fetching problems by set:', error)
      return []
    }

    return problems?.map((item: any) => ({
      problem_id: item.problems.problem_id,
      title: item.problems.title,
      argument: item.problems.argument,
      correct_answers: item.problems.correct_answers,
      options: item.problems.options,
      completed_steps: 0 // 仮の値
    })) || []
  } catch (error) {
    console.error('Unexpected error in getProblemsBySet:', error)
    return []
  }
}

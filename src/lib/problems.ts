import { supabase } from '@/lib/supabase'
import { Problem } from '@/lib/types'

export interface ProblemDetail extends Problem {
  steps: any // JSONB形式のステップデータ
}

export async function getProblems(): Promise<Problem[]> {
  try {
    // problemsテーブルから基本情報を取得
    const { data: problems, error: problemsError } = await supabase
      .from('problems')
      .select('problem_id, title, argument, total_steps')
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
      .select('problem_id, title, argument, total_steps, steps')
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

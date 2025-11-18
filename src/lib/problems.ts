import { supabase } from '@/lib/supabase'
import { Problem, ProblemSet, ProblemDetail, CorrectAnswers } from '@/lib/types'

interface ProblemRow {
  problem_id: string
  argument: string
  correct_answers: CorrectAnswers | null
  options: string[] | null
}

interface ProblemSetItemRow {
  order_index: number
  problems: ProblemRow
}

export async function getProblems(): Promise<Problem[]> {
  try {
    // problemsテーブルから基本情報を取得
    const { data: problems, error: problemsError } = await supabase
      .from('problems')
      .select('problem_id, argument, correct_answers, options')
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
    const problemsWithProgress = problems.map((problem: ProblemRow) => {
      const totalSteps = problem.correct_answers ? Object.keys(problem.correct_answers).length : 3
      return {
        ...problem,
        correct_answers: problem.correct_answers ?? {},
        options: problem.options ?? [],
        total_steps: totalSteps,
        completed_steps: 0 // 仮の値
      }
    })

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
      .select('problem_id, argument, correct_answers, options')
      .eq('problem_id', problemId)
      .single()

    if (error) {
      console.error('Error fetching problem:', error)
      return null
    }

    if (!problem) {
      return null
    }

    // correct_answersからステップ数を動的に計算
    const totalSteps = problem.correct_answers ? Object.keys(problem.correct_answers).length : 3
    
    return {
      problem_id: problem.problem_id,
      argument: problem.argument,
      correct_answers: problem.correct_answers ?? {},
      options: problem.options ?? [],
      total_steps: totalSteps,
    }
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

    const typedItems = (problems ?? []) as unknown as ProblemSetItemRow[]

    return typedItems.map((item) => {
      const totalSteps = item.problems.correct_answers ? Object.keys(item.problems.correct_answers).length : 3
      return {
        problem_id: item.problems.problem_id,
        argument: item.problems.argument,
        correct_answers: item.problems.correct_answers ?? {},
        options: item.problems.options ?? [],
        order_index: item.order_index,
        total_steps: totalSteps,
        completed_steps: 0 // 仮の値
      }
    }) || []
  } catch (error) {
    console.error('Unexpected error in getProblemsBySet:', error)
    return []
  }
}

// 問題セット内の次の問題を取得
export async function getNextProblemInSet(setId: string, currentProblemId: string): Promise<Problem | null> {
  try {
    const { data: problems, error } = await supabase
      .from('problem_set_items')
      .select(`
        order_index,
        problems!inner(
          problem_id,
          argument,
          correct_answers,
          options
        )
      `)
      .eq('set_id', setId)
      .order('order_index')

    if (error) {
      console.error('Error fetching problems by set:', error)
      return null
    }

    const typedItems = (problems ?? []) as unknown as ProblemSetItemRow[]

    const problemsList = typedItems.map((item) => {
      const totalSteps = item.problems.correct_answers ? Object.keys(item.problems.correct_answers).length : 3
      return {
        problem_id: item.problems.problem_id,
        argument: item.problems.argument,
        correct_answers: item.problems.correct_answers ?? {},
        options: item.problems.options ?? [],
        order_index: item.order_index,
        total_steps: totalSteps,
        completed_steps: 0
      }
    }) || []

    // 現在の問題のインデックスを取得
    const currentIndex = problemsList.findIndex(p => p.problem_id === currentProblemId)
    
    // 次の問題を取得
    if (currentIndex !== -1 && currentIndex < problemsList.length - 1) {
      return problemsList[currentIndex + 1]
    }

    return null // 最後の問題の場合
  } catch (error) {
    console.error('Unexpected error in getNextProblemInSet:', error)
    return null
  }
}

// 問題セット内の現在の問題の順番を取得
export async function getCurrentProblemOrder(setId: string, problemId: string): Promise<number | null> {
  try {
    const { data: problem, error } = await supabase
      .from('problem_set_items')
      .select('order_index')
      .eq('set_id', setId)
      .eq('problem_id', problemId)
      .single()

    if (error) {
      console.error('Error fetching current problem order:', error)
      return null
    }

    return problem?.order_index || null
  } catch (error) {
    console.error('Unexpected error in getCurrentProblemOrder:', error)
    return null
  }
}

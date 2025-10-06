import { supabase } from '@/lib/supabase'
import { Problem } from '@/lib/types'

export async function getProblems(): Promise<Problem[]> {
  try {
    console.log('getProblems: Starting to fetch problems...')
    
    // problemsテーブルから基本情報を取得
    const { data: problems, error: problemsError } = await supabase
      .from('problems')
      .select('problem_id, title, argument, total_steps')
      .order('problem_id')

    console.log('getProblems: Supabase response:', { problems, problemsError })

    if (problemsError) {
      console.error('Error fetching problems:', problemsError)
      return []
    }

    if (!problems || problems.length === 0) {
      console.log('getProblems: No problems found')
      return []
    }

    // 進捗情報を取得（現在はセッション情報がないため、プレースホルダー）
    // TODO: セッション情報に基づいて実際の進捗を取得
    const problemsWithProgress = problems.map(problem => ({
      ...problem,
      completed_steps: 0 // 仮の値
    }))

    console.log('getProblems: Returning problems:', problemsWithProgress)
    return problemsWithProgress
  } catch (error) {
    console.error('Unexpected error in getProblems:', error)
    return []
  }
}

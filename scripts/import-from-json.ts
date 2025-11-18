#!/usr/bin/env tsx
/**
 * JSONファイルから問題データをSupabaseにインポートするスクリプト
 * 
 * 使用方法:
 *   npx tsx scripts/import-from-json.ts [JSONファイルパス]
 * 
 * 例:
 *   npx tsx scripts/import-from-json.ts data/problems/new-problems.json
 * 
 * 環境変数（オプション）:
 *   SUPABASE_URL: SupabaseプロジェクトのURL（未設定の場合はSupabase MCPを使用）
 *   SUPABASE_SERVICE_ROLE_KEY: Supabaseのサービスロールキー（未設定の場合はSupabase MCPを使用）
 * 
 * 注意: このスクリプトはSupabase MCPを使用するため、環境変数の設定は不要です
 */

import * as fs from 'fs'
import * as path from 'path'

// JSONファイルの読み込み
const jsonFilePath = process.argv[2] || path.join(__dirname, '../data/problems/new-problems.json')

if (!fs.existsSync(jsonFilePath)) {
  console.error(`❌ ファイルが見つかりません: ${jsonFilePath}`)
  console.error('\n使用方法:')
  console.error('  npx tsx scripts/import-from-json.ts [JSONファイルパス]')
  console.error('\n例:')
  console.error('  npx tsx scripts/import-from-json.ts data/problems/new-problems.json')
  process.exit(1)
}

const problemsData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'))

if (!Array.isArray(problemsData)) {
  console.error('❌ JSONファイルは配列形式である必要があります')
  process.exit(1)
}

console.log(`📋 読み込んだ問題数: ${problemsData.length}\n`)

// データの検証
const errors: string[] = []
problemsData.forEach((problem, index) => {
  const num = index + 1
  
  // 必須フィールドのチェック
  if (!problem.problem_id) {
    errors.push(`${num}. problem_id がありません`)
  }
  if (!problem.argument) {
    errors.push(`${num}. argument がありません`)
  }
  if (!problem.options || !Array.isArray(problem.options)) {
    errors.push(`${num}. options が配列形式ではありません`)
  }
  if (!problem.correct_answers) {
    errors.push(`${num}. correct_answers がありません`)
  } else {
    if (!problem.correct_answers.step1) {
      errors.push(`${num}. correct_answers.step1 がありません`)
    }
    if (!problem.correct_answers.step2) {
      errors.push(`${num}. correct_answers.step2 がありません`)
    } else if (!Array.isArray(problem.correct_answers.step2)) {
      errors.push(`${num}. correct_answers.step2 が配列形式ではありません`)
    }
    if (!problem.correct_answers.step3) {
      errors.push(`${num}. correct_answers.step3 がありません`)
    }
  }
  if (!problem.version) {
    errors.push(`${num}. version がありません`)
  }
})

if (errors.length > 0) {
  console.error('❌ データの検証エラー:')
  errors.forEach(err => console.error(`  - ${err}`))
  process.exit(1)
}

// 問題データの表示
console.log('📝 インポートする問題:')
problemsData.forEach((problem, index) => {
  console.log(`\n${index + 1}. ${problem.problem_id}`)
  console.log(`   論証文: ${problem.argument.substring(0, 60)}...`)
  console.log(`   選択肢: ${problem.options.join(', ')}`)
  console.log(`   Step2リンク数: ${problem.correct_answers.step2.length}`)
})

console.log('\n⚠️  このスクリプトはSupabase MCPを使用して問題を追加します')
console.log('   実際のインポートは、このチャットで以下のように依頼してください:\n')
console.log('   「data/problems/new-problems.json の内容をSupabaseに追加してください」\n')

// SQL文を生成（参考用）
const sqlStatements = problemsData.map(p => {
  const optionsJson = JSON.stringify(p.options)
  const correctAnswersJson = JSON.stringify(p.correct_answers)
  
  return `INSERT INTO problems (problem_id, argument, options, correct_answers, version)
VALUES (
  '${p.problem_id}',
  '${p.argument.replace(/'/g, "''")}',
  '${optionsJson}'::jsonb,
  '${correctAnswersJson}'::jsonb,
  '${p.version}'
)
ON CONFLICT (problem_id) DO UPDATE SET
  argument = EXCLUDED.argument,
  options = EXCLUDED.options,
  correct_answers = EXCLUDED.correct_answers,
  version = EXCLUDED.version,
  updated_at = NOW();`
})

console.log('📄 生成されたSQL文（参考）:')
console.log(sqlStatements.join('\n\n'))


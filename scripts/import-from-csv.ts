#!/usr/bin/env tsx
/**
 * CSVファイルから問題データをSupabaseにインポートするスクリプト
 * 
 * 使用方法:
 *   npx tsx scripts/import-from-csv.ts [CSVファイルパス]
 * 
 * 例:
 *   npx tsx scripts/import-from-csv.ts data/problems/problems.csv
 * 
 * 環境変数:
 *   SUPABASE_URL: SupabaseプロジェクトのURL
 *   SUPABASE_SERVICE_ROLE_KEY: Supabaseのサービスロールキー
 * 
 * CSVフォーマット:
 *   - ヘッダー行必須
 *   - カンマ区切り
 *   - 文字列内のカンマはダブルクォートで囲む
 *   - 詳細は data/problems/README.md を参照
 */

import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// .env.localファイルを読み込む
config({ path: path.join(__dirname, '../.env.local') })

// 真偽値文字列をbooleanに変換
function parseBoolean(value: string): boolean {
  const lower = value.toLowerCase().trim()
  return lower === 'true' || lower === '1' || lower === 'yes' || lower === 'y'
}

// オプション文字列を配列に変換（カンマ区切り）
function parseOptions(value: string): string[] {
  if (!value || value.trim() === '') return []
  return value.split(',').map(opt => opt.trim()).filter(opt => opt !== '')
}

// CSV行から問題データを構築
function buildProblemFromRow(headers: string[], row: string[]): any {
  const data: Record<string, string> = {}
  headers.forEach((header, index) => {
    data[header] = row[index] || ''
  })
  
  // 必須フィールドのチェック
  if (!data.problem_id || !data.argument || !data.version) {
    throw new Error('必須フィールド（problem_id, argument, version）が不足しています')
  }
  
  // optionsの構築
  const options = parseOptions(data.options || '')
  
  // correct_answersの構築
  const correctAnswers: any = {}
  
  // Step1
  if (data.step1_antecedent && data.step1_consequent) {
    correctAnswers.step1 = {
      antecedent: data.step1_antecedent.trim(),
      consequent: data.step1_consequent.trim()
    }
  }
  
  // Step2: リンクの配列形式 [{"to": "...", "from": "..."}]
  if (data.step2_links) {
    // リンクが指定されている場合
    const links = data.step2_links.split('|').map(link => {
      const [from, to] = link.split(',').map(s => s.trim())
      if (!from || !to) {
        throw new Error('step2_linksの形式が正しくありません（from,to形式で|区切り）')
      }
      return { from, to }
    }).filter(link => link.from && link.to)
    
    correctAnswers.step2 = links.length > 0 ? links : []
  } else {
    // リンクが指定されていない場合は空配列
    correctAnswers.step2 = []
  }
  
  // Step3: inference_typeのみ（validityとverificationは自動計算されるため不要）
  if (data.step3_inference_type) {
    correctAnswers.step3 = {
      inference_type: data.step3_inference_type.trim()
    }
  }
  
  // Step4とStep5は不要（Step1とStep2から自動計算される）
  
  return {
    problem_id: data.problem_id.trim(),
    argument: data.argument.trim(),
    options: options.length > 0 ? options : null,
    correct_answers: correctAnswers,
    version: data.version.trim()
  }
}

// メイン処理
async function main() {
  const csvFilePath = process.argv[2] || path.join(__dirname, '../data/problems/problems.csv')
  
  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ ファイルが見つかりません: ${csvFilePath}`)
    console.error('\n使用方法:')
    console.error('  npx tsx scripts/import-from-csv.ts [CSVファイルパス]')
    console.error('\n例:')
    console.error('  npx tsx scripts/import-from-csv.ts data/problems/problems.csv')
    process.exit(1)
  }
  
  // CSVファイルの読み込み
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8')
  
  // CSVパース（ヘッダー行を自動認識）
  const records = parse(csvContent, {
    columns: true, // 最初の行をヘッダーとして使用
    skip_empty_lines: true,
    trim: true,
    bom: true // BOMを自動除去
  }) as Record<string, string>[]
  
  if (records.length === 0) {
    console.error('❌ CSVファイルには少なくとも1行のデータが必要です')
    process.exit(1)
  }
  
  const headers = Object.keys(records[0])
  const dataRows = records
  
  console.log(`📋 読み込んだ問題数: ${dataRows.length}\n`)
  
  // データの検証と変換
  const problems: any[] = []
  const errors: string[] = []
  
  dataRows.forEach((row, index) => {
    const rowNum = index + 2 // ヘッダー行を考慮して+2
    try {
      // Record<string, string>を配列に変換
      const rowArray = headers.map(header => row[header] || '')
      const problem = buildProblemFromRow(headers, rowArray)
      problems.push(problem)
    } catch (error: any) {
      errors.push(`${rowNum}行目: ${error.message}`)
    }
  })
  
  if (errors.length > 0) {
    console.error('❌ データの検証エラー:')
    errors.forEach(err => console.error(`  - ${err}`))
    process.exit(1)
  }
  
  // 問題データの表示
  console.log('📝 インポートする問題:')
  problems.forEach((problem, index) => {
    console.log(`\n${index + 1}. ${problem.problem_id}`)
    console.log(`   論証文: ${problem.argument.substring(0, 60)}${problem.argument.length > 60 ? '...' : ''}`)
    console.log(`   選択肢: ${problem.options ? problem.options.join(', ') : '(なし)'}`)
    console.log(`   ステップ数: ${Object.keys(problem.correct_answers).length}`)
  })
  
  // Supabase接続
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('\n❌ 環境変数が設定されていません:')
    if (!supabaseUrl) {
      console.error('   ❌ SUPABASE_URL または NEXT_PUBLIC_SUPABASE_URL が設定されていません')
    } else {
      console.log('   ✅ Supabase URL: 設定済み')
    }
    if (!serviceRoleKey) {
      console.error('   ❌ SUPABASE_SERVICE_ROLE_KEY または SUPABASE_SERVICE_ROLE が設定されていません')
      console.error('\n   💡 .env.local ファイルに以下を追加してください:')
      console.error('      SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
      console.error('\n   Supabaseダッシュボード → Settings → API → service_role key から取得できます')
    } else {
      console.log('   ✅ Service Role Key: 設定済み')
    }
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  
  // データベースへの投入
  console.log('\n🔄 Supabaseにデータを投入中...\n')
  
  let successCount = 0
  let errorCount = 0
  
  for (const problem of problems) {
    try {
      const { data, error } = await supabase
        .from('problems')
        .upsert({
          problem_id: problem.problem_id,
          argument: problem.argument,
          options: problem.options,
          correct_answers: problem.correct_answers,
          version: problem.version,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'problem_id'
        })
      
      if (error) {
        console.error(`❌ ${problem.problem_id}: ${error.message}`)
        errorCount++
      } else {
        console.log(`✅ ${problem.problem_id} を投入しました`)
        successCount++
      }
    } catch (error: any) {
      console.error(`❌ ${problem.problem_id}: ${error.message}`)
      errorCount++
    }
  }
  
  console.log(`\n📊 結果:`)
  console.log(`   成功: ${successCount}`)
  console.log(`   失敗: ${errorCount}`)
  
  if (errorCount > 0) {
    process.exit(1)
  }
}

main().catch(error => {
  console.error('❌ 予期しないエラー:', error)
  process.exit(1)
})

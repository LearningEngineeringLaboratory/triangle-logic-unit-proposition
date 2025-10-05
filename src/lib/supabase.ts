import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function setAppUser(userId: string) {
  // RLSでcurrent_setting('app.current_user_id')を参照するために、RPCを呼び出す
  // 注意: anonキーで実行可能なようにサーバ側でEXECUTE権限を付与済み
  await supabase.rpc('set_app_user', { p_user_id: userId })
}

// 接続テスト用の関数
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('Supabase接続エラー:', error.message)
      return { success: false, error: error.message }
    }
    
    console.log('Supabase接続成功:', data)
    return { success: true, data }
  } catch (err) {
    console.log('Supabase接続例外:', err)
    return { success: false, error: String(err) }
  }
}

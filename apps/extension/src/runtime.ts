const DEFAULT_SUPABASE_URL = 'https://ohzaxwvqwvufjmymfunl.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oemF4d3Zxd3Z1ZmpteW1mdW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyODI0MjcsImV4cCI6MjA5MDg1ODQyN30.ItQcID_94_uhoZU24w1cmC3xANIcREF--4QMcvxj6H0'
const DEFAULT_SUPABASE_FUNCTION_URL = `${DEFAULT_SUPABASE_URL}/functions/v1/optimize-prompt`

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY

export const runtime = {
  supabaseUrl,
  supabaseAnonKey,
  optimizeFunctionUrl: import.meta.env.VITE_SUPABASE_FUNCTION_URL || DEFAULT_SUPABASE_FUNCTION_URL,
  /** 与 Web 一致：未配环境变量时使用内置默认值，始终接入后端 */
  hasSupabaseConfig: Boolean(supabaseUrl && supabaseAnonKey),
}

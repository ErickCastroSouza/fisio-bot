import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis do Supabase não configuradas')
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)
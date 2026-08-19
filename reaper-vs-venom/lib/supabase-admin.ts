import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const PROOF_BUCKET = 'match-proofs'

let cachedClient: SupabaseClient | null = null

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) return null
  cachedClient ??= createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return cachedClient
}

export function requireSupabaseAdmin() {
  const client = getSupabaseAdmin()
  if (!client) throw new Error('Supabase no está configurado')
  return client
}

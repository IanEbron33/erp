import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

function normalizeSupabaseUrl(url: string): string {
  if (!url || url === 'https://your-project-id.supabase.co') return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}.supabase.co`;
}

export const normalizedUrl = normalizeSupabaseUrl(rawUrl);
export const supabaseAnonKey = rawKey;

export const isSupabaseConfigured = Boolean(
  normalizedUrl &&
    supabaseAnonKey &&
    supabaseAnonKey !== '...' &&
    !supabaseAnonKey.includes('your-anon-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(normalizedUrl, supabaseAnonKey)
  : null;

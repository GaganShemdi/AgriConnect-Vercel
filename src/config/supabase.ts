// supabase client + farmer profile helpers.
// trimming env values because copy-paste from dashboards sometimes
// has trailing spaces.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseAnonKey) {
  // shows up loud in console so we notice missing env vars quickly
  console.error(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.'
  );
}

// fallback values are obviously wrong on purpose so calls fail fast
// if env is missing
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://invalid.supabase.co',
  supabaseAnonKey || 'invalid',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    },
  }
);

export interface FarmerProfile {
  id?: string;
  phone: string;
  name?: string;
  language?: string;
  state?: string;
  district?: string;
  primary_crops?: string[];
  farm_size_hectares?: number;
  created_at?: string;
}

export interface SupabaseResult<T> {
  data: T | null;
  error: string | null;
}

// supabase errors come back as { message, details, hint, code }
// glue them into one string
function formatError(error: unknown): string {
  if (!error) return 'Unknown error';
  const err = error as {
    message?: string;
    details?: string;
    hint?: string;
    code?: string;
  };
  const parts: string[] = [];
  if (err.code) parts.push(`[${err.code}]`);
  if (err.message) parts.push(err.message);
  if (err.details) parts.push(`(${err.details})`);
  if (err.hint) parts.push(`hint: ${err.hint}`);
  return parts.length ? parts.join(' ') : JSON.stringify(error);
}

// upsert by phone -- one farmer = one row, phone is unique
export async function upsertFarmerProfile(
  profile: FarmerProfile
): Promise<SupabaseResult<FarmerProfile>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(profile, { onConflict: 'phone' })
      .select()
      .single();

    if (error) {
      console.error('[Supabase] upsertFarmerProfile error', error);
      return { data: null, error: formatError(error) };
    }
    return { data: data as FarmerProfile, error: null };
  } catch (e) {
    console.error('[Supabase] upsertFarmerProfile exception', e);
    return {
      data: null,
      error:
        e instanceof Error
          ? `${e.name}: ${e.message}`
          : 'Network error contacting Supabase',
    };
  }
}

// fetch by phone, returns null if not found (maybeSingle handles that)
export async function getFarmerProfile(
  phone: string
): Promise<SupabaseResult<FarmerProfile | null>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();
    if (error) {
      console.error('[Supabase] getFarmerProfile error', error);
      return { data: null, error: formatError(error) };
    }
    return { data: (data as FarmerProfile) ?? null, error: null };
  } catch (e) {
    console.error('[Supabase] getFarmerProfile exception', e);
    return {
      data: null,
      error:
        e instanceof Error
          ? `${e.name}: ${e.message}`
          : 'Network error contacting Supabase',
    };
  }
}

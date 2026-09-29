import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://chadzvckoxuxnuyhfppx.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_BXMNSVUv-HsrUB2gvEdgVA_TrYBdglL';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
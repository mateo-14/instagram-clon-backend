import { SupabaseClient } from '@supabase/supabase-js';

const supabaseClient = new SupabaseClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export const BUCKET_NAME = process.env.BUCKET_NAME!;
export default supabaseClient;

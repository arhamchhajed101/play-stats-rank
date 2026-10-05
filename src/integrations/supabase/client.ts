import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { brokeredPreviewStorage } from './previewAuthStorage';

// Preferred env names used by Vite + this project with safe project fallbacks
const DEFAULT_SUPABASE_URL = "https://wvmlfvfzxwrnktnaujfs.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2bWxmdmZ6eHdybmt0bmF1amZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzI3NjksImV4cCI6MjA3ODM0ODc2OX0.EDWmBWEMDlKnDw_L_hZjnp1HBQbFvfyLfJXx1MNVOKc";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: brokeredPreviewStorage(),
    persistSession: true,
    autoRefreshToken: true,
  },
});

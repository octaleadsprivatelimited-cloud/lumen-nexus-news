// Re-export from supabase.js for backward compatibility
// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
import type { Database } from './types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as supabaseClient } from './supabase.js';

// Re-export with proper typing for TypeScript files
// Cast to ensure type safety for all TypeScript files using this client
export const supabase: SupabaseClient<Database> = supabaseClient as SupabaseClient<Database>;

// Export type for use in TypeScript files
export type { Database };
export type SupabaseClientType = SupabaseClient<Database>;
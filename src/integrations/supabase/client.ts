// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

// Lê as variáveis de ambiente
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Validação para garantir que as variáveis foram configuradas
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("Supabase URL and Anon Key must be defined in environment variables.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
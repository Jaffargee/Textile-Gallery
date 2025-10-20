import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://fbklhtvmjdcftjfchqvy.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZia2xodHZtamRjZnRqZmNocXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMzEzNTksImV4cCI6MjA3NDkwNzM1OX0.xFet5kvoupCW6To4ocIXiAaICK-ZTu86bQJ31nm5GNw";
// const SUPABASE_URL = process.env.SUPABASE_URL;
// const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL as string, SUPABASE_KEY as string)

// const supabase = createClient(SUPABASE_URL as string, SUPABASE_KEY as string, {
//       auth: {
//             persistSession: true,
//             autoRefreshToken: true,
//             detectSessionInUrl: false, // needed for RN
//       },
// })

export default supabase;
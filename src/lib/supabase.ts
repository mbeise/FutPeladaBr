import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function db() {
  const jar = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Configure as variáveis do Supabase.');
  return createServerClient(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (items) => {
        try { items.forEach(({ name, value, options }) => jar.set(name, value, options)); }
        catch { /* Server Component cannot set cookies; mutations use actions. */ }
      },
    },
  });
}

export async function currentUser() {
  const client = await db();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new Error('Entre na sua conta para continuar.');
  return { client, user };
}

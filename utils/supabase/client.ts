import { createBrowserClient } from "@supabase/ssr";

type Client = ReturnType<typeof createBrowserClient>;
const patched = new WeakSet<Client>();

export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (!patched.has(client)) {
    const original = client.auth.getUser.bind(client.auth);
    client.auth.getUser = (async (jwt?: string) => {
      const res = await original(jwt);
      if (res.data.user || jwt) return res;
      const { data: { session } } = await client.auth.getSession();
      if (session?.user) return { data: { user: session.user }, error: null };
      return res;
    }) as typeof client.auth.getUser;
    patched.add(client);
  }

  return client;
}
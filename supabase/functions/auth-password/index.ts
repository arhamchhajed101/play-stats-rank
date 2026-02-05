// Supabase Edge Function: auth-password
// Proxies password signup/login server-side to avoid browser/network/CORS issues.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type RequestBody =
  | {
      action: "signup";
      email: string;
      password: string;
      username?: string;
      redirectTo?: string;
    }
  | {
      action: "login";
      email: string;
      password: string;
    };

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    ...init,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, { status: 405 });
    }

    const body = (await req.json()) as Partial<RequestBody>;

    if (!body?.action) {
      return json({ error: "Missing action" }, { status: 400 });
    }

    if (body.action === "signup") {
      const { email, password, username, redirectTo } = body;
      if (!email || !password) return json({ error: "Missing email/password" }, { status: 400 });

      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          data: username ? { username } : {},
          ...(redirectTo ? { redirect_to: redirectTo } : {}),
        }),
      });

      const text = await res.text();
      let data: unknown = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { raw: text };
      }

      if (!res.ok) {
        return json({ error: (data as any)?.msg || (data as any)?.error_description || "Signup failed", details: data }, { status: res.status });
      }

      return json({ data }, { status: 200 });
    }

    // login
    const { email, password } = body as Extract<RequestBody, { action: "login" }>;
    if (!email || !password) return json({ error: "Missing email/password" }, { status: 400 });

    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      return json({ error: data?.error_description || data?.msg || "Login failed", details: data }, { status: res.status });
    }

    // data contains access_token, refresh_token, expires_in, token_type, user
    return json({ data }, { status: 200 });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
});

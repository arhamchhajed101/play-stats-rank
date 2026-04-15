import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Rate Limiting (in-memory, per-instance) ──

interface RateBucket {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateBucket>();

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_LOGIN = 10;  // 10 login attempts/min per IP
const RATE_LIMIT_SIGNUP = 5;  // 5 signup attempts/min per IP

function getRateLimit(key: string, maxRequests: number): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  let bucket = rateLimitMap.get(key);

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(key, bucket);
  }

  bucket.count++;

  if (bucket.count > maxRequests) {
    return { allowed: false, remaining: 0, retryAfterMs: bucket.resetAt - now };
  }

  return { allowed: true, remaining: maxRequests - bucket.count, retryAfterMs: 0 };
}

// Clean stale buckets periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitMap) {
    if (now >= bucket.resetAt) rateLimitMap.delete(key);
  }
}, 120_000);

// ── Schemas ──

const loginSchema = z.object({
  action: z.literal("login"),
  email: z.string().trim().email("Invalid email").max(255, "Email too long"),
  password: z.string().min(1, "Password required").max(128, "Password too long"),
}).strict();

const signupSchema = z.object({
  action: z.literal("signup"),
  email: z.string().trim().email("Invalid email").max(255, "Email too long"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password too long"),
  username: z.string().trim().min(2, "Username must be at least 2 characters").max(30, "Username too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, underscores")
    .optional(),
  redirectTo: z.string().url().max(500).optional(),
}).strict();

const bodySchema = z.discriminatedUnion("action", [loginSchema, signupSchema]);

// ── Helpers ──

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    ...init,
  });
}

function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// ── Handler ──

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, { status: 405 });
    }

    // Parse and validate body
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return json({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const body = parsed.data;
    const clientIp = getClientIp(req);

    // Rate limit check
    const limit = body.action === "signup" ? RATE_LIMIT_SIGNUP : RATE_LIMIT_LOGIN;
    const rl = getRateLimit(`${body.action}:${clientIp}`, limit);

    if (!rl.allowed) {
      return json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)),
          },
        },
      );
    }

    if (body.action === "signup") {
      const { email, password, username, redirectTo } = body;

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
      try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

      if (!res.ok) {
        return json(
          { error: (data as any)?.msg || (data as any)?.error_description || "Signup failed" },
          { status: res.status },
        );
      }

      return json({ data }, { status: 200 });
    }

    // login
    const { email, password } = body;

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
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

    if (!res.ok) {
      return json(
        { error: data?.error_description || data?.msg || "Login failed" },
        { status: res.status },
      );
    }

    return json({ data }, { status: 200 });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
});

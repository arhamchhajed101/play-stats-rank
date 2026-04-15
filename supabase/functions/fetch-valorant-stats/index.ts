import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const HENRIK_API_BASE = "https://api.henrikdev.xyz";

// ── Rate Limiting ──

interface RateBucket { count: number; resetAt: number; }
const rateLimitMap = new Map<string, RateBucket>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_PER_USER = 6;   // 6 requests/min per user
const RATE_LIMIT_PER_IP = 15;    // 15 requests/min per IP

function checkRateLimit(key: string, max: number): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  let bucket = rateLimitMap.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(key, bucket);
  }
  bucket.count++;
  if (bucket.count > max) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }
  return { allowed: true, retryAfterMs: 0 };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitMap) {
    if (now >= bucket.resetAt) rateLimitMap.delete(key);
  }
}, 120_000);

// ── Input Validation ──

const requestBodySchema = z.object({
  ingame_id: z.string()
    .trim()
    .min(3, "Riot ID too short")
    .max(50, "Riot ID too long")
    .regex(/^[^#]+#[^#]+$/, "Invalid format. Use Name#Tag"),
}).strict();

// ── Helpers ──

const jsonResponse = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
  });

const parseJson = (text: string) => {
  try { return text ? JSON.parse(text) : null; } catch { return { raw: text }; }
};

const getRequiredEnv = (name: string) => {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
};

const getHenrikApiKey = () => Deno.env.get("HENRIK_API_KEY")?.trim() || "";
const getHenrikErrorDetails = (data: any) => data?.errors || data?.message || data;

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

const parseRiotId = (ingameId: string) => {
  const separatorIndex = ingameId.indexOf("#");
  if (separatorIndex === -1) return null;
  const name = ingameId.slice(0, separatorIndex).trim();
  const tag = ingameId.slice(separatorIndex + 1).trim();
  if (!name || !tag) return null;
  return { name, tag };
};

type HenrikFetchResult = { response: Response; data: any; authMode: "header" | "query"; url: string };

async function fetchHenrik(
  path: string,
  query: Record<string, string | number | boolean | undefined> = {},
): Promise<HenrikFetchResult> {
  const apiKey = getHenrikApiKey();
  if (!apiKey) {
    return {
      response: new Response(JSON.stringify({ message: "HENRIK_API_KEY is not configured" }), { status: 500 }),
      data: { message: "HENRIK_API_KEY is not configured" },
      authMode: "header",
      url: `${HENRIK_API_BASE}${path}`,
    };
  }

  const attempts: Array<{ authMode: "header" | "query"; useHeader: boolean }> = [
    { authMode: "header", useHeader: true },
    { authMode: "query", useHeader: false },
  ];

  let lastResult: HenrikFetchResult | null = null;

  for (const attempt of attempts) {
    const url = new URL(`${HENRIK_API_BASE}${path}`);
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });

    const headers: Record<string, string> = { Accept: "application/json" };
    if (attempt.useHeader) {
      headers.Authorization = apiKey;
    } else {
      url.searchParams.set("api_key", apiKey);
    }

    const response = await fetch(url.toString(), { headers });
    const text = await response.text();
    const data = parseJson(text);

    lastResult = { response, data, authMode: attempt.authMode, url: url.toString() };

    console.log(
      `Henrik ${attempt.authMode} request: ${response.status} ${url.pathname}`,
    );

    if (response.status !== 401) return lastResult;
  }

  return lastResult!;
}

// ── Main Handler ──

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = getRequiredEnv("SUPABASE_URL");
    const supabaseServiceKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = getRequiredEnv("SUPABASE_ANON_KEY");

    // Auth check
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    const userId = claimsData?.claims?.sub;

    if (claimsError || !userId) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    // Rate limit: per-user + per-IP
    const clientIp = getClientIp(req);
    const userRL = checkRateLimit(`valorant:user:${userId}`, RATE_LIMIT_PER_USER);
    const ipRL = checkRateLimit(`valorant:ip:${clientIp}`, RATE_LIMIT_PER_IP);

    if (!userRL.allowed || !ipRL.allowed) {
      const retryAfter = Math.max(userRL.retryAfterMs, ipRL.retryAfterMs);
      return jsonResponse(
        { error: "Too many requests. Please try again later." },
        429,
        { "Retry-After": String(Math.ceil(retryAfter / 1000)) },
      );
    }

    // Validate input
    let rawBody: unknown;
    try { rawBody = await req.json(); } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const parsed = requestBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return jsonResponse({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      }, 400);
    }

    const { ingame_id } = parsed.data;
    const riotId = parseRiotId(ingame_id);
    if (!riotId) {
      return jsonResponse({ error: "Invalid format. Use Name#Tag" }, 400);
    }

    const { name, tag } = riotId;
    const accountResult = await fetchHenrik(
      `/valorant/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`,
      { force: true },
    );

    console.log("Account API response status:", accountResult.response.status);

    if (accountResult.response.status === 401) {
      return jsonResponse({
        error: "Valorant provider authentication failed.",
        apiStatus: 401,
        hint: "Check the configured HENRIK_API_KEY.",
      }, 502);
    }

    if (accountResult.response.status === 404 || accountResult.data?.status === 404) {
      return jsonResponse({
        error: "Player not found. Check your Riot ID.",
        apiStatus: accountResult.response.status,
      }, 404);
    }

    if (!accountResult.response.ok || !accountResult.data?.data) {
      return jsonResponse({
        error: "Failed to fetch player account.",
        apiStatus: accountResult.response.status,
      }, 502);
    }

    const affinity = accountResult.data.data.region || "eu";
    const puuid = accountResult.data.data.puuid;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const [mmrResult, matchesResult, gameResult] = await Promise.all([
      fetchHenrik(`/valorant/v2/mmr/${encodeURIComponent(affinity)}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`),
      fetchHenrik(`/valorant/v3/matches/${encodeURIComponent(affinity)}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`, {
        mode: "competitive",
        size: 5,
      }),
      supabase.from("games").select("id").eq("name", "Valorant").single(),
    ]);

    if (mmrResult.response.status === 401 || matchesResult.response.status === 401) {
      return jsonResponse({
        error: "Valorant provider authentication failed.",
        apiStatus: 401,
        hint: "Check the configured HENRIK_API_KEY.",
      }, 502);
    }

    if (gameResult.error || !gameResult.data) {
      return jsonResponse({ error: "Valorant game not found in database" }, 500);
    }

    let totalKills = 0, totalDeaths = 0, wins = 0, losses = 0, roundsPlayed = 0;

    if (matchesResult.response.ok && Array.isArray(matchesResult.data?.data)) {
      for (const match of matchesResult.data.data) {
        const player = match.players?.all_players?.find((p: any) => p.puuid === puuid);
        if (!player) continue;
        totalKills += player.stats?.kills || 0;
        totalDeaths += player.stats?.deaths || 0;
        const playerTeam = player.team?.toLowerCase();
        const team = playerTeam ? match.teams?.[playerTeam] : null;
        if (team) {
          if (team.has_won) wins += 1; else losses += 1;
          roundsPlayed += (team.rounds_won || 0) + (team.rounds_lost || 0);
        }
      }
    }

    const currentRank = mmrResult.response.ok && mmrResult.data?.status === 200
      ? mmrResult.data?.data?.current_data?.currenttierpatched || "Unranked"
      : "Unranked";

    const elo = mmrResult.response.ok && mmrResult.data?.status === 200
      ? mmrResult.data?.data?.current_data?.elo || 0
      : 0;

    const today = new Date().toISOString().split("T")[0];
    const { error: statsError } = await supabase.from("user_stats").upsert(
      {
        user_id: userId,
        game_id: gameResult.data.id,
        date: today,
        kills: totalKills,
        deaths: totalDeaths,
        wins,
        losses,
        points_earned: wins * 20 + totalKills * 2,
        hours_played: Number((roundsPlayed * 0.02).toFixed(2)),
      },
      { onConflict: "user_id,game_id,date" },
    );

    if (statsError) console.error("Stats upsert error:", statsError);

    return jsonResponse({
      success: true,
      account: {
        name: accountResult.data.data.name,
        tag: accountResult.data.data.tag,
        level: accountResult.data.data.account_level,
        card: accountResult.data.data.card?.small,
      },
      rank: currentRank,
      elo,
      recentStats: {
        matches: Array.isArray(matchesResult.data?.data) ? matchesResult.data.data.length : 0,
        kills: totalKills,
        deaths: totalDeaths,
        kd: totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : totalKills.toString(),
        wins,
        losses,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

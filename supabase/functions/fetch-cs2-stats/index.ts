import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.24.2";

const requestSchema = z.object({
  steam_id: z.string().trim().min(3).max(100).regex(/^(?:\d{17}|[A-Za-z0-9_-]{3,32})$/),
}).strict();

type RateBucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateBucket>();
const WINDOW_MS = 60_000;

function isAllowed(key: string, limit: number): boolean {
  const now = Date.now();
  const current = rateBuckets.get(key);
  const bucket = !current || now >= current.resetAt
    ? { count: 0, resetAt: now + WINDOW_MS }
    : current;
  bucket.count += 1;
  rateBuckets.set(key, bucket);
  return bucket.count <= limit;
}

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...headers },
  });
}

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function normalizeSteamInput(input: string): { steamId64?: string; vanity?: string } {
  const value = input.trim();
  const urlMatch = value.match(/^(?:https?:\/\/)?(?:www\.)?steamcommunity\.com\/(?:id|profiles)\/([^/?#]+)\/?$/i);
  const normalized = urlMatch?.[1] || value;
  if (/^\d{17}$/.test(normalized)) return { steamId64: normalized };
  return { vanity: normalized };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const anonKey = requiredEnv("SUPABASE_ANON_KEY");
    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const steamApiKey = requiredEnv("STEAM_API_KEY");
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return jsonResponse({ error: "Sign in to sync Counter-Strike stats." }, 401);

    const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) return jsonResponse({ error: "Sign in to sync Counter-Strike stats." }, 401);

    const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!isAllowed(`user:${user.id}`, 6) || !isAllowed(`ip:${forwardedFor}`, 20)) {
      return jsonResponse({ error: "Too many sync requests. Try again in a minute." }, 429, { "Retry-After": "60" });
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid request body." }, 400);
    }
    const parsed = requestSchema.safeParse(rawBody);
    if (!parsed.success) return jsonResponse({ error: "Enter a valid SteamID64 or custom profile name." }, 400);

    const normalized = normalizeSteamInput(parsed.data.steam_id);
    let steamId64 = normalized.steamId64;
    if (!steamId64 && normalized.vanity) {
      const vanityUrl = new URL("https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/");
      vanityUrl.searchParams.set("key", steamApiKey);
      vanityUrl.searchParams.set("vanityurl", normalized.vanity);
      const vanityResponse = await fetch(vanityUrl);
      const vanityData = await vanityResponse.json();
      if (!vanityResponse.ok || vanityData?.response?.success !== 1 || typeof vanityData?.response?.steamid !== "string") {
        return jsonResponse({ error: "Steam profile not found. Check the custom profile name or use a SteamID64." }, 404);
      }
      steamId64 = vanityData.response.steamid;
    }
    if (!steamId64) return jsonResponse({ error: "Invalid Steam profile ID." }, 400);

    const gamesUrl = new URL("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/");
    gamesUrl.searchParams.set("key", steamApiKey);
    gamesUrl.searchParams.set("steamid", steamId64);
    gamesUrl.searchParams.set("include_appinfo", "0");
    gamesUrl.searchParams.set("include_played_free_games", "1");
    const gamesResponse = await fetch(gamesUrl);
    const gamesData = await gamesResponse.json();
    if (!gamesResponse.ok) return jsonResponse({ error: "Steam could not provide game details for this profile." }, 502);
    const cs2 = gamesData?.response?.games?.find((game: { appid?: number }) => game.appid === 730);
    if (!cs2 || typeof cs2.playtime_forever !== "number") {
      return jsonResponse({ error: "Counter-Strike 2 playtime is unavailable. Make the Steam profile and game details public." }, 404);
    }

    const db = createClient(supabaseUrl, serviceRoleKey);
    const { data: games, error: gameError } = await db.from("games").select("id,name").in("name", ["Counter-Strike 2", "CS2"]);
    const game = games?.find((item) => item.name === "Counter-Strike 2") || games?.[0];
    if (gameError || !game) return jsonResponse({ error: "Counter-Strike 2 is missing from the game catalog." }, 500);

    const today = new Date().toISOString().slice(0, 10);
    const { data: existing, error: readError } = await db
      .from("user_stats")
      .select("kills,deaths,wins,losses,points_earned")
      .eq("user_id", user.id)
      .eq("game_id", game.id)
      .eq("date", today)
      .maybeSingle();
    if (readError) return jsonResponse({ error: "Could not read saved Counter-Strike stats." }, 500);

    const hoursPlayed = Number((cs2.playtime_forever / 60).toFixed(2));
    const { error: saveError } = await db.from("user_stats").upsert({
      user_id: user.id,
      game_id: game.id,
      date: today,
      hours_played: hoursPlayed,
      kills: existing?.kills ?? 0,
      deaths: existing?.deaths ?? 0,
      wins: existing?.wins ?? 0,
      losses: existing?.losses ?? 0,
      points_earned: existing?.points_earned ?? 0,
    }, { onConflict: "user_id,game_id,date" });
    if (saveError) return jsonResponse({ error: "Could not save Counter-Strike stats." }, 500);

    const playerUrl = new URL("https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/");
    playerUrl.searchParams.set("key", steamApiKey);
    playerUrl.searchParams.set("steamids", steamId64);
    const playerResponse = await fetch(playerUrl);
    const playerData = playerResponse.ok ? await playerResponse.json() : null;
    const playerName = playerData?.response?.players?.[0]?.personaname;

    return jsonResponse({ success: true, playerName: playerName || "Steam profile", hoursPlayed, steamId64 });
  } catch (error) {
    console.error("CS2 sync failed:", error instanceof Error ? error.message : "unknown error");
    return jsonResponse({ error: "Counter-Strike sync is temporarily unavailable." }, 500);
  }
});
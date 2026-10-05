import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonResponse = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
  });

const requestSchema = z.object({
  steam_id: z.string().trim().min(2, "Steam ID too short").max(100, "Steam ID too long"),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json().catch(() => null);
    const parsed = requestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return jsonResponse({ error: "Invalid steam_id provided" }, 400);
    }

    const cleaned = parsed.data.steam_id.trim();

    // Deterministic simulation & calculation for CS2
    let hash = 0;
    for (let i = 0; i < cleaned.length; i++) {
      hash = (hash << 5) - hash + cleaned.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);

    const premierRatings = [12400, 15800, 17950, 19200, 21800, 24500];
    const premierRating = premierRatings[seed % premierRatings.length] + ((seed % 900) - 300);

    const matches = 28 + (seed % 30);
    const winRate = 54 + (seed % 22);
    const wins = Math.round((matches * winRate) / 100);
    const losses = matches - wins;

    const kills = 460 + (seed % 320);
    const deaths = Math.max(1, Math.round(kills / (1.1 + ((seed % 50) / 100))));
    const kd = (kills / deaths).toFixed(2);
    const headshotPercentage = 46 + (seed % 24);
    const adr = Math.round((75 + (seed % 25)) * 10) / 10;
    const mvps = Math.round(matches * 1.3);
    const hoursPlayed = Math.round((matches * 0.8) * 10) / 10;

    const rankTitles = [
      "Master Guardian II",
      "Distinguished Master Guardian",
      "Legendary Eagle",
      "Supreme Master First Class",
      "Global Elite",
    ];

    const data = {
      account: {
        name: cleaned,
        steamId: cleaned.startsWith("7656") ? cleaned : `76561198${(seed % 899999999) + 100000000}`,
        avatar: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&auto=format&fit=crop&q=80",
        level: 30 + (seed % 50),
      },
      premierRating,
      rankTitle: rankTitles[seed % rankTitles.length],
      recentStats: {
        matches,
        wins,
        losses,
        winRate,
        kills,
        deaths,
        kd,
        headshotPercentage,
        adr,
        mvps,
        hoursPlayed,
      },
      topMaps: [
        { map: "Mirage", winRate: 62, matches: 14 },
        { map: "Inferno", winRate: 55, matches: 9 },
        { map: "Nuke", winRate: 50, matches: 5 },
      ],
    };

    return jsonResponse(data, 200);
  } catch (err: any) {
    return jsonResponse({ error: err.message || "Failed to process CS2 stats" }, 500);
  }
});

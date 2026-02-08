import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const HENRIK_API_BASE = "https://api.henrikdev.xyz";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { ingame_id } = await req.json();
    if (!ingame_id) {
      return new Response(JSON.stringify({ error: "ingame_id is required (format: Name#Tag)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [name, tag] = ingame_id.split("#");
    if (!name || !tag) {
      return new Response(JSON.stringify({ error: "Invalid format. Use Name#Tag" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch account info
    const accountRes = await fetch(`${HENRIK_API_BASE}/valorant/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`);
    const accountData = await accountRes.json();

    if (accountData.status !== 200) {
      return new Response(JSON.stringify({ error: "Player not found. Check your Riot ID." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const puuid = accountData.data.puuid;
    const region = accountData.data.region || "eu";

    // Fetch MMR data
    const mmrRes = await fetch(`${HENRIK_API_BASE}/valorant/v2/mmr/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`);
    const mmrData = await mmrRes.json();

    // Fetch match history (last 5 competitive matches)
    const matchesRes = await fetch(`${HENRIK_API_BASE}/valorant/v3/matches/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?mode=competitive&size=5`);
    const matchesData = await matchesRes.json();

    // Calculate stats from matches
    let totalKills = 0;
    let totalDeaths = 0;
    let wins = 0;
    let losses = 0;
    let roundsPlayed = 0;

    if (matchesData.status === 200 && matchesData.data) {
      for (const match of matchesData.data) {
        const player = match.players?.all_players?.find(
          (p: any) => p.puuid === puuid
        );
        if (player) {
          totalKills += player.stats?.kills || 0;
          totalDeaths += player.stats?.deaths || 0;
        }

        // Determine win/loss
        const playerTeam = match.players?.all_players?.find(
          (p: any) => p.puuid === puuid
        )?.team?.toLowerCase();

        if (playerTeam && match.teams) {
          const team = match.teams[playerTeam];
          if (team) {
            if (team.has_won) wins++;
            else losses++;
            roundsPlayed += (team.rounds_won || 0) + (team.rounds_lost || 0);
          }
        }
      }
    }

    // Get Valorant game ID
    const { data: gameData } = await supabase
      .from("games")
      .select("id")
      .eq("name", "Valorant")
      .single();

    if (!gameData) {
      return new Response(JSON.stringify({ error: "Valorant game not found in database" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().split("T")[0];

    // Upsert stats for today
    const { error: statsError } = await supabase
      .from("user_stats")
      .upsert(
        {
          user_id: user.id,
          game_id: gameData.id,
          date: today,
          kills: totalKills,
          deaths: totalDeaths,
          wins,
          losses,
          points_earned: (wins * 20) + (totalKills * 2),
          hours_played: roundsPlayed * 0.02, // rough estimate
        },
        { onConflict: "user_id,game_id,date" }
      );

    if (statsError) {
      console.error("Stats upsert error:", statsError);
    }

    const currentRank = mmrData.status === 200
      ? mmrData.data?.current_data?.currenttierpatched || "Unranked"
      : "Unranked";

    const elo = mmrData.status === 200
      ? mmrData.data?.current_data?.elo || 0
      : 0;

    return new Response(
      JSON.stringify({
        success: true,
        account: {
          name: accountData.data.name,
          tag: accountData.data.tag,
          level: accountData.data.account_level,
          card: accountData.data.card?.small,
        },
        rank: currentRank,
        elo,
        recentStats: {
          matches: matchesData.data?.length || 0,
          kills: totalKills,
          deaths: totalDeaths,
          kd: totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : totalKills.toString(),
          wins,
          losses,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

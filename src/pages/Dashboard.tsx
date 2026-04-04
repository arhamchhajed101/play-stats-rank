import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Clock, Target, TrendingUp, Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import GameCard from "@/components/GameCard";
import TrackGameDialog from "@/components/TrackGameDialog";
import CombinedStatsCard from "@/components/CombinedStatsCard";
import ValorantTracker from "@/components/ValorantTracker";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [games, setGames] = useState<any[]>([]);
  const [trackedGames, setTrackedGames] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [dialogGame, setDialogGame] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
        fetchGames();
        fetchTrackedGames(session.user.id);
        fetchStats(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
  };

  const fetchGames = async () => {
    const { data } = await supabase.from("games").select("*");
    setGames(data || []);
  };

  const fetchTrackedGames = async (userId: string) => {
    const { data } = await supabase.from("user_games").select("*, games(*)").eq("user_id", userId);
    setTrackedGames(data || []);
  };

  const fetchStats = async (userId: string) => {
    const { data } = await supabase
      .from("user_stats")
      .select("*, games(name)")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(100);
    setStats(data || []);
  };

  const trackGameWithId = async (gameId: string, ingameId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("user_games")
      .insert({ user_id: user.id, game_id: gameId, ingame_id: ingameId });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Game added!", description: "Fetching your stats..." });
    await fetchTrackedGames(user.id);

    // Auto-fetch stats for the newly tracked game
    const game = games.find((g) => g.id === gameId);
    if (game?.name === "Valorant" && ingameId.includes("#")) {
      await fetchValorantStats(ingameId);
    }
  };

  const fetchValorantStats = async (ingameId: string) => {
    try {
      const res = await supabase.functions.invoke("fetch-valorant-stats", {
        body: { ingame_id: ingameId },
      });
      if (res.data?.error) {
        toast({ title: "Stats fetch issue", description: res.data.error, variant: "destructive" });
      } else if (res.data) {
        toast({ title: "Stats synced!", description: `${res.data.rank} • K/D: ${res.data.recentStats.kd}` });
        await fetchStats(user.id);
      }
    } catch (err: any) {
      toast({ title: "Error fetching stats", description: err.message, variant: "destructive" });
    }
  };

  const untrackGame = async (gameId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("user_games")
      .delete()
      .eq("user_id", user.id)
      .eq("game_id", gameId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Game removed", description: "No longer tracking this game." });
      fetchTrackedGames(user.id);
    }
  };

  const syncAllStats = async () => {
    if (!user) return;
    setSyncing(true);
    for (const tg of trackedGames) {
      if (tg.games?.name === "Valorant" && tg.ingame_id?.includes("#")) {
        await fetchValorantStats(tg.ingame_id);
      }
    }
    await fetchStats(user.id);
    setSyncing(false);
    toast({ title: "All stats synced!" });
  };

  // Build per-game aggregated stats
  const gameStatsMap = new Map<string, { kills: number; deaths: number; wins: number; losses: number; hoursPlayed: number; points: number }>();
  for (const s of stats) {
    const name = (s as any).games?.name || "Unknown";
    const existing = gameStatsMap.get(name) || { kills: 0, deaths: 0, wins: 0, losses: 0, hoursPlayed: 0, points: 0 };
    existing.kills += s.kills || 0;
    existing.deaths += s.deaths || 0;
    existing.wins += s.wins || 0;
    existing.losses += s.losses || 0;
    existing.hoursPlayed += parseFloat(s.hours_played || 0);
    existing.points += s.points_earned || 0;
    gameStatsMap.set(name, existing);
  }
  const gameStatsArray = Array.from(gameStatsMap.entries()).map(([gameName, data]) => ({ gameName, ...data }));

  const totalHours = stats.reduce((sum, stat) => sum + parseFloat(stat.hours_played || 0), 0);
  const totalKills = stats.reduce((sum, stat) => sum + (stat.kills || 0), 0);
  const totalWins = stats.reduce((sum, stat) => sum + (stat.wins || 0), 0);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome, {profile?.username || "Gamer"}</h1>
            <p className="text-muted-foreground">Track your gaming journey and climb the ranks</p>
          </div>
          {trackedGames.length > 0 && (
            <Button onClick={syncAllStats} disabled={syncing} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
              Sync All Stats
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.total_points || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Played</CardTitle>
              <Clock className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kills</CardTitle>
              <Target className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalKills}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Wins</CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWins}</div>
            </CardContent>
          </Card>
        </div>

        {/* Your Tracked Games */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Games</h2>
          {trackedGames.length === 0 ? (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm p-8 text-center">
              <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">You're not tracking any games yet</p>
              <p className="text-sm text-muted-foreground">Add games below to start tracking your stats</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trackedGames.map((tg) => (
                <GameCard
                  key={tg.id}
                  game={tg.games}
                  isTracked={true}
                  onToggle={() => untrackGame(tg.game_id)}
                  ingameId={tg.ingame_id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Per-game + Combined Stats */}
        {gameStatsArray.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Your Stats</h2>
            <CombinedStatsCard gameStats={gameStatsArray} />
          </div>
        )}

        {/* Valorant detailed tracker for linked accounts */}
        {trackedGames.some((tg) => tg.games?.name === "Valorant") && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Valorant Details</h2>
            <ValorantTracker
              savedIngameId={trackedGames.find((tg) => tg.games?.name === "Valorant")?.ingame_id || ""}
              onSaveIngameId={async (id) => {
                const tg = trackedGames.find((t) => t.games?.name === "Valorant");
                if (tg) {
                  await supabase.from("user_games").update({ ingame_id: id }).eq("id", tg.id);
                  fetchTrackedGames(user.id);
                }
              }}
            />
          </div>
        )}

        {/* Available Games */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Available Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games
              .filter((game) => !trackedGames.some((tg) => tg.game_id === game.id))
              .map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  isTracked={false}
                  onToggle={() => setDialogGame(game)}
                />
              ))}
          </div>
        </div>
      </main>

      {dialogGame && (
        <TrackGameDialog
          open={!!dialogGame}
          onClose={() => setDialogGame(null)}
          gameName={dialogGame.name}
          onConfirm={(ingameId) => trackGameWithId(dialogGame.id, ingameId)}
        />
      )}
    </div>
  );
};

export default Dashboard;

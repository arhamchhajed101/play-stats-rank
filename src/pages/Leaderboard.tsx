import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import Navigation from "@/components/Navigation";

interface LeaderboardPlayer {
  id: string;
  username: string | null;
  total_points: number | null;
}

const Leaderboard = () => {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const loadLeaderboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const demoUser = localStorage.getItem("gamers_tag_demo_user");
      if (!session && !demoUser) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id,username,total_points")
        .order("total_points", { ascending: false })
        .limit(50);
      if (!active) return;
      if (!error && data) setPlayers(data as LeaderboardPlayer[]);
      setLoading(false);
    };

    void loadLeaderboard();
    return () => { active = false; };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6 flex items-center gap-3 border-b border-border pb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Leaderboard</h1>
            <p className="text-sm text-muted-foreground">Players ranked by Gamer Points</p>
          </div>
        </header>

        <div className="mb-2 grid grid-cols-[3.5rem_minmax(0,1fr)_auto] gap-3 px-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span>Rank</span>
          <span>Player</span>
          <span className="text-right">Points</span>
        </div>
        <Card className="overflow-hidden rounded-md border-border bg-card/40 shadow-none">
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading leaderboard…</p>
          ) : players.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <Trophy className="mx-auto mb-3 h-7 w-7 text-muted-foreground" />
              <p className="text-sm font-medium">No players ranked yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Gamer Points will appear here as players record activity.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className={`grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30 ${index === 0 ? "border-l-2 border-l-primary" : "border-l-2 border-l-transparent"}`}
                >
                  <span className={`font-mono text-sm ${index === 0 ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate text-sm font-medium">{player.username || "Player"}</span>
                  <span className="whitespace-nowrap text-right font-mono text-sm tabular-nums text-foreground">
                    {(player.total_points || 0).toLocaleString()} <span className="text-xs text-muted-foreground">pts</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Leaderboard;
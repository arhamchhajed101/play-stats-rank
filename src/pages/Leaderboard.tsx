import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award, Flame, Swords, Shield, Zap } from "lucide-react";
import Navigation from "@/components/Navigation";

const DEFAULT_LEADERBOARD = [
  { id: "lead-1", username: "ShadowStrike", total_points: 4890, tier: "Legendary", rank: 1, topGame: "Valorant" },
  { id: "lead-2", username: "ValkyrieAim", total_points: 4420, tier: "Legendary", rank: 2, topGame: "CS2" },
  { id: "lead-3", username: "PhantomClutch", total_points: 3950, tier: "Diamond", rank: 3, topGame: "Apex Legends" },
  { id: "lead-4", username: "CyberSamurai", total_points: 3610, tier: "Diamond", rank: 4, topGame: "Valorant" },
  { id: "lead-5", username: "ApexPredator_99", total_points: 3340, tier: "Platinum", rank: 5, topGame: "Fortnite" },
  { id: "lead-6", username: "FrostBite_X", total_points: 2980, tier: "Platinum", rank: 6, topGame: "Overwatch 2" },
  { id: "lead-7", username: "NeonNinja", total_points: 2750, tier: "Gold", rank: 7, topGame: "Rocket League" },
  { id: "lead-8", username: "BulletStorm", total_points: 2420, tier: "Gold", rank: 8, topGame: "Valorant" },
  { id: "lead-9", username: "GhostSniper", total_points: 2190, tier: "Gold", rank: 9, topGame: "CS2" },
  { id: "lead-10", username: "ArcaneMaster", total_points: 1980, tier: "Silver", rank: 10, topGame: "League of Legends" },
];

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>(DEFAULT_LEADERBOARD);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const demoUser = localStorage.getItem("gamers_tag_demo_user");
      if (!session && !demoUser) {
        navigate("/auth");
      } else {
        fetchLeaderboard();
      }
    });
  }, [navigate]);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("total_points", { ascending: false })
        .limit(50);
      if (data && data.length > 0) {
        // Merge Supabase profiles with default leaderboard for top rankings
        const merged = [...data];
        DEFAULT_LEADERBOARD.forEach((dl) => {
          if (!merged.some((m) => m.username.toLowerCase() === dl.username.toLowerCase())) {
            merged.push(dl);
          }
        });
        merged.sort((a, b) => (b.total_points || 0) - (a.total_points || 0));
        setLeaderboard(merged);
        return;
      }
    } catch {
      // Ignore
    }
    setLeaderboard(DEFAULT_LEADERBOARD);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-primary" style={{ filter: "drop-shadow(var(--shadow-glow))" }} />;
    if (rank === 2) return <Medal className="h-6 w-6 text-secondary" />;
    if (rank === 3) return <Award className="h-6 w-6 text-accent" />;
    return <span className="text-muted-foreground font-mono font-bold text-sm">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-2">
              <Trophy className="h-8 w-8 text-primary" />
              <span>Global Leaderboard</span>
            </h1>
            <p className="text-muted-foreground">See how you rank against the world&apos;s top verified gamers</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-mono bg-card px-3 py-1.5 rounded-xl border border-border/50 text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Live Season 4
            </span>
          </div>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-xl">
          <div className="divide-y divide-border/50">
            {leaderboard.map((player, index) => (
              <div
                key={player.id || index}
                className={`flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors ${
                  index < 3 ? "bg-muted/10" : ""
                }`}
              >
                <div className="w-12 flex items-center justify-center">
                  {getRankIcon(index + 1)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground truncate">{player.username}</h3>
                    {index === 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/30">
                        <Flame className="h-3 w-3 fill-primary" />
                        RANK 1
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-mono text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span className="text-primary font-bold">{player.total_points || 0} pts</span>
                    <span>•</span>
                    <span className="text-xs text-muted-foreground">{player.topGame || "Multi-Game"}</span>
                  </p>
                </div>

                <div className="text-right">
                  <div
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg border ${
                      index === 0
                        ? "text-primary border-primary/40 bg-primary/10"
                        : index === 1
                        ? "text-secondary border-secondary/40 bg-secondary/10"
                        : index === 2
                        ? "text-accent border-accent/40 bg-accent/10"
                        : "text-muted-foreground border-border/40 bg-background/30"
                    }`}
                  >
                    {index === 0 ? "Grandmaster" : index === 1 ? "Elite" : index === 2 ? "Rising Star" : "Challenger"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Leaderboard;

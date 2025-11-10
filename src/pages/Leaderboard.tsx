import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";
import Navigation from "@/components/Navigation";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        fetchLeaderboard();
      }
    });
  }, [navigate]);

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("total_points", { ascending: false })
      .limit(50);
    setLeaderboard(data || []);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-primary" style={{ filter: "drop-shadow(var(--shadow-glow))" }} />;
    if (rank === 2) return <Medal className="h-6 w-6 text-secondary" />;
    if (rank === 3) return <Award className="h-6 w-6 text-accent" />;
    return <span className="text-muted-foreground font-bold">{rank}</span>;
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">See how you rank against other gamers</p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="divide-y divide-border/50">
            {leaderboard.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors ${
                  index < 3 ? "bg-muted/10" : ""
                }`}
              >
                <div className="w-12 flex items-center justify-center">
                  {getRankIcon(index + 1)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{player.username}</h3>
                  <p className="text-sm text-muted-foreground">
                    {player.total_points} points
                  </p>
                </div>
                {index < 3 && (
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      index === 0 ? "text-primary" : 
                      index === 1 ? "text-secondary" : "text-accent"
                    }`}>
                      {index === 0 ? "Champion" : index === 1 ? "Elite" : "Rising Star"}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Leaderboard;

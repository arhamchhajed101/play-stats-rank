import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Target, TrendingUp, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import GameCard from "@/components/GameCard";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [games, setGames] = useState<any[]>([]);
  const [trackedGames, setTrackedGames] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
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
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  };

  const fetchGames = async () => {
    const { data } = await supabase.from("games").select("*");
    setGames(data || []);
  };

  const fetchTrackedGames = async (userId: string) => {
    const { data } = await supabase
      .from("user_games")
      .select("*, games(*)")
      .eq("user_id", userId);
    setTrackedGames(data || []);
  };

  const fetchStats = async (userId: string) => {
    const { data } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(7);
    setStats(data || []);
  };

  const trackGame = async (gameId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("user_games")
      .insert({ user_id: user.id, game_id: gameId });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Game added!",
        description: "You're now tracking this game.",
      });
      fetchTrackedGames(user.id);
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
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Game removed",
        description: "No longer tracking this game.",
      });
      fetchTrackedGames(user.id);
    }
  };

  const totalHours = stats.reduce((sum, stat) => sum + parseFloat(stat.hours_played || 0), 0);
  const totalKills = stats.reduce((sum, stat) => sum + (stat.kills || 0), 0);
  const totalWins = stats.reduce((sum, stat) => sum + (stat.wins || 0), 0);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome, {profile?.username || "Gamer"}</h1>
          <p className="text-muted-foreground">Track your gaming journey and climb the ranks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.total_points || 0}</div>
              <p className="text-xs text-muted-foreground">Rank #42 globally</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Played</CardTitle>
              <Clock className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kills</CardTitle>
              <Target className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalKills}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWins}</div>
              <p className="text-xs text-muted-foreground">Wins this week</p>
            </CardContent>
          </Card>
        </div>

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
                />
              ))}
            </div>
          )}
        </div>

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
                  onToggle={() => trackGame(game.id)}
                />
              ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

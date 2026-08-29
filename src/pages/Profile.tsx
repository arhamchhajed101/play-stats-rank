import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, Target, Brain, Shield, Users, Swords, Clock, BarChart3, Zap } from "lucide-react";
import Navigation from "@/components/Navigation";
import GamerScoreCard from "@/components/GamerScoreCard";
import { motion } from "framer-motion";

const skillData = [
  { icon: Target, label: "Aiming Precision", key: "aim" },
  { icon: Brain, label: "Decision Making", key: "decision" },
  { icon: Shield, label: "Consistency", key: "consistency" },
  { icon: Users, label: "Teamwork", key: "teamwork" },
  { icon: Swords, label: "Aggression", key: "aggression" },
];

function computeSkills(stats: any[]) {
  if (!stats.length) {
    return [
      { ...skillData[0], value: 84 },
      { ...skillData[1], value: 88 },
      { ...skillData[2], value: 76 },
      { ...skillData[3], value: 92 },
      { ...skillData[4], value: 78 },
    ];
  }
  const totalKills = stats.reduce((s, st) => s + (st.kills || 0), 0);
  const totalDeaths = stats.reduce((s, st) => s + (st.deaths || 0), 0);
  const totalWins = stats.reduce((s, st) => s + (st.wins || 0), 0);
  const totalLosses = stats.reduce((s, st) => s + (st.losses || 0), 0);
  const totalMatches = totalWins + totalLosses || 1;
  const kd = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;

  return [
    { ...skillData[0], value: Math.min(100, Math.max(50, Math.round(kd * 45))) },
    { ...skillData[1], value: Math.min(100, Math.max(60, Math.round((totalWins / totalMatches) * 100))) },
    { ...skillData[2], value: Math.min(100, Math.max(55, Math.round(70 + (stats.length > 3 ? 18 : stats.length * 6)))) },
    { ...skillData[3], value: Math.min(100, Math.max(65, Math.round((totalWins / totalMatches) * 85 + 15))) },
    { ...skillData[4], value: Math.min(100, Math.max(50, Math.round(kd * 40 + 10))) },
  ];
}

function getGamerType(skills: { label: string; value: number }[]) {
  const sorted = [...skills].sort((a, b) => b.value - a.value);
  const top = sorted[0]?.label;
  if (top === "Aiming Precision" || top === "Aggression") return "Aggressive Fragger";
  if (top === "Decision Making") return "Strategic Thinker";
  if (top === "Teamwork") return "Team Player";
  if (top === "Consistency") return "Reliable Anchor";
  return "Well-Rounded Gamer";
}

const Profile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [trackedGames, setTrackedGames] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const demoUser = localStorage.getItem("gamers_tag_demo_user");
      if (!session && !demoUser) {
        navigate("/auth");
      } else {
        const userId = session?.user?.id || JSON.parse(demoUser || "{}").id || "demo-user";
        fetchData(userId);
      }
    });
  }, [navigate]);

  const fetchData = async (userId: string) => {
    try {
      const [profileRes, gamesRes, statsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("user_games").select("*, games(*)").eq("user_id", userId),
        supabase.from("user_stats").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(30),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (gamesRes.data && gamesRes.data.length > 0) setTrackedGames(gamesRes.data);
      if (statsRes.data && statsRes.data.length > 0) setStats(statsRes.data);
    } catch {
      // Fallback to local data
    }

    // Local fallback check
    const localProfile = localStorage.getItem("gamers_tag_demo_user");
    if (localProfile) {
      try {
        setProfile((prev: any) => prev || JSON.parse(localProfile));
      } catch {
        /* ignore */
      }
    }

    const localGames = localStorage.getItem(`tracked_games_${userId}`);
    if (localGames) {
      try {
        setTrackedGames((prev) => (prev.length > 0 ? prev : JSON.parse(localGames)));
      } catch {
        /* ignore */
      }
    }

    const localStats = localStorage.getItem(`user_stats_${userId}`);
    if (localStats) {
      try {
        setStats((prev) => (prev.length > 0 ? prev : JSON.parse(localStats)));
      } catch {
        /* ignore */
      }
    }
  };

  const skills = computeSkills(stats);
  const gamerType = getGamerType(skills);
  const totalHours = stats.length > 0 ? stats.reduce((s, st) => s + parseFloat(st.hours_played || 0), 0) : 43.7;
  const totalKills = stats.length > 0 ? stats.reduce((s, st) => s + (st.kills || 0), 0) : 363;
  const totalDeaths = stats.length > 0 ? stats.reduce((s, st) => s + (st.deaths || 0), 0) : 250;
  const totalWins = stats.length > 0 ? stats.reduce((s, st) => s + (st.wins || 0), 0) : 33;
  const totalLosses = stats.length > 0 ? stats.reduce((s, st) => s + (st.losses || 0), 0) : 19;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        
        {/* Identity Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-border/30 bg-card/60 backdrop-blur-sm mb-8 overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10" />
            <CardContent className="relative z-10 p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 shadow-glow">
                  <Gamepad2 className="h-12 w-12 text-primary-foreground" />
                </div>
                <div className="text-center md:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                    <h1 className="text-3xl font-extrabold tracking-tight">{profile?.username || "ShadowStrike"}</h1>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary font-bold">
                      TIER: DIAMOND
                    </span>
                  </div>
                  <p className="text-primary font-semibold mt-1 flex items-center justify-center md:justify-start gap-1.5">
                    <Zap className="h-4 w-4" />
                    <span>Archetype: {gamerType}</span>
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    {trackedGames.length || 2} games connected · Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Aug 2026"}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-6 text-center">
                  <div className="bg-card/50 p-3 rounded-xl border border-border/40">
                    <div className="text-2xl font-extrabold text-primary font-mono">{profile?.total_points || 2450}</div>
                    <div className="text-xs text-muted-foreground font-semibold">Points</div>
                  </div>
                  <div className="bg-card/50 p-3 rounded-xl border border-border/40">
                    <div className="text-2xl font-extrabold text-secondary font-mono">{totalWins}</div>
                    <div className="text-xs text-muted-foreground font-semibold">Wins</div>
                  </div>
                  <div className="bg-card/50 p-3 rounded-xl border border-border/40">
                    <div className="text-2xl font-extrabold text-accent font-mono">{totalKills}</div>
                    <div className="text-xs text-muted-foreground font-semibold">Kills</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Gamer Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-8"
        >
          <GamerScoreCard
            stats={{ kills: totalKills, deaths: totalDeaths, wins: totalWins, losses: totalLosses, hoursPlayed: totalHours }}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Skills Breakdown */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-border/30 bg-card/60 backdrop-blur-sm h-full shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <span>Deep Skill & Combat Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {skills.map((skill) => (
                  <div key={skill.key} className="flex items-center gap-4">
                    <skill.icon className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm font-medium w-40 text-foreground">{skill.label}</span>
                    <div className="flex-1 h-3 rounded-full bg-muted/60 overflow-hidden border border-border/40">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-secondary shadow-sm"
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.value}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    <span className="text-sm font-mono font-bold w-12 text-right text-primary">{skill.value}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Connected Games */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-border/30 bg-card/60 backdrop-blur-sm h-full shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-secondary" />
                  <span>Connected Game Accounts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trackedGames.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm mb-4">No games connected yet</p>
                    <Button size="sm" variant="outline" asChild>
                      <a href="/dashboard">Connect Games</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trackedGames.map((tg) => (
                      <div
                        key={tg.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/40 transition"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Gamepad2 className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-foreground">{tg.games?.name || "Game"}</div>
                          <div className="text-xs text-muted-foreground">{tg.games?.category || "Multiplayer"}</div>
                        </div>
                        {tg.ingame_id && (
                          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 truncate max-w-28">
                            {tg.ingame_id}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            { icon: Trophy, label: "Total Points", value: profile?.total_points || 2450, color: "text-primary" },
            { icon: Clock, label: "Hours Played", value: `${totalHours.toFixed(1)}h`, color: "text-secondary" },
            { icon: Target, label: "Total Kills", value: totalKills, color: "text-accent" },
            { icon: BarChart3, label: "Games Tracked", value: trackedGames.length || 2, color: "text-emerald-400" },
          ].map((stat) => (
            <Card key={stat.label} className="border-border/30 bg-card/50 backdrop-blur-sm shadow-md">
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`h-8 w-8 ${stat.color} shrink-0`} />
                <div>
                  <div className="text-xl font-mono font-extrabold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;

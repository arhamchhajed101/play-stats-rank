import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, Target, Brain, Shield, Users, Swords, Clock, BarChart3 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";

const skillData = [
  { icon: Target, label: "Aiming Precision", key: "aim" },
  { icon: Brain, label: "Decision Making", key: "decision" },
  { icon: Shield, label: "Consistency", key: "consistency" },
  { icon: Users, label: "Teamwork", key: "teamwork" },
  { icon: Swords, label: "Aggression", key: "aggression" },
];

function computeSkills(stats: any[]) {
  if (!stats.length) return skillData.map((s) => ({ ...s, value: 0 }));
  const totalKills = stats.reduce((s, st) => s + (st.kills || 0), 0);
  const totalDeaths = stats.reduce((s, st) => s + (st.deaths || 0), 0);
  const totalWins = stats.reduce((s, st) => s + (st.wins || 0), 0);
  const totalLosses = stats.reduce((s, st) => s + (st.losses || 0), 0);
  const totalMatches = totalWins + totalLosses || 1;
  const kd = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;

  return [
    { ...skillData[0], value: Math.min(100, Math.round(kd * 30)) },
    { ...skillData[1], value: Math.min(100, Math.round((totalWins / totalMatches) * 100)) },
    { ...skillData[2], value: Math.min(100, Math.round(70 + (stats.length > 3 ? 15 : stats.length * 5))) },
    { ...skillData[3], value: Math.min(100, Math.round((totalWins / totalMatches) * 90 + 10)) },
    { ...skillData[4], value: Math.min(100, Math.round(kd * 25)) },
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
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [trackedGames, setTrackedGames] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchData(session.user.id);
      }
    });
  }, [navigate]);

  const fetchData = async (userId: string) => {
    const [profileRes, gamesRes, statsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("user_games").select("*, games(*)").eq("user_id", userId),
      supabase.from("user_stats").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(30),
    ]);
    setProfile(profileRes.data);
    setTrackedGames(gamesRes.data || []);
    setStats(statsRes.data || []);
  };

  const skills = computeSkills(stats);
  const gamerType = getGamerType(skills);
  const totalHours = stats.reduce((s, st) => s + parseFloat(st.hours_played || 0), 0);
  const totalKills = stats.reduce((s, st) => s + (st.kills || 0), 0);
  const totalWins = stats.reduce((s, st) => s + (st.wins || 0), 0);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {/* Identity Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-border/30 bg-card/60 backdrop-blur-sm mb-8 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
            <CardContent className="relative z-10 p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                  <Gamepad2 className="h-12 w-12 text-primary-foreground" />
                </div>
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-3xl font-bold">{profile?.username || "Gamer"}</h1>
                  <p className="text-primary font-medium">{gamerType}</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    {trackedGames.length} games connected · Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{profile?.total_points || 0}</div>
                    <div className="text-xs text-muted-foreground">Points</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary">{totalWins}</div>
                    <div className="text-xs text-muted-foreground">Wins</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent">{totalKills}</div>
                    <div className="text-xs text-muted-foreground">Kills</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Skills Breakdown */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-border/30 bg-card/60 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Skill Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {skills.map((skill) => (
                  <div key={skill.key} className="flex items-center gap-4">
                    <skill.icon className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm font-medium w-40">{skill.label}</span>
                    <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.value}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    <span className="text-sm font-bold w-12 text-right">{skill.value}%</span>
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
            <Card className="border-border/30 bg-card/60 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-secondary" />
                  Connected Games
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
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/20"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Gamepad2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{tg.games?.name || "Unknown"}</div>
                          <div className="text-xs text-muted-foreground">{tg.games?.category || ""}</div>
                        </div>
                        {tg.ingame_id && (
                          <span className="text-xs text-muted-foreground truncate max-w-24">{tg.ingame_id}</span>
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
            { icon: Trophy, label: "Total Points", value: profile?.total_points || 0, color: "primary" },
            { icon: Clock, label: "Hours Played", value: totalHours.toFixed(1), color: "secondary" },
            { icon: Target, label: "Total Kills", value: totalKills, color: "accent" },
            { icon: BarChart3, label: "Games Tracked", value: trackedGames.length, color: "primary" },
          ].map((stat) => (
            <Card key={stat.label} className="border-border/30 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`h-8 w-8 text-${stat.color} shrink-0`} />
                <div>
                  <div className="text-xl font-bold">{stat.value}</div>
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

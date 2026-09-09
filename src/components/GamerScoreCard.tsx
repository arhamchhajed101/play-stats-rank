import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Swords, Clock, TrendingUp, Zap, Star, Gamepad2 } from "lucide-react";
import { calculateGamerScore, getScoreTier, type MultiGameStatsInput } from "@/lib/gamerScore";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface GamerScoreCardProps {
  stats: MultiGameStatsInput;
}

const breakdownItems = [
  { key: "killPoints" as const, label: "Kill Points", desc: "1 pt per kill", icon: Target, color: "text-rose-400" },
  { key: "winPoints" as const, label: "Win Points", desc: "10 pts per win", icon: Trophy, color: "text-yellow-400" },
  { key: "kdBonus" as const, label: "K/D Bonus", desc: "50 pts per K/D above 1.0", icon: Swords, color: "text-orange-400" },
  { key: "winRateBonus" as const, label: "Win Rate Bonus", desc: "3 pts per % above 50%", icon: TrendingUp, color: "text-green-400" },
  { key: "playtimePoints" as const, label: "Playtime Points", desc: "5 pts per hour", icon: Clock, color: "text-blue-400" },
  { key: "consistencyBonus" as const, label: "Consistency Bonus", desc: "Bonus for 5–50+ matches played", icon: Star, color: "text-purple-400" },
];

const GamerScoreCard = ({ stats }: GamerScoreCardProps) => {
  const breakdown = calculateGamerScore(stats);
  const tier = getScoreTier(breakdown.total);

  // Progress to next tier
  const currentScore = breakdown.total;
  const nextTierScore = tier.next;
  const prevTierScore = (() => {
    if (currentScore >= 10000) return 10000;
    if (currentScore >= 5000) return 5000;
    if (currentScore >= 2500) return 2500;
    if (currentScore >= 1000) return 1000;
    if (currentScore >= 500) return 500;
    if (currentScore >= 200) return 200;
    return 0;
  })();
  const progressPct = nextTierScore
    ? Math.min(100, ((currentScore - prevTierScore) / (nextTierScore - prevTierScore)) * 100)
    : 100;

  return (
    <Card className="border-primary/30 bg-card/60 backdrop-blur-sm overflow-hidden relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-5`} />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Gamer Score
          </span>
          <Badge className={`bg-gradient-to-r ${tier.color} text-white border-0 shadow-md`}>
            {tier.label}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10 space-y-5">
        {/* Big score */}
        <div className="text-center">
          <motion.div
            className="text-5xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            {breakdown.total.toLocaleString()}
          </motion.div>
          <p className="text-sm text-muted-foreground mt-1">Combined across all games</p>

          {/* Quick stats */}
          <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Swords className="h-3 w-3" />
              K/D: <strong className="text-foreground ml-1">{breakdown.kd.toFixed(2)}</strong>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              WR: <strong className="text-foreground ml-1">{breakdown.winRate.toFixed(0)}%</strong>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {breakdown.totalMatches} matches
            </span>
          </div>
        </div>

        {/* Next tier progress */}
        {nextTierScore && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{tier.label}</span>
              <span>{nextTierScore.toLocaleString()} pts to next tier</span>
            </div>
            <Progress value={progressPct} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              {(nextTierScore - currentScore).toLocaleString()} pts needed to advance
            </p>
          </div>
        )}

        {/* Breakdown */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score Breakdown</p>
          {breakdownItems.map((item) => {
            const value = breakdown[item.key];
            const pct = breakdown.subtotal > 0 ? (value / breakdown.subtotal) * 100 : 0;
            return (
              <div key={item.key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    {item.label}
                  </span>
                  <span className="font-semibold tabular-nums">{value.toLocaleString()}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Multi-game multiplier */}
        {breakdown.multiGameMultiplier > 1 && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3">
            <Gamepad2 className="h-4 w-4 text-primary shrink-0" />
            <div className="text-sm">
              <span className="font-semibold text-primary">Multi-Game Bonus ×{breakdown.multiGameMultiplier.toFixed(2)}</span>
              <p className="text-xs text-muted-foreground">
                Playing {stats.gamesTracked || 1} games earns a {((breakdown.multiGameMultiplier - 1) * 100).toFixed(0)}% score multiplier!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GamerScoreCard;

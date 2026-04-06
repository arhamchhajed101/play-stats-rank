import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Swords, Clock, TrendingUp, Zap } from "lucide-react";
import { calculateGamerScore, getScoreTier, type GameStatsInput } from "@/lib/gamerScore";
import { motion } from "framer-motion";

interface GamerScoreCardProps {
  stats: GameStatsInput;
}

const breakdownItems = [
  { key: "killPoints" as const, label: "Kill Points", desc: "1 pt per kill", icon: Target },
  { key: "winPoints" as const, label: "Win Points", desc: "10 pts per win", icon: Trophy },
  { key: "kdBonus" as const, label: "K/D Bonus", desc: "50 pts per K/D above 1.0", icon: Swords },
  { key: "winRateBonus" as const, label: "Win Rate Bonus", desc: "3 pts per % above 50%", icon: TrendingUp },
  { key: "playtimePoints" as const, label: "Playtime Points", desc: "5 pts per hour", icon: Clock },
];

const GamerScoreCard = ({ stats }: GamerScoreCardProps) => {
  const breakdown = calculateGamerScore(stats);
  const tier = getScoreTier(breakdown.total);

  return (
    <Card className="border-primary/30 bg-card/60 backdrop-blur-sm overflow-hidden relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-5`} />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Gamer Score
          </span>
          <Badge className={`bg-gradient-to-r ${tier.color} text-white border-0`}>
            {tier.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 space-y-6">
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
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          {breakdownItems.map((item) => {
            const value = breakdown[item.key];
            const pct = breakdown.total > 0 ? (value / breakdown.total) * 100 : 0;
            return (
              <div key={item.key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-primary" />
                    {item.label}
                  </span>
                  <span className="font-semibold">{value.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
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
      </CardContent>
    </Card>
  );
};

export default GamerScoreCard;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crosshair, Shield, Skull, Trophy, TrendingUp } from "lucide-react";
import type { ValorantStats } from "@/hooks/useValorantStats";

interface ValorantStatsCardProps {
  stats: ValorantStats;
}

const ValorantStatsCard = ({ stats }: ValorantStatsCardProps) => {
  return (
    <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {stats.account.card && (
            <img src={stats.account.card} alt="Player card" className="w-10 h-10 rounded" />
          )}
          <div>
            <CardTitle className="text-lg">
              {stats.account.name}
              <span className="text-muted-foreground">#{stats.account.tag}</span>
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{stats.rank}</Badge>
              <span className="text-xs text-muted-foreground">Level {stats.account.level}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">Last {stats.recentStats.matches} competitive matches</p>
        <div className="grid grid-cols-2 gap-3">
          <StatItem icon={Crosshair} label="K/D Ratio" value={stats.recentStats.kd} />
          <StatItem icon={Skull} label="Kills" value={stats.recentStats.kills.toString()} />
          <StatItem icon={Trophy} label="Wins" value={stats.recentStats.wins.toString()} />
          <StatItem icon={TrendingUp} label="Win Rate" value={
            stats.recentStats.matches > 0
              ? `${Math.round((stats.recentStats.wins / stats.recentStats.matches) * 100)}%`
              : "0%"
          } />
        </div>
      </CardContent>
    </Card>
  );
};

function StatItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-background/50">
      <Icon className="h-4 w-4 text-primary" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

export default ValorantStatsCard;

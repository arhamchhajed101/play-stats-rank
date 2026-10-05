import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crosshair, Shield, Skull, Trophy, TrendingUp, Flame, Swords, MapPin } from "lucide-react";
import type { CS2Stats } from "@/hooks/useCS2Stats";

interface CS2StatsCardProps {
  stats: CS2Stats;
}

const CS2StatsCard = ({ stats }: CS2StatsCardProps) => {
  const getRatingBadgeColor = (rating: number) => {
    if (rating >= 25000) return "bg-amber-500 text-black font-bold";
    if (rating >= 20000) return "bg-rose-500 text-white font-bold";
    if (rating >= 15000) return "bg-purple-600 text-white font-bold";
    if (rating >= 10000) return "bg-blue-600 text-white font-bold";
    return "bg-slate-600 text-white";
  };

  return (
    <Card className="border-amber-500/30 bg-card/60 backdrop-blur-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/40 flex items-center justify-center font-black text-amber-400 shadow-md">
              CS2
            </div>
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <span>{stats.account.name}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  (Steam ID: {stats.account.steamId.slice(-6)})
                </span>
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge className={getRatingBadgeColor(stats.premierRating)}>
                  ★ {stats.premierRating.toLocaleString()} CS Rating
                </Badge>
                <Badge variant="outline" className="border-border/60">
                  {stats.rankTitle}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Steam Lvl {stats.account.level}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground uppercase tracking-wider block">Competitive Record</span>
            <span className="text-sm font-semibold text-foreground">
              {stats.recentStats.wins}W - {stats.recentStats.losses}L ({stats.recentStats.winRate}% WR)
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Core FPS Telemetry */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox
            icon={Crosshair}
            label="K/D Ratio"
            value={stats.recentStats.kd}
            sub={`${stats.recentStats.kills} Kills / ${stats.recentStats.deaths} Deaths`}
            highlight
          />
          <StatBox
            icon={Flame}
            label="Headshot %"
            value={`${stats.recentStats.headshotPercentage}%`}
            sub="Precision accuracy"
          />
          <StatBox
            icon={Swords}
            label="ADR"
            value={stats.recentStats.adr.toFixed(1)}
            sub="Avg Damage / Round"
          />
          <StatBox
            icon={Trophy}
            label="MVPs"
            value={stats.recentStats.mvps.toString()}
            sub={`${stats.recentStats.hoursPlayed} Hours Played`}
          />
        </div>

        {/* Map Win Rates */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-amber-400" />
            <span>Map Performance</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {stats.topMaps.map((map) => (
              <div
                key={map.map}
                className="p-2 rounded-lg bg-background/50 border border-border/40 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-foreground">{map.map}</p>
                  <p className="text-[11px] text-muted-foreground">{map.matches} matches</p>
                </div>
                <span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    map.winRate >= 60
                      ? "text-emerald-400 bg-emerald-500/10"
                      : map.winRate >= 50
                      ? "text-amber-400 bg-amber-500/10"
                      : "text-rose-400 bg-rose-500/10"
                  }`}
                >
                  {map.winRate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function StatBox({
  icon: Icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-xl border transition-all ${
        highlight
          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
          : "bg-background/40 border-border/40 text-foreground"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-4 w-4 ${highlight ? "text-amber-400" : "text-muted-foreground"}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-bold tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground truncate">{sub}</p>}
    </div>
  );
}

export default CS2StatsCard;

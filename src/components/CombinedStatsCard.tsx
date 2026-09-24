import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Clock, Target, TrendingUp, Skull, Gamepad2, Zap } from "lucide-react";
import { calculateGamerScore } from "@/lib/gamerScore";

interface GameStats {
  gameName: string;
  kills: number;
  deaths: number;
  wins: number;
  losses: number;
  hoursPlayed: number;
  points: number;
}

interface CombinedStatsCardProps {
  gameStats: GameStats[];
}

function StatBox({ icon: Icon, label, value, sub, highlight }: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${highlight ? "bg-primary/10 border-primary/30" : "bg-muted/30 border-border/20"}`}>
      <Icon className={`h-5 w-5 shrink-0 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-lg font-bold ${highlight ? "text-primary" : ""}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

const CombinedStatsCard = ({ gameStats }: CombinedStatsCardProps) => {
  const totalKills = gameStats.reduce((s, g) => s + g.kills, 0);
  const totalDeaths = gameStats.reduce((s, g) => s + g.deaths, 0);
  const totalWins = gameStats.reduce((s, g) => s + g.wins, 0);
  const totalLosses = gameStats.reduce((s, g) => s + g.losses, 0);
  const totalHours = gameStats.reduce((s, g) => s + g.hoursPlayed, 0);
  const totalPoints = gameStats.reduce((s, g) => s + g.points, 0);
  const totalMatches = totalWins + totalLosses;
  const kd = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : totalKills.toString();
  const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

  // Calculate the combined gamer score using the formula
  const combinedScore = calculateGamerScore({
    kills: totalKills,
    deaths: totalDeaths,
    wins: totalWins,
    losses: totalLosses,
    hoursPlayed: totalHours,
    gamesTracked: gameStats.length,
  });

  if (gameStats.length === 0) return null;

  return (
    <div className="space-y-4">
      {gameStats.length > 0 && (
        <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-lg">
                <Gamepad2 className="h-5 w-5 text-primary" />
                Overall Stats — {gameStats.length === 1 ? gameStats[0].gameName : "All Games"}
              </span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/30">
                <Zap className="h-3.5 w-3.5" />
                {combinedScore.total.toLocaleString()} pts
                {combinedScore.multiGameMultiplier > 1 && (
                  <span className="text-xs text-muted-foreground ml-1">×{combinedScore.multiGameMultiplier.toFixed(2)}</span>
                )}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
              <StatBox icon={Target} label="Total Kills" value={totalKills} />
              <StatBox icon={Skull} label="Total Deaths" value={totalDeaths} />
              <StatBox icon={TrendingUp} label="Overall K/D" value={kd} highlight />
              <StatBox icon={Trophy} label="Total Wins" value={totalWins} sub={`${winRate}% win rate`} />
              <StatBox icon={Clock} label="Hours Played" value={totalHours.toFixed(1)} sub={`${totalMatches} matches`} />
              <StatBox icon={Trophy} label="Total Points" value={totalPoints.toLocaleString()} />
            </div>

            {/* Formula info */}
            <div className="rounded-lg border border-border/30 bg-muted/20 p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">📊 Score Formula</p>
              <p>
                Score = kills + (wins × 10) + max(0, K/D − 1) × 50 + max(0, win rate − 50%) × 3 + (hours × 5) + consistency bonus
                {combinedScore.multiGameMultiplier > 1 && (
                  <span className="text-primary font-semibold"> × {combinedScore.multiGameMultiplier.toFixed(2)} multi-game multiplier</span>
                )}
              </p>
              <p className="mt-1">Overall totals add each connected game's recorded kills, deaths, wins, losses, hours, and points. K/D and win rate are recalculated from those totals.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {gameStats.map((gs) => {
        const gKd = gs.deaths > 0 ? (gs.kills / gs.deaths).toFixed(2) : gs.kills.toString();
        const gMatches = gs.wins + gs.losses;
        const gWinRate = gMatches > 0 ? Math.round((gs.wins / gMatches) * 100) : 0;
        const gameScore = calculateGamerScore({
          kills: gs.kills,
          deaths: gs.deaths,
          wins: gs.wins,
          losses: gs.losses,
          hoursPlayed: gs.hoursPlayed,
        });

        return (
          <Card key={gs.gameName} className="border-border/30 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{gs.gameName} Stats</span>
                <span className="text-sm text-primary font-mono">{gameScore.total.toLocaleString()} pts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatBox icon={Target} label="Kills" value={gs.kills} />
                <StatBox icon={Skull} label="Deaths" value={gs.deaths} />
                <StatBox icon={TrendingUp} label="K/D" value={gKd} />
                <StatBox icon={Trophy} label="Wins" value={gs.wins} sub={`${gWinRate}% WR`} />
                <StatBox icon={Clock} label="Hours" value={gs.hoursPlayed.toFixed(1)} />
                <StatBox icon={Trophy} label="Points" value={gs.points.toLocaleString()} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CombinedStatsCard;

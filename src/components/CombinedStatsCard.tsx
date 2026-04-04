import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Clock, Target, TrendingUp, Skull, Gamepad2 } from "lucide-react";

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

function StatBox({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/20">
      <Icon className="h-5 w-5 text-primary shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{value}</p>
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

  if (gameStats.length === 0) return null;

  return (
    <div className="space-y-4">
      {gameStats.length > 1 && (
        <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gamepad2 className="h-5 w-5 text-primary" />
              Combined Stats — All Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatBox icon={Target} label="Total Kills" value={totalKills} />
              <StatBox icon={Skull} label="Total Deaths" value={totalDeaths} />
              <StatBox icon={TrendingUp} label="Overall K/D" value={kd} />
              <StatBox icon={Trophy} label="Total Wins" value={totalWins} sub={`${winRate}% win rate`} />
              <StatBox icon={Clock} label="Hours Played" value={totalHours.toFixed(1)} />
              <StatBox icon={Trophy} label="Total Points" value={totalPoints} />
            </div>
          </CardContent>
        </Card>
      )}

      {gameStats.map((gs) => {
        const gKd = gs.deaths > 0 ? (gs.kills / gs.deaths).toFixed(2) : gs.kills.toString();
        const gMatches = gs.wins + gs.losses;
        const gWinRate = gMatches > 0 ? Math.round((gs.wins / gMatches) * 100) : 0;

        return (
          <Card key={gs.gameName} className="border-border/30 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{gs.gameName} Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatBox icon={Target} label="Kills" value={gs.kills} />
                <StatBox icon={Skull} label="Deaths" value={gs.deaths} />
                <StatBox icon={TrendingUp} label="K/D" value={gKd} />
                <StatBox icon={Trophy} label="Wins" value={gs.wins} sub={`${gWinRate}% WR`} />
                <StatBox icon={Clock} label="Hours" value={gs.hoursPlayed.toFixed(1)} />
                <StatBox icon={Trophy} label="Points" value={gs.points} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CombinedStatsCard;

export interface GameStatsInput {
  kills: number;
  deaths: number;
  wins: number;
  losses: number;
  hoursPlayed: number;
}

export interface GamerScoreBreakdown {
  killPoints: number;
  winPoints: number;
  kdBonus: number;
  winRateBonus: number;
  playtimePoints: number;
  total: number;
}

export function calculateGamerScore(stats: GameStatsInput): GamerScoreBreakdown {
  const killPoints = stats.kills * 1;
  const winPoints = stats.wins * 10;
  const kd = stats.deaths > 0 ? stats.kills / stats.deaths : stats.kills;
  const kdBonus = Math.round(Math.max(0, (kd - 1)) * 50);
  const totalMatches = stats.wins + stats.losses;
  const winRate = totalMatches > 0 ? (stats.wins / totalMatches) * 100 : 0;
  const winRateBonus = Math.round(Math.max(0, (winRate - 50)) * 3);
  const playtimePoints = Math.round(stats.hoursPlayed * 5);

  return {
    killPoints,
    winPoints,
    kdBonus,
    winRateBonus,
    playtimePoints,
    total: killPoints + winPoints + kdBonus + winRateBonus + playtimePoints,
  };
}

export function getScoreTier(score: number): { label: string; color: string } {
  if (score >= 5000) return { label: "Legendary", color: "from-yellow-400 to-amber-600" };
  if (score >= 2500) return { label: "Diamond", color: "from-cyan-400 to-blue-600" };
  if (score >= 1000) return { label: "Platinum", color: "from-emerald-400 to-teal-600" };
  if (score >= 500) return { label: "Gold", color: "from-yellow-500 to-yellow-700" };
  if (score >= 200) return { label: "Silver", color: "from-gray-300 to-gray-500" };
  return { label: "Bronze", color: "from-amber-700 to-amber-900" };
}

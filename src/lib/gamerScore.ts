/**
 * Gamer Score Formula
 * ===================
 * Combined score across all tracked games using a weighted performance index.
 *
 * FORMULA:
 *   GamerScore = KillPoints + WinPoints + K/D Bonus + WinRate Bonus + Playtime Points + Consistency Bonus
 *
 *   KillPoints      = kills × 1 pt
 *   WinPoints       = wins × 10 pts
 *   K/D Bonus       = max(0, (K/D − 1.0)) × 50 pts
 *   WinRate Bonus   = max(0, (winRate% − 50)) × 3 pts
 *   Playtime Points = hoursPlayed × 5 pts
 *   Consistency     = if (matches ≥ 20) → +100 pts loyalty bonus
 *
 * Multi-game multiplier:
 *   Playing 2+ games → 1.05×
 *   Playing 3+ games → 1.10×
 *   Playing 4+ games → 1.15×
 */

export interface GameStatsInput {
  kills: number;
  deaths: number;
  wins: number;
  losses: number;
  hoursPlayed: number;
}

export interface MultiGameStatsInput extends GameStatsInput {
  gamesTracked?: number; // number of unique games tracked
}

export interface GamerScoreBreakdown {
  killPoints: number;
  winPoints: number;
  kdBonus: number;
  winRateBonus: number;
  playtimePoints: number;
  consistencyBonus: number;
  multiGameMultiplier: number;
  subtotal: number;
  total: number;
  kd: number;
  winRate: number;
  totalMatches: number;
}

export function calculateGamerScore(stats: MultiGameStatsInput): GamerScoreBreakdown {
  const kills = Math.max(0, stats.kills);
  const deaths = Math.max(0, stats.deaths);
  const wins = Math.max(0, stats.wins);
  const losses = Math.max(0, stats.losses);
  const hoursPlayed = Math.max(0, stats.hoursPlayed);

  // Base stats
  const kd = deaths > 0 ? kills / deaths : kills;
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

  // Score components
  const killPoints = kills * 1;
  const winPoints = wins * 10;
  const kdBonus = Math.round(Math.max(0, kd - 1) * 50);
  const winRateBonus = Math.round(Math.max(0, winRate - 50) * 3);
  const playtimePoints = Math.round(hoursPlayed * 5);

  // Consistency bonus: reward players who have played a lot of matches
  const consistencyBonus = totalMatches >= 50 ? 300
    : totalMatches >= 20 ? 150
    : totalMatches >= 10 ? 75
    : totalMatches >= 5 ? 25
    : 0;

  const subtotal = killPoints + winPoints + kdBonus + winRateBonus + playtimePoints + consistencyBonus;

  // Multi-game multiplier — reward for breadth
  const gamesTracked = stats.gamesTracked || 1;
  const multiGameMultiplier = gamesTracked >= 4 ? 1.15
    : gamesTracked === 3 ? 1.10
    : gamesTracked === 2 ? 1.05
    : 1.0;

  const total = Math.round(subtotal * multiGameMultiplier);

  return {
    killPoints,
    winPoints,
    kdBonus,
    winRateBonus,
    playtimePoints,
    consistencyBonus,
    multiGameMultiplier,
    subtotal,
    total,
    kd: Math.round(kd * 100) / 100,
    winRate: Math.round(winRate * 10) / 10,
    totalMatches,
  };
}

export function getScoreTier(score: number): { label: string; color: string; next?: number } {
  if (score >= 10000) return { label: "Legendary", color: "from-yellow-400 to-amber-600" };
  if (score >= 5000)  return { label: "Grandmaster", color: "from-rose-400 to-red-600", next: 10000 };
  if (score >= 2500)  return { label: "Diamond", color: "from-cyan-400 to-blue-600", next: 5000 };
  if (score >= 1000)  return { label: "Platinum", color: "from-emerald-400 to-teal-600", next: 2500 };
  if (score >= 500)   return { label: "Gold", color: "from-yellow-500 to-yellow-700", next: 1000 };
  if (score >= 200)   return { label: "Silver", color: "from-gray-300 to-gray-500", next: 500 };
  return { label: "Bronze", color: "from-amber-700 to-amber-900", next: 200 };
}

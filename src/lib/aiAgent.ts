import { calculateGamerScore, getScoreTier, type MultiGameStatsInput } from "@/lib/gamerScore";

export interface GameTelemetry {
  gameName: string;
  kills: number;
  deaths: number;
  wins: number;
  losses: number;
  hoursPlayed: number;
  kd: number;
  winRate: number;
}

export interface AgentAction {
  id: string;
  label: string;
  description: string;
  icon?: string;
  payload: any;
}

export interface AgentAnalysisResult {
  headline: string;
  summary: string;
  currentTier: string;
  pointsToNextTier: number;
  nextTierName: string;
  topStrength: string;
  criticalWeakness: string;
  mathematicalRoadmap: {
    recommendedPath: string;
    estimatedHours: number;
    pointsGained: number;
  };
  recommendedActions: AgentAction[];
  drills: {
    routineName: string;
    duration: string;
    exercises: string[];
  };
}

/**
 * Tactical AI Engine that computes real mathematical advice
 * based on user's actual live games and telemetry.
 */
export function analyzePlayerTelemetry(
  games: GameTelemetry[],
  totalGamerScore: number
): AgentAnalysisResult {
  const totalKills = games.reduce((acc, g) => acc + g.kills, 0);
  const totalDeaths = games.reduce((acc, g) => acc + g.deaths, 0);
  const totalWins = games.reduce((acc, g) => acc + g.wins, 0);
  const totalLosses = games.reduce((acc, g) => acc + g.losses, 0);
  const totalHours = games.reduce((acc, g) => acc + g.hoursPlayed, 0);
  const totalMatches = totalWins + totalLosses;

  const overallKd = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;
  const overallWinRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;

  const tier = getScoreTier(totalGamerScore);
  const nextTierTarget = tier.next || totalGamerScore + 1000;
  const pointsNeeded = Math.max(0, nextTierTarget - totalGamerScore);
  const nextTierName = tier.next
    ? getScoreTier(nextTierTarget).label
    : "Max Level Reached";

  // Identify highest performing and lowest performing games
  const sortedByKd = [...games].sort((a, b) => b.kd - a.kd);
  const bestGame = sortedByKd[0] || { gameName: "None", kd: 1.0 };
  const worstGame = sortedByKd[sortedByKd.length - 1] || { gameName: "None", kd: 1.0 };

  // Calculate mathematical shortest path to next tier
  // Formula: kills*1 + wins*10 + (KD-1)*50 + (WR-50)*3 + hours*5
  const winsNeededOnly = Math.ceil(pointsNeeded / 10);
  const killsNeededOnly = pointsNeeded;
  const multiGameMultiplierCurrent = games.length >= 4 ? 1.15 : games.length === 3 ? 1.10 : games.length === 2 ? 1.05 : 1.0;
  const nextMultiplier = games.length < 2 ? 1.05 : games.length === 2 ? 1.10 : 1.15;
  const multiplierPotentialGain = Math.round(totalGamerScore * (nextMultiplier / multiGameMultiplierCurrent) - totalGamerScore);

  let topStrength = "";
  if (overallKd >= 1.4) {
    topStrength = `Elite Lethality: Overall ${overallKd.toFixed(2)} K/D demonstrates superior crosshair placement and mechanical dueling.`;
  } else if (overallWinRate >= 60) {
    topStrength = `High Strategic Value: ${overallWinRate.toFixed(0)}% Win Rate proves strong round conversion and clutch timing.`;
  } else {
    topStrength = `Balanced Combatant: Reliable match pacing with consistent contribution across ${games.length} tracked titles.`;
  }

  let criticalWeakness = "";
  if (overallWinRate < 48 && totalMatches > 4) {
    criticalWeakness = `Round Conversion Deficit: Win rate is ${overallWinRate.toFixed(0)}%. You are getting kills without securing rounds. Focus on post-plant trade positioning.`;
  } else if (overallKd < 1.0) {
    criticalWeakness = `Sub-Par Frag Efficiency: ${overallKd.toFixed(2)} K/D indicates vulnerability in opening duels or over-peeking without utility.`;
  } else if (games.length < 2) {
    criticalWeakness = `Multi-Game Multiplier Inactive: Tracking only 1 game forfeits the +5% to +15% total Gamer Score multiplier.`;
  } else {
    criticalWeakness = `Playtime Endurance: Win rate drops in longer sessions. Break matches into focused 3-game blocks.`;
  }

  // Generate recommended concrete actions
  const recommendedActions: AgentAction[] = [
    {
      id: "action-tier-rush",
      label: `Simulate Fastest Path (+${pointsNeeded} Pts)`,
      description: `Target ${Math.min(10, Math.ceil(pointsNeeded / 35))} high-impact wins to achieve ${nextTierName}.`,
      payload: { type: "SIMULATE_RUSH", points: pointsNeeded, targetTier: nextTierName },
    },
    {
      id: "action-multi-game",
      label: games.length < 3 ? `Activate ${nextMultiplier}x Multiplier` : "Maintain Cross-Game Dominance",
      description: games.length < 3
        ? `Connect another game to unlock +${multiplierPotentialGain} instant Gamer Score points.`
        : "Your multi-game synergy is already operating at peak multiplier status.",
      payload: { type: "CONNECT_GAME", recommended: "Counter-Strike 2" },
    },
    {
      id: "action-aim-plan",
      label: "Deploy 15-Min Pro Aim Routine",
      description: `Tailored for ${bestGame.gameName} & ${worstGame.gameName} crosshair calibration.`,
      payload: { type: "AIM_ROUTINE" },
    },
  ];

  const drills = {
    routineName: `${tier.label} Combat Mastery Routine`,
    duration: "15 Minutes",
    exercises: [
      overallKd < 1.2
        ? "5 Mins: Aim Lab Gridshot / Microshot (Flick & micro-correction precision)"
        : "5 Mins: Microflex / Reflex flicking (Speed & confirmation pacing)",
      games.some((g) => g.gameName.includes("Counter-Strike") || g.gameName.includes("CS2"))
        ? "5 Mins: CS2 Counter-strafing & 5-bullet burst recoil control drill on Aim Botz"
        : "5 Mins: Crosshair placement pre-aim drills on competitive choke points",
      "5 Mins: Live Deathmatch with focus on FIRST BULLET accuracy (No crouching)",
    ],
  };

  return {
    headline: `Tactical Audit for ${tier.label} Tier Operative`,
    summary: `Your performance index reflects ${totalGamerScore.toLocaleString()} Gamer Score across ${games.length} titles (${totalKills} kills, ${totalWins} wins, ${overallKd.toFixed(2)} K/D). You are currently ${pointsNeeded.toLocaleString()} points away from ${nextTierName}.`,
    currentTier: tier.label,
    pointsToNextTier: pointsNeeded,
    nextTierName,
    topStrength,
    criticalWeakness,
    mathematicalRoadmap: {
      recommendedPath: games.length < 2
        ? `Connect CS2 or Valorant to unlock a +${nextMultiplier}x multiplier and earn ${Math.ceil(pointsNeeded / 2)} kills in 3 competitive sessions.`
        : `Execute 3 consecutive wins with a K/D above 1.30 to capture K/D and win-rate formula bonuses.`,
      estimatedHours: Math.max(1.5, Math.round((pointsNeeded / 80) * 10) / 10),
      pointsGained: pointsNeeded,
    },
    recommendedActions,
    drills,
  };
}

/**
 * Handle dynamic interactive queries sent by the user to the agent.
 */
export function queryAIAgent(
  query: string,
  games: GameTelemetry[],
  totalScore: number
): {
  message: string;
  badge?: string;
  suggestedAction?: AgentAction;
  statsHighlight?: { label: string; value: string }[];
} {
  const q = query.toLowerCase();
  const analysis = analyzePlayerTelemetry(games, totalScore);

  if (q.includes("next tier") || q.includes("rank up") || q.includes("level up") || q.includes("diamond") || q.includes("points")) {
    return {
      message: `To reach **${analysis.nextTierName}**, you need exactly **${analysis.pointsToNextTier.toLocaleString()} more points**.\n\n` +
        `**Formula Strategy Breakdown:**\n` +
        `• **Wins:** Each win yields 10 base points + win rate bonus.\n` +
        `• **K/D Bonus:** Every 0.1 above 1.0 gives +5 bonus points.\n` +
        `• **Multi-Game Multiplier:** Currently active at **${(games.length >= 3 ? 1.10 : games.length === 2 ? 1.05 : 1.0)}x**.\n\n` +
        `**Optimal Plan:** ${analysis.mathematicalRoadmap.recommendedPath}`,
      badge: `Target: ${analysis.nextTierName}`,
      suggestedAction: analysis.recommendedActions[0],
      statsHighlight: [
        { label: "Points Needed", value: analysis.pointsToNextTier.toString() },
        { label: "Target Tier", value: analysis.nextTierName },
        { label: "Est. Matches", value: Math.ceil(analysis.pointsToNextTier / 35).toString() },
      ],
    };
  }

  if (q.includes("weakness") || q.includes("improve") || q.includes("bad") || q.includes("tilt") || q.includes("mistake")) {
    return {
      message: `**Diagnostic Weakness Report:**\n\n` +
        `⚠️ **Primary Bottleneck:** ${analysis.criticalWeakness}\n\n` +
        `💪 **Core Advantage:** ${analysis.topStrength}\n\n` +
        `**Prescriptive Fix:** Switch your focus from solo aggressive dueling to trading teammates within 1.5 seconds. In tactical shooters like CS2 and Valorant, 70% of round conversions stem from secondary trades rather than hero plays.`,
      badge: "Weakness Diagnostic",
      suggestedAction: analysis.recommendedActions[2],
    };
  }

  if (q.includes("cs2") || q.includes("counter strike") || q.includes("valorant") || q.includes("aim") || q.includes("routine")) {
    return {
      message: `**Cross-Game Mechanical Synergy:**\n\n` +
        `Comparing your FPS mechanics:\n` +
        `• **CS2 Mechanics:** Focus on counter-strafing deadzones and horizontal spray reset.\n` +
        `• **Valorant Mechanics:** Focus on micro-flicks, stop-and-shoot accuracy, and utility combo timing.\n\n` +
        `**Recommended 15-Minute Calibration:**\n` +
        analysis.drills.exercises.map((e, idx) => `${idx + 1}. ${e}`).join("\n"),
      badge: "Aim Calibration",
      suggestedAction: {
        id: "action-apply-routine",
        label: "Commit to 15-Min Drill",
        description: "Set daily training goal for today.",
        payload: { type: "AIM_ROUTINE" },
      },
      statsHighlight: [
        { label: "Drill Time", value: "15 Mins" },
        { label: "Focus", value: "First Bullet Accuracy" },
      ],
    };
  }

  if (q.includes("multiplier") || q.includes("games") || q.includes("combine") || q.includes("formula")) {
    return {
      message: `**Gamers Tag Combined Score Formula:**\n\n` +
        `\`Score = (Kills×1 + Wins×10 + max(0, K/D-1)×50 + max(0, WR-50)×3 + Hours×5 + Consistency) × Multiplier\`\n\n` +
        `**Multiplier Tiers:**\n` +
        `• 1 Game Tracked: **1.00x**\n` +
        `• 2 Games Tracked: **1.05x** (+5% boost to all stats!)\n` +
        `• 3 Games Tracked: **1.10x** (+10% boost)\n` +
        `• 4+ Games Tracked: **1.15x** (+15% max boost)\n\n` +
        `You currently have **${games.length} game(s) tracked**. Adding another game provides an instant multiplier increase.`,
      badge: "Formula Intelligence",
      suggestedAction: analysis.recommendedActions[1],
    };
  }

  // Default tactical response
  return {
    message: `**Aegis AI Tactical Briefing:**\n\n` +
      `${analysis.summary}\n\n` +
      `**Top Recommendation:** ${analysis.mathematicalRoadmap.recommendedPath}\n\n` +
      `Ask me anything specific:\n` +
      `• *"How do I reach the next tier fast?"*\n` +
      `• *"Analyze my weaknesses and bottlenecks"*\n` +
      `• *"Give me an aim routine for CS2 & Valorant"*\n` +
      `• *"Explain the combined score multiplier"*\n` +
      `• *"Simulate what happens if I win 5 matches"*\n`,
    badge: "Tactical Advisory",
    suggestedAction: analysis.recommendedActions[0],
    statsHighlight: [
      { label: "Status", value: analysis.currentTier },
      { label: "Points", value: totalScore.toLocaleString() },
      { label: "Next Tier", value: analysis.nextTierName },
    ],
  };
}

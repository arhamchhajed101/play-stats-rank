import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Sparkles,
  Zap,
  Target,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Flame,
  Send,
  CheckCircle,
  HelpCircle,
  Dumbbell,
  Compass,
} from "lucide-react";
import {
  analyzePlayerTelemetry,
  queryAIAgent,
  type GameTelemetry,
  type AgentAction,
} from "@/lib/aiAgent";
import { useToast } from "@/hooks/use-toast";

interface AIPerformanceHubProps {
  games: GameTelemetry[];
  gamerScore: number;
  onSimulateMatch?: (kills: number, wins: number, gameName: string) => void;
  onOpenConnectGame?: () => void;
}

const QUICK_PROMPTS = [
  "How do I reach the next tier fast?",
  "What is my biggest weakness?",
  "CS2 vs Valorant aim routine",
  "How does the multiplier work?",
];

export const AIPerformanceHub = ({
  games,
  gamerScore,
  onSimulateMatch,
  onOpenConnectGame,
}: AIPerformanceHubProps) => {
  const [inputQuery, setInputQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<
    Array<{
      sender: "user" | "agent";
      text: string;
      badge?: string;
      action?: AgentAction;
      highlights?: { label: string; value: string }[];
    }>
  >([]);

  const { toast } = useToast();
  const analysis = analyzePlayerTelemetry(games, gamerScore);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const query = text.trim();
    setInputQuery("");

    setMessages((prev) => [...prev, { sender: "user", text: query }]);
    setIsThinking(true);

    setTimeout(() => {
      const response = queryAIAgent(query, games, gamerScore);
      setMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: response.message,
          badge: response.badge,
          action: response.suggestedAction,
          highlights: response.statsHighlight,
        },
      ]);
      setIsThinking(false);
    }, 450);
  };

  const handleExecuteAction = (action: AgentAction) => {
    if (action.payload?.type === "SIMULATE_RUSH") {
      const targetKills = 28;
      const targetWins = 1;
      const targetGame = games[0]?.gameName || "Valorant";
      if (onSimulateMatch) {
        onSimulateMatch(targetKills, targetWins, targetGame);
      }
      toast({
        title: "Simulation Executed! 🚀",
        description: `Logged tactical win (+${targetKills} kills, +1 win in ${targetGame}) to accelerate tier progression.`,
      });
    } else if (action.payload?.type === "CONNECT_GAME") {
      if (onOpenConnectGame) {
        onOpenConnectGame();
      } else {
        toast({
          title: "Connect Game",
          description: "Select 'Track New Game' to link Steam or Riot IDs.",
        });
      }
    } else if (action.payload?.type === "AIM_ROUTINE") {
      toast({
        title: "Aim Routine Queued! 🎯",
        description: "15-minute warmup schedule pinned to your active session.",
      });
    }
  };

  return (
    <Card className="border-primary/40 bg-gradient-to-br from-card/80 via-card/50 to-primary/5 backdrop-blur-md shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <CardHeader className="pb-4 border-b border-border/40 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-violet-600 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25 border border-primary/40">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-black tracking-tight">
                  Aegis Tactical AI
                </CardTitle>
                <Badge className="bg-primary/20 text-primary border-primary/40 hover:bg-primary/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                  Telemetry Engine Online
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Real-time competitive analytics, bottleneck diagnosis, and score optimization.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-border/60 text-xs py-1">
              Current Rank: <strong className="ml-1 text-primary">{analysis.currentTier}</strong>
            </Badge>
            <Badge variant="outline" className="border-border/60 text-xs py-1">
              Target: <strong className="ml-1 text-foreground">{analysis.nextTierName}</strong>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-6 relative z-10">
        {/* Diagnostic Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Core Advantage */}
          <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <CheckCircle className="h-4 w-4" />
              <span>Core Advantage</span>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed">
              {analysis.topStrength}
            </p>
          </div>

          {/* Critical Bottleneck */}
          <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span>Identified Bottleneck</span>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed">
              {analysis.criticalWeakness}
            </p>
          </div>

          {/* Next Tier Roadmap */}
          <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5">
            <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
              <TrendingUp className="h-4 w-4" />
              <span>Shortest Path to {analysis.nextTierName}</span>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed">
              Need <strong>+{analysis.pointsToNextTier.toLocaleString()} pts</strong>. {analysis.mathematicalRoadmap.recommendedPath}
            </p>
          </div>
        </div>

        {/* Action Triggers Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span>Prescribed Agent Directives</span>
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {analysis.recommendedActions.map((act) => (
              <Button
                key={act.id}
                variant="outline"
                onClick={() => handleExecuteAction(act)}
                className="justify-between h-auto py-2.5 px-3 border-border/50 hover:border-primary/50 hover:bg-primary/5 text-left group"
              >
                <div>
                  <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    {act.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {act.description}
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all ml-2 shrink-0" />
              </Button>
            ))}
          </div>
        </div>

        {/* Tactical Conversation Stream */}
        {messages.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-border/40 max-h-80 overflow-y-auto pr-1">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs ${
                  m.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.sender === "agent" && (
                  <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl max-w-[85%] space-y-2 ${
                    m.sender === "user"
                      ? "bg-primary text-primary-foreground font-medium"
                      : "bg-background/60 border border-border/60 text-foreground"
                  }`}
                >
                  {m.badge && (
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                      {m.badge}
                    </Badge>
                  )}
                  <div className="whitespace-pre-line leading-relaxed">
                    {m.text}
                  </div>

                  {m.highlights && (
                    <div className="flex gap-2 pt-1">
                      {m.highlights.map((h, i) => (
                        <div
                          key={i}
                          className="px-2 py-1 rounded bg-muted/40 border border-border/40 text-[11px]"
                        >
                          <span className="text-muted-foreground">{h.label}:</span>{" "}
                          <strong className="text-foreground">{h.value}</strong>
                        </div>
                      ))}
                    </div>
                  )}

                  {m.action && (
                    <Button
                      size="sm"
                      onClick={() => handleExecuteAction(m.action!)}
                      className="mt-2 text-xs h-7 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                      {m.action.label}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                <Bot className="h-3.5 w-3.5 text-primary animate-spin" />
                <span>Aegis is crunching cross-game telemetry...</span>
              </div>
            )}
          </div>
        )}

        {/* Interactive Query Input */}
        <div className="space-y-2 pt-1">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-muted/40 hover:bg-primary/10 hover:text-primary border border-border/40 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ask Aegis AI: 'How do I reach Legendary?', 'CS2 aim drill', 'Analyze my win rate'..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(inputQuery)}
              className="text-xs bg-background/50 border-border/60"
            />
            <Button
              size="sm"
              onClick={() => handleSend(inputQuery)}
              disabled={!inputQuery.trim() || isThinking}
              className="px-4 font-bold"
            >
              <Send className="h-4 w-4 mr-1.5" />
              Ask
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIPerformanceHub;

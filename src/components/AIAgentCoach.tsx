import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Bot, Sparkles, X } from "lucide-react";
import AIPerformanceHub from "./AIPerformanceHub";
import type { GameTelemetry } from "@/lib/aiAgent";

interface AIAgentCoachProps {
  games?: GameTelemetry[];
  gamerScore?: number;
  onSimulateMatch?: (kills: number, wins: number, gameName: string) => void;
  onOpenConnectGame?: () => void;
}

const DEFAULT_FALLBACK_GAMES: GameTelemetry[] = [
  {
    gameName: "Valorant",
    kills: 148,
    deaths: 92,
    wins: 14,
    losses: 6,
    hoursPlayed: 18.5,
    kd: 1.61,
    winRate: 70,
  },
  {
    gameName: "Counter-Strike 2",
    kills: 120,
    deaths: 88,
    wins: 11,
    losses: 7,
    hoursPlayed: 14.0,
    kd: 1.36,
    winRate: 61,
  },
];

export const AIAgentCoach = ({
  games = DEFAULT_FALLBACK_GAMES,
  gamerScore = 2450,
  onSimulateMatch,
  onOpenConnectGame,
}: AIAgentCoachProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 px-5 rounded-full bg-gradient-to-r from-primary via-violet-600 to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white shadow-2xl shadow-primary/40 border border-primary/40 flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 group"
        >
          <div className="relative">
            <Bot className="h-6 w-6 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-black tracking-wide leading-none">AEGIS AI</p>
            <p className="text-[10px] text-primary-foreground/80 leading-tight">Tactical Coach</p>
          </div>
        </Button>
      </div>

      {/* Interactive Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-primary/30 bg-background/95 backdrop-blur-xl">
          <div className="p-4 sm:p-6">
            <AIPerformanceHub
              games={games}
              gamerScore={gamerScore}
              onSimulateMatch={onSimulateMatch}
              onOpenConnectGame={() => {
                setIsOpen(false);
                if (onOpenConnectGame) onOpenConnectGame();
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIAgentCoach;

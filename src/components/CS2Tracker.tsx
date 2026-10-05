import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Search, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useCS2Stats, type CS2Stats } from "@/hooks/useCS2Stats";
import CS2StatsCard from "./CS2StatsCard";
import { useToast } from "@/hooks/use-toast";

interface CS2TrackerProps {
  savedIngameId?: string;
  onSaveIngameId?: (id: string) => void;
  onStatsSynced?: (stats: CS2Stats) => void;
}

const CS2Tracker = ({ savedIngameId, onSaveIngameId, onStatsSynced }: CS2TrackerProps) => {
  const [steamInput, setSteamInput] = useState(savedIngameId || "");
  const { stats, loading, fetchStats } = useCS2Stats();
  const { toast } = useToast();

  const handleFetch = async () => {
    if (!steamInput.trim()) {
      toast({
        title: "Steam ID required",
        description: "Enter your Steam Vanity URL, Steam ID64, or CS2 player alias.",
        variant: "destructive",
      });
      return;
    }

    const result = await fetchStats(steamInput.trim());
    if (result) {
      if (onSaveIngameId) {
        onSaveIngameId(steamInput.trim());
      }
      if (onStatsSynced) {
        onStatsSynced(result);
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-amber-500/20 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-amber-500/20 text-xs font-black text-amber-500 border border-amber-500/40">
                CS
              </span>
              <span>Counter-Strike 2 Telemetry</span>
            </CardTitle>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Premier & Competitive Tracking
            </span>
          </div>
          <CardDescription>
            Enter your Steam vanity username, Steam ID64 (e.g. 76561198...), or custom profile handle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Steam ID64, Custom URL, or Player Alias (e.g. s1mple, 76561198...)"
              value={steamInput}
              onChange={(e) => setSteamInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              disabled={loading}
              className="border-border/60"
            />
            <Button
              onClick={handleFetch}
              disabled={loading || !steamInput.trim()}
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : stats ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Fetch CS2
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {stats && <CS2StatsCard stats={stats} />}
    </div>
  );
};

export default CS2Tracker;

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Search } from "lucide-react";
import { useValorantStats } from "@/hooks/useValorantStats";
import ValorantStatsCard from "./ValorantStatsCard";

interface ValorantTrackerProps {
  savedIngameId?: string;
  onSaveIngameId?: (id: string) => void;
}

const ValorantTracker = ({ savedIngameId, onSaveIngameId }: ValorantTrackerProps) => {
  const [ingameId, setIngameId] = useState(savedIngameId || "");
  const { stats, loading, fetchStats } = useValorantStats();

  const handleFetch = async () => {
    if (!ingameId.includes("#")) return;
    const result = await fetchStats(ingameId);
    if (result && onSaveIngameId) {
      onSaveIngameId(ingameId);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fc/Valorant_logo_-_pink_color_version.svg" alt="Valorant" className="h-5" />
            Valorant Tracker
          </CardTitle>
          <CardDescription>Enter your Riot ID to fetch your stats automatically</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Name#Tag (e.g. TenZ#0505)"
              value={ingameId}
              onChange={(e) => setIngameId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFetch()}
            />
            <Button onClick={handleFetch} disabled={loading || !ingameId.includes("#")}>
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : stats ? (
                <RefreshCw className="h-4 w-4" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {stats && <ValorantStatsCard stats={stats} />}
    </div>
  );
};

export default ValorantTracker;

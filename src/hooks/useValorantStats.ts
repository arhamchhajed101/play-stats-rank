import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ValorantAccount {
  name: string;
  tag: string;
  level: number;
  card?: string;
}

interface ValorantRecentStats {
  matches: number;
  kills: number;
  deaths: number;
  kd: string;
  wins: number;
  losses: number;
}

export interface ValorantStats {
  account: ValorantAccount;
  rank: string;
  elo: number;
  recentStats: ValorantRecentStats;
}

export function useValorantStats() {
  const [stats, setStats] = useState<ValorantStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchStats = async (ingameId: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await supabase.functions.invoke("fetch-valorant-stats", {
        body: { ingame_id: ingameId },
      });

      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);

      setStats(res.data);
      toast({ title: "Stats synced!", description: `${res.data.rank} • K/D: ${res.data.recentStats.kd}` });
      return res.data;
    } catch (err: any) {
      toast({ title: "Error fetching stats", description: err.message, variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, fetchStats };
}

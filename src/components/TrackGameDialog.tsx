import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface TrackGameDialogProps {
  open: boolean;
  onClose: () => void;
  gameName: string;
  onConfirm: (ingameId: string) => Promise<void>;
}

const placeholders: Record<string, string> = {
  Valorant: "Name#Tag (e.g. TenZ#0505)",
  "League of Legends": "Summoner#Tag",
  "Apex Legends": "EA ID or Origin name",
  Fortnite: "Epic Games username",
  "Counter-Strike 2": "Steam ID or vanity URL",
};

const TrackGameDialog = ({ open, onClose, gameName, onConfirm }: TrackGameDialogProps) => {
  const [ingameId, setIngameId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!ingameId.trim()) return;
    setLoading(true);
    try {
      await onConfirm(ingameId.trim());
      setIngameId("");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Track {gameName}</DialogTitle>
          <DialogDescription>
            Enter your in-game ID so we can automatically fetch your stats.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="ingame-id">In-Game ID</Label>
          <Input
            id="ingame-id"
            placeholder={placeholders[gameName] || "Your in-game username or ID"}
            value={ingameId}
            onChange={(e) => setIngameId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!ingameId.trim() || loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Track & Fetch Stats
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TrackGameDialog;

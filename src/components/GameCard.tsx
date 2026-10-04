import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";

interface GameCardProps {
  game: {
    id: string;
    name: string;
    category: string;
    image_url?: string;
  };
  isTracked: boolean;
  onToggle: () => void;
  ingameId?: string;
}

const GameCard = ({ game, isTracked, onToggle, ingameId }: GameCardProps) => {
  return (
    <Card className="overflow-hidden rounded-md border-border bg-card/40 shadow-none transition-colors hover:border-primary/50 group">
      <div className="flex items-center gap-3 p-3.5">
        <img
          src={game.image_url || "/placeholder.svg"}
          alt={game.name}
          className="h-12 w-12 shrink-0 rounded-md border border-border object-cover transition-colors group-hover:border-primary/30"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <CardTitle className="truncate text-sm font-semibold">{game.name}</CardTitle>
            {isTracked && <Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-[10px] font-medium">Tracking</Badge>}
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">{game.category}</p>
          {ingameId && <p className="mt-1 truncate text-[11px] text-muted-foreground/80">ID: {ingameId}</p>}
        </div>
        <Button
          onClick={onToggle}
          variant={isTracked ? "outline" : "default"}
          size="icon"
          className="h-8 w-8 shrink-0"
          aria-label={isTracked ? `Remove ${game.name}` : `Track ${game.name}`}
          title={isTracked ? "Remove tracking" : "Track game"}
        >
          {isTracked ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>
    </Card>
  );
};

export default GameCard;

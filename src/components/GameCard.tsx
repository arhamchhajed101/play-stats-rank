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
}

const GameCard = ({ game, isTracked, onToggle }: GameCardProps) => {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden hover:border-primary/50 transition-colors group">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={game.image_url || "/placeholder.svg"}
          alt={game.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
      </div>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{game.name}</CardTitle>
            <Badge variant="secondary" className="mt-2">
              {game.category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button
          onClick={onToggle}
          variant={isTracked ? "outline" : "default"}
          className="w-full"
        >
          {isTracked ? (
            <>
              <Minus className="h-4 w-4 mr-2" />
              Remove
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Track
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GameCard;

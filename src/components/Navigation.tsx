import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gamepad2, Home, Trophy, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    localStorage.removeItem("gamers_tag_demo_user");
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }

    toast({
      title: "Logged out",
      description: "See you next game, Gamer!",
    });
    navigate("/");
  };

  return (
    <nav className="border-b border-border/50 bg-card/40 backdrop-blur-xl sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-3.5">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
              <Gamepad2 className="h-5 w-5 text-primary" style={{ filter: "drop-shadow(var(--shadow-glow))" }} />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary/90 bg-clip-text">
              Gamers Tag
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant={location.pathname === "/dashboard" ? "default" : "ghost"}
              size="sm"
              className={location.pathname === "/dashboard" ? "shadow-glow font-bold" : "text-muted-foreground hover:text-foreground"}
              asChild
            >
              <Link to="/dashboard">
                <Home className="h-4 w-4 mr-1.5" />
                Dashboard
              </Link>
            </Button>
            <Button
              variant={location.pathname === "/profile" ? "default" : "ghost"}
              size="sm"
              className={location.pathname === "/profile" ? "shadow-glow font-bold" : "text-muted-foreground hover:text-foreground"}
              asChild
            >
              <Link to="/profile">
                <User className="h-4 w-4 mr-1.5" />
                Profile
              </Link>
            </Button>
            <Button
              variant={location.pathname === "/leaderboard" ? "default" : "ghost"}
              size="sm"
              className={location.pathname === "/leaderboard" ? "shadow-glow font-bold" : "text-muted-foreground hover:text-foreground"}
              asChild
            >
              <Link to="/leaderboard">
                <Trophy className="h-4 w-4 mr-1.5" />
                Leaderboard
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

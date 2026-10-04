import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gamepad2, Home, Trophy, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { clearLocalSession } from "@/lib/localAuth";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    clearLocalSession();
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
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card transition-colors group-hover:border-primary/50">
              <Gamepad2 className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold text-foreground">
              Gamers Tag
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant={location.pathname === "/dashboard" ? "default" : "ghost"}
              size="sm"
              className={location.pathname === "/dashboard" ? "font-semibold" : "text-muted-foreground hover:text-foreground"}
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
              className={location.pathname === "/profile" ? "font-semibold" : "text-muted-foreground hover:text-foreground"}
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
              className={location.pathname === "/leaderboard" ? "font-semibold" : "text-muted-foreground hover:text-foreground"}
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

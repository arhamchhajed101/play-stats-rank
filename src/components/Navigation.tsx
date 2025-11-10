import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gamepad2, Home, Trophy, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out",
        description: "See you next game!",
      });
      navigate("/");
    }
  };

  return (
    <nav className="border-b border-border/50 bg-card/30 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Gamepad2 className="h-8 w-8 text-primary" style={{ filter: "drop-shadow(var(--shadow-glow))" }} />
            <span className="text-xl font-bold">Gamers Tag</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button
              variant={location.pathname === "/dashboard" ? "default" : "ghost"}
              asChild
            >
              <Link to="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button
              variant={location.pathname === "/leaderboard" ? "default" : "ghost"}
              asChild
            >
              <Link to="/leaderboard">
                <Trophy className="h-4 w-4 mr-2" />
                Leaderboard
              </Link>
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

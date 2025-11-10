import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Trophy, BarChart3, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-gaming.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-border/50 bg-card/30 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-8 w-8 text-primary" style={{ filter: "drop-shadow(var(--shadow-glow))" }} />
              <span className="text-xl font-bold">Gamers Tag</span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-background/90" />
        </div>
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-gradient">
              Track Your Gaming Journey
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Unified gameplay tracking, points system, and competitive leaderboards. 
              Elevate your gaming performance and compete with the best.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/auth">Start Tracking</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/leaderboard">View Leaderboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm text-center">
            <CardHeader>
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Sign Up</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create your gamer profile in seconds
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm text-center">
            <CardHeader>
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <Gamepad2 className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Select Games</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Choose which games you want to track
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm text-center">
            <CardHeader>
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Track Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                View your daily hours and performance metrics
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm text-center">
            <CardHeader>
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Compete</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Earn points and climb the leaderboard
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl text-center">Ready to Level Up?</CardTitle>
              <CardDescription className="text-center text-lg">
                Join thousands of gamers tracking their performance
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button size="lg" asChild>
                <Link to="/auth">Create Your Account</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;

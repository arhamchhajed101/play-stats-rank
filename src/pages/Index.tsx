import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Trophy, BarChart3, Users, Link2, Brain, Swords, Shield, Target, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-identity.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-8 w-8 text-primary" style={{ filter: "drop-shadow(var(--shadow-glow))" }} />
              <span className="text-xl font-bold tracking-tight">Gamers Tag</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#skills" className="hover:text-foreground transition-colors">Skills</a>
              <a href="#community" className="hover:text-foreground transition-colors">Community</a>
              <Link to="/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block mb-6 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
                Your Complete Gaming Identity
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary animate-gradient">
                More Than a Username.
              </span>
              <br />
              <span className="text-foreground">Your True Gamer Identity.</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Connect all your games. Understand your real skills. Discover what kind of gamer you truly are — beyond wins, losses, and ranks.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button size="lg" className="text-base px-8" asChild>
                <Link to="/auth">
                  Create Your Identity <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 border-border/50" asChild>
                <Link to="/leaderboard">Explore Leaderboard</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Your stats are <span className="text-primary">everywhere</span>. Your identity is <span className="text-muted-foreground">nowhere</span>.
            </h2>
            <p className="text-muted-foreground text-lg">
              Multiple game IDs, scattered achievements, isolated rankings. No single place truly represents who you are as a gamer. Until now.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Link2, title: "Fragmented IDs", desc: "Different username on every platform. No unified presence." },
              { icon: BarChart3, title: "Isolated Stats", desc: "Raw numbers that don't tell the full story of your skill." },
              { icon: Users, title: "Random Matchmaking", desc: "Teamed with strangers. No way to find your ideal squad." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
              >
                <Card className="border-border/30 bg-card/50 backdrop-blur-sm h-full text-center">
                  <CardHeader>
                    <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-destructive" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">One Identity. Every Game.</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Gamers Tag brings all your gaming data together into one powerful, unified profile.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Link2, title: "Connect All Games", desc: "Link Valorant, CS2, Fortnite, Apex & more. One profile, every game.", color: "primary" },
              { icon: BarChart3, title: "Unified Analytics", desc: "See your performance across all games in one comprehensive dashboard.", color: "secondary" },
              { icon: Brain, title: "Skill Analysis", desc: "Go beyond K/D. Discover your real strengths — aim, strategy, teamwork.", color: "accent" },
              { icon: Trophy, title: "Earn & Compete", desc: "Gain points from all your games. Climb the unified leaderboard.", color: "primary" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="border-border/30 bg-card/60 backdrop-blur-sm h-full hover:border-primary/30 transition-colors group">
                  <CardHeader>
                    <div className={`mb-3 w-12 h-12 rounded-xl bg-${item.color}/15 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <item.icon className={`h-6 w-6 text-${item.color}`} />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Skill Analysis */}
      <section id="skills" className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
            >
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">Beyond Raw Numbers</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-6">
                Understand How You <span className="text-secondary">Actually</span> Play
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Gamers Tag translates your gameplay data into meaningful skills. See how you improve over time and discover what kind of gamer you truly are.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Target, label: "Aiming Precision", value: 78 },
                  { icon: Brain, label: "Decision Making", value: 85 },
                  { icon: Shield, label: "Consistency", value: 72 },
                  { icon: Users, label: "Teamwork", value: 90 },
                  { icon: Swords, label: "Aggression", value: 65 },
                ].map((skill) => (
                  <div key={skill.label} className="flex items-center gap-4">
                    <skill.icon className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm font-medium w-36">{skill.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-10 text-right">{skill.value}%</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={2}
            >
              <Card className="border-border/30 bg-card/60 backdrop-blur-sm p-8">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center">
                    <Gamepad2 className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold">ShadowStrike</h3>
                  <p className="text-muted-foreground text-sm">Strategic Aggressor</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                  <div>
                    <div className="text-2xl font-bold text-primary">4</div>
                    <div className="text-xs text-muted-foreground">Games</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary">2,450</div>
                    <div className="text-xs text-muted-foreground">Points</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent">Top 5%</div>
                    <div className="text-xs text-muted-foreground">Global</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Valorant", "CS2", "Apex", "Fortnite"].map((game) => (
                    <span key={game} className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {game}
                    </span>
                  ))}
                </div>
              </Card>
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 rounded-2xl -z-10 blur-xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Community */}
      <section id="community" className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Find Your Squad</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Connect with players who match your playstyle and mindset. No more random matchmaking — build real teams.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Users, title: "Playstyle Matching", desc: "Find teammates based on how you play, not just your rank." },
              { icon: Swords, title: "Squad Builder", desc: "Form balanced teams with complementary skills and strategies." },
              { icon: Zap, title: "Social Hub", desc: "Interact, share achievements, and grow your gaming network." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="border-border/30 bg-card/60 backdrop-blur-sm h-full text-center">
                  <CardHeader>
                    <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-secondary" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Every Gamer</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { title: "Casual Players", desc: "Track your journey, celebrate your growth, and have fun with meaningful insights.", emoji: "🎮" },
              { title: "Competitive Players", desc: "Analyze your skills, identify weaknesses, and push your rank with data-driven improvement.", emoji: "⚔️" },
              { title: "Aspiring Esports Athletes", desc: "Build a verified portfolio of your gaming ability. Let your skills speak for themselves.", emoji: "🏆" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="border-border/30 bg-card/50 backdrop-blur-sm h-full text-center p-8">
                  <div className="text-4xl mb-4">{item.emoji}</div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-secondary/5 backdrop-blur-sm p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-50" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Discover Your True Gamer Identity?
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                  Join Gamers Tag and see yourself as more than a username. Your skills deserve recognition.
                </p>
                <Button size="lg" className="text-base px-8" asChild>
                  <Link to="/auth">
                    Create Your Identity <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">Gamers Tag</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 Gamers Tag. Your digital gaming identity.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { emailSchema, passwordSchema, usernameSchema, getValidationError } from "@/lib/validation";
import { Gamepad2, Eye, EyeOff, Sparkles, UserCheck, ShieldCheck } from "lucide-react";

const DEMO_USER_ID = "demo-gamer-user-id";
const DEMO_PROFILE = {
  id: DEMO_USER_ID,
  username: "ShadowStrike",
  total_points: 2450,
  created_at: new Date().toISOString(),
};

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Ensure user profile exists in database
  const ensureUserProfile = async (userId: string, userEmail: string, chosenUsername?: string) => {
    try {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (!existingProfile) {
        const finalUsername = chosenUsername || userEmail.split("@")[0] || "Gamer";
        await supabase.from("profiles").upsert({
          id: userId,
          username: finalUsername,
          total_points: 1000,
          created_at: new Date().toISOString(),
        });
      }
    } catch {
      // Ignore background profile sync error
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const emailErr = getValidationError(emailSchema, email);
    if (emailErr) {
      toast({ title: "Invalid email", description: emailErr, variant: "destructive" });
      return;
    }

    if (mode !== "forgot") {
      const passErr = getValidationError(passwordSchema, password);
      if (passErr) {
        toast({ title: "Invalid password", description: passErr, variant: "destructive" });
        return;
      }
    }

    if (mode === "signup" && username) {
      const userErr = getValidationError(usernameSchema, username);
      if (userErr) {
        toast({ title: "Invalid username", description: userErr, variant: "destructive" });
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast({
          title: "Check your email",
          description: "We sent you a password reset link.",
        });
        setMode("login");
        return;
      }

      if (mode === "login") {
        // Direct standard Supabase Auth Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          // If login fails, provide clear advice
          throw error;
        }

        if (data?.user) {
          await ensureUserProfile(data.user.id, data.user.email || email);
          toast({
            title: "Welcome back!",
            description: "Successfully signed in to Gamers Tag.",
          });
          navigate("/dashboard");
        }
      } else {
        // Direct standard Supabase Auth SignUp
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              username: username.trim(),
            },
          },
        });

        if (error) throw error;

        if (data?.user) {
          await ensureUserProfile(data.user.id, data.user.email || email, username.trim());
          
          if (data.session) {
            toast({
              title: "Account created!",
              description: "Welcome to Gamers Tag! Setting up your gaming identity...",
            });
            navigate("/dashboard");
          } else {
            toast({
              title: "Account registered!",
              description: "Check your email to verify your account or sign in directly.",
            });
            setMode("login");
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: error.message || "Could not sign in. Please verify your credentials.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Instant Demo Gamer Login (One-click access)
  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      // First attempt test demo credentials if configured, or authenticate with test account
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "demo@gamerstag.gg",
        password: "Password123!",
      });

      if (!error && data?.session) {
        toast({
          title: "Demo Mode Activated!",
          description: "Logged in as Pro Gamer ShadowStrike.",
        });
        navigate("/dashboard");
        return;
      }

      // If test account not yet created, create it automatically
      const signUpRes = await supabase.auth.signUp({
        email: "demo@gamerstag.gg",
        password: "Password123!",
        options: { data: { username: "ShadowStrike" } },
      });

      if (signUpRes.data?.user) {
        await ensureUserProfile(signUpRes.data.user.id, "demo@gamerstag.gg", "ShadowStrike");
        if (signUpRes.data.session) {
          toast({
            title: "Welcome, ShadowStrike!",
            description: "Pro demo profile ready.",
          });
          navigate("/dashboard");
          return;
        }
      }

      // Fallback guest session
      localStorage.setItem("gamers_tag_demo_user", JSON.stringify(DEMO_PROFILE));
      toast({
        title: "Guest Explorer Mode",
        description: "Exploring Gamers Tag with full dashboard features.",
      });
      navigate("/dashboard");
    } catch {
      localStorage.setItem("gamers_tag_demo_user", JSON.stringify(DEMO_PROFILE));
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center shadow-lg">
              <Gamepad2 className="h-8 w-8 text-primary" style={{ filter: "drop-shadow(var(--shadow-glow))" }} />
            </div>
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight">
            {mode === "login" ? "Welcome Back, Gamer" : mode === "signup" ? "Join Gamers Tag" : "Reset Password"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Sign in to track your gaming stats & climb the ranks"
              : mode === "signup"
              ? "Create your unified gaming identity in seconds"
              : "Enter your email to receive a secure reset link"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleAuth} className="space-y-3.5">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="username">Username / Gamertag</Label>
                <Input
                  id="username"
                  placeholder="ProGamer123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-background/50 border-border/60"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="gamer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50 border-border/60"
              />
            </div>

            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background/50 border-border/60 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full font-bold shadow-lg" disabled={loading}>
              {loading
                ? "Connecting..."
                : mode === "login"
                ? "Sign In"
                : mode === "signup"
                ? "Create Account"
                : "Send Reset Link"}
            </Button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-semibold">Or Instant Access</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 text-foreground transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span>One-Click Pro Gamer Demo</span>
          </Button>

          <div className="text-center text-sm pt-2">
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary hover:underline font-medium"
            >
              {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-3 pt-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Secure Auth
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <UserCheck className="h-3.5 w-3.5 text-blue-400" />
              Instant Session Sync
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

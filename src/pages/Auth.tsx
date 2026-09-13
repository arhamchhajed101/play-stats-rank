import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { emailSchema, passwordSchema, usernameSchema, getValidationError } from "@/lib/validation";
import { Gamepad2, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { createLocalAccount, signInLocalAccount } from "@/lib/localAuth";

const AUTH_ERRORS: Record<string, string> = {
  "Invalid login credentials": "Incorrect email or password. Please try again.",
  "Email not confirmed": "Please check your email and click the confirmation link before signing in.",
  "User already registered": "An account with this email already exists. Try signing in instead.",
  "Password should be at least": "Password must be at least 8 characters.",
  "signup_disabled": "New sign-ups are temporarily disabled. Please try again later.",
  "over_email_send_rate_limit": "Too many attempts. Please wait a few minutes before trying again.",
  "email_address_not_authorized": "This email is not authorized. Contact support.",
  "Failed to fetch": "Cannot connect to server. Please check your connection and try again.",
  "NetworkError": "Network error. Please check your internet connection.",
};

function friendlyError(msg: string): string {
  for (const [key, friendly] of Object.entries(AUTH_ERRORS)) {
    if (msg.toLowerCase().includes(key.toLowerCase())) return friendly;
  }
  return msg || "Something went wrong. Please try again.";
}

function isBackendUnavailable(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network error") ||
    message.includes("for security purposes") ||
    message.includes("over_email_send_rate_limit")
  );
}

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/dashboard");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Clear error when switching modes
  useEffect(() => {
    setErrorMsg("");
  }, [mode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Client-side validation
    const emailErr = getValidationError(emailSchema, email);
    if (emailErr) { setErrorMsg(emailErr); return; }

    if (mode !== "forgot") {
      const passErr = getValidationError(passwordSchema, password);
      if (passErr) { setErrorMsg(passErr); return; }
    }

    if (mode === "signup") {
      const userErr = getValidationError(usernameSchema, username);
      if (userErr) { setErrorMsg(userErr); return; }
    }

    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast({
          title: "Reset link sent!",
          description: "Check your email for a password reset link.",
        });
        setMode("login");
        return;
      }

      if (mode === "login") {
        // Sign in directly against Supabase Auth. This is the standard,
        // supported path — it uses the anon key and needs no custom edge
        // function, so there's no extra deployment/config that can break it.
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (isBackendUnavailable(error)) {
            const localAccount = await signInLocalAccount(email, password);
            toast({ title: "Welcome back!", description: `Signed in as ${localAccount.username}.` });
            navigate("/dashboard");
            return;
          }
          throw error;
        }

        if (!data?.session) {
          throw new Error("Login failed — no session returned. Please try again.");
        }

        toast({ title: "Welcome back! 🎮", description: "Successfully signed in." });
        navigate("/dashboard");
        return;
      } else {
        // Signup — use direct Supabase client (no edge function)
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { username: username.trim() },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) {
          if (isBackendUnavailable(error)) {
            const localAccount = await createLocalAccount(email, password, username);
            toast({ title: "Account created!", description: `Welcome to Gamers Tag, ${localAccount.username}.` });
            navigate("/dashboard");
            return;
          }
          throw error;
        }

        // If email confirmation is disabled, session is returned immediately
        if (data.session) {
          toast({
            title: "Account created! 🎉",
            description: "Welcome to Gamers Tag!",
          });
          navigate("/dashboard");
        } else {
          // Email confirmation required
          toast({
            title: "Almost there!",
            description: "We sent you a confirmation email. Click the link to activate your account, then sign in.",
          });
          setMode("login");
        }
      }
    } catch (error) {
      if (isBackendUnavailable(error) && mode === "signup") {
        try {
          const localAccount = await createLocalAccount(email, password, username);
          toast({ title: "Account created!", description: `Welcome to Gamers Tag, ${localAccount.username}.` });
          navigate("/dashboard");
          return;
        } catch (localError) {
          setErrorMsg(friendlyError(localError instanceof Error ? localError.message : ""));
          return;
        }
      }

      if (isBackendUnavailable(error) && mode === "login") {
        try {
          const localAccount = await signInLocalAccount(email, password);
          toast({ title: "Welcome back!", description: `Signed in as ${localAccount.username}.` });
          navigate("/dashboard");
          return;
        } catch (localError) {
          setErrorMsg(friendlyError(localError instanceof Error ? localError.message : ""));
          return;
        }
      }

      const msg = friendlyError(error instanceof Error ? error.message : "");
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const modeTitle = mode === "login" ? "Welcome Back" : mode === "signup" ? "Join Gamers Tag" : "Reset Password";
  const modeDesc =
    mode === "login"
      ? "Sign in to track your gaming stats"
      : mode === "signup"
      ? "Create an account to start tracking"
      : "Enter your email to receive a reset link";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center shadow-lg">
              <Gamepad2 className="h-9 w-9 text-primary" style={{ filter: "drop-shadow(var(--shadow-glow))" }} />
            </div>
          </div>
          <CardTitle className="text-2xl text-center font-extrabold">{modeTitle}</CardTitle>
          <CardDescription className="text-center">{modeDesc}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4" noValidate>
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="ProGamer123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">2–30 characters. Letters, numbers, hyphens, underscores only.</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="gamer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            {mode !== "forgot" && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {mode === "signup" && (
                  <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
                )}
              </div>
            )}

            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Inline error message */}
            {errorMsg && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button type="submit" className="w-full font-bold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === "login" ? "Signing in..." : mode === "signup" ? "Creating account..." : "Sending..."}
                </>
              ) : mode === "login" ? (
                "Sign In"
              ) : mode === "signup" ? (
                "Create Account"
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {mode !== "forgot" ? (
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-primary hover:underline font-medium"
              >
                {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-primary hover:underline font-medium"
              >
                ← Back to sign in
              </button>
            )}
          </div>

          {mode === "signup" && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              By signing up you agree to our Terms of Service and Privacy Policy.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

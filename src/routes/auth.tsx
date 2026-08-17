import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { AthenaAvatar } from "@/components/garden/AthenaAvatar";
import { GardenSky } from "@/components/garden/GardenSky";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to AthenaGrow — Your Learning Garden" },
      {
        name: "description",
        content:
          "Sign in to AthenaGrow and grow a living learning garden from your own syllabus and notes.",
      },
      { property: "og:title", content: "Sign in to AthenaGrow" },
      {
        property: "og:description",
        content: "Welcome back to your learning garden. Grow knowledge like a living plant.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home" });
      else setChecking(false);
    });
  }, [navigate]);

  function normalizeEmail(value: string) {
    const v = value.trim();
    return v.includes("@") ? v : `${v.toLowerCase().replace(/[^a-z0-9._-]/g, "")}@athenagrow.app`;
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const identity = normalizeEmail(email);
    try {
      if (!identity || password.length < 6) {
        throw new Error("Enter your name or email and a password with at least 6 characters.");
      }
      const attempt = await supabase.auth.signInWithPassword({ email: identity, password });
      if (attempt.error) {
        const created = await supabase.auth.signUp({
          email: identity,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (created.error) throw new Error(created.error.message);
        if (!created.data.session) {
          const retry = await supabase.auth.signInWithPassword({ email: identity, password });
          if (retry.error) throw new Error(retry.error.message);
        }
      }
      navigate({ to: "/home" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign you in.");
    } finally {
      setPending(false);
    }
  }

  async function google() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in is unavailable right now. Use your name and password instead.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/home" });
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <GardenSky className="h-40" />
      <main className="mx-auto -mt-16 max-w-md px-5 pb-16">
        <div className="rounded-3xl glass-card p-6 animate-grow-in">
          <div className="flex flex-col items-center text-center">
            <AthenaAvatar size={72} />
            <h1 className="mt-3 font-display text-3xl">AthenaGrow</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back to your learning garden.
            </p>
          </div>

          <form className="mt-6 space-y-3" onSubmit={signIn}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Name or email"
              autoComplete="username"
              className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="h-12 w-full rounded-2xl text-base" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          <Button
            type="button"
            variant="outline"
            className="mt-3 h-12 w-full rounded-2xl"
            onClick={() => void google()}
          >
            Continue with Google
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            New here? Signing in creates your garden automatically.
          </p>
        </div>
      </main>
    </div>
  );
}

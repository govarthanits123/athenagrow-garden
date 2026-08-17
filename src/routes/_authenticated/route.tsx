import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { Compass, Home, Leaf, Sparkles, TrendingUp, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

const NAV = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/garden", label: "Garden", icon: Leaf },
  { to: "/athena", label: "Athena", icon: Sparkles },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/profile", label: "Profile", icon: User },
] as const;

function AuthenticatedLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideNav = pathname.startsWith("/onboarding");

  return (
    <div className="min-h-screen pb-24">
      <Outlet />
      {!hideNav && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-2 py-2">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[11px] transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <item.icon className={cn("h-5 w-5", active && "scale-110")} />
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/discover"
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[11px] transition-colors",
                pathname.startsWith("/discover")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Compass className="h-5 w-5" />
              Discover
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}

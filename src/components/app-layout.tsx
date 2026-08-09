import { Link, useRouterState, useNavigate, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Activity,
  Droplet,
  Building2,
  ArrowLeftRight,
  BarChart3,
  Bell,
  Settings,
  UserRound,
  Search,
  Command,
  LogOut,
} from "lucide-react";
import { getStoredUser, isAuthenticated, clearAuth, type AuthUser } from "@/lib/auth";
import { CopilotWidget } from "@/components/copilot-widget";

const nav = [
  {
    label: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/operations", label: "Recommended Transfers", icon: Activity, star: true },
    ],
  },
  {
    label: "Network",
    items: [
      { to: "/inventory", label: "Blood Inventory", icon: Droplet },
      { to: "/banks", label: "Blood Banks", icon: Building2 },
      { to: "/transfers", label: "Transfer History", icon: ArrowLeftRight },
    ],
  },
  {
    label: "Insights",
    items: [
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
      // These three pages aren't wired to the API yet (no useQuery/useMutation
      // calls) — previously the Notifications item showed a hardcoded "3"
      // badge implying real unread notifications that don't exist anywhere
      // in the data model. Marked "Preview" instead of removed, so the nav
      // stays honest about what's live without hiding that the pages exist.
      { to: "/notifications", label: "Notifications", icon: Bell, preview: true },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/settings", label: "Settings", icon: Settings, preview: true },
      { to: "/profile", label: "Profile", icon: UserRound, preview: true },
    ],
  },
] as const;

function PulseLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center ${compact ? "gap-2" : "gap-2.5"}`}>
      <div className={`relative flex items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm ${compact ? "h-7 w-7" : "h-8 w-8"}`}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h3l2-5 4 10 2-5h7" />
        </svg>
      </div>
      <div className={compact ? "hidden" : "leading-tight"}>
        <div className="text-[15px] font-semibold tracking-tight text-foreground">PulseLink</div>
        <div className="text-[11px] text-muted-foreground">Blood Logistics OS</div>
      </div>
    </div>
  );
}

function initialsFor(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  // Auth check runs client-side only (JWT lives in localStorage, which
  // doesn't exist during SSR). On first client render we check once, and
  // redirect to /login if there's no valid token — everything except the
  // login page itself is gated.
  useEffect(() => {
    if (pathname === "/login") {
      setCheckedAuth(true);
      return;
    }
    if (!isAuthenticated()) {
      navigate({ to: "/login", replace: true });
      return;
    }
    setUser(getStoredUser());
    setCheckedAuth(true);
  }, [pathname, navigate]);

  const handleLogout = () => {
    clearAuth();
    navigate({ to: "/login", replace: true });
  };

  // The login screen owns its own full-page layout — no sidebar/topbar.
  if (pathname === "/login") {
    return <Outlet />;
  }

  // Brief gate while the client-side auth check runs, to avoid a flash of
  // protected content before the redirect (or before we know we're clear).
  if (!checkedAuth) {
    return <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-muted-foreground">Loading…</div>;
  }

  const displayName = user?.name ?? "Signed in";
  const displayRole = user?.role === "admin" ? "Administrator" : (user?.role ?? "Operator");

  return (
    <div className="flex min-h-screen w-full bg-surface">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <PulseLogo />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {nav.map((group) => (
            <div key={group.label} className="mb-5">
              <div className="mb-1.5 px-3 text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground/80">
                {group.label}
              </div>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.to;
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={`group flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors ${
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                        }`}
                      >
                        <Icon className={`h-[16px] w-[16px] ${active ? "text-primary" : ""}`} strokeWidth={2} />
                        <span className="flex-1">{item.label}</span>
                        {"star" in item && item.star ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        ) : null}
                        {"preview" in item && item.preview ? (
                          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Preview
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
              {initialsFor(displayName)}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-[12.5px] font-medium text-foreground">{displayName}</div>
              <div className="truncate text-[11px] text-muted-foreground">{displayRole}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/85 px-8 backdrop-blur-md">
          <div className="flex h-9 flex-1 max-w-md items-center gap-2 rounded-md border border-border bg-surface px-3 text-muted-foreground">
            <Search className="h-4 w-4" />
            <input
              placeholder="Search units, banks, transfers…"
              className="h-full flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <span className="hidden items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium md:inline-flex">
              <Command className="h-3 w-3" /> K
            </span>
          </div>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-surface hover:text-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
            {initialsFor(displayName)}
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <CopilotWidget />
    </div>
  );
}

export function PageShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1400px] px-8 pb-16 pt-12">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-foreground">{title}</h1>
          {subtitle ? (
            <p className="mt-1.5 max-w-2xl text-[14px] text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageShell } from "@/components/app-layout";
import { apiGet } from "@/lib/api";
import { ArrowRight, Sparkles, ChevronRight, Check, Activity, Truck } from "lucide-react";

type RecentActivityItem = {
  _id: string;
  sourceBloodBank: { name: string; city: string };
  destinationBloodBank: { name: string; city: string };
  bloodGroup: string;
  component: string;
  units: number;
  createdAt: string;
};

type AlertItem = {
  id: string;
  bloodBank: string;
  city: string;
  bloodGroup: string;
  component: string;
  units: number;
  expiryDate: string;
  hoursRemaining: number;
};

type DashboardResponse = {
  stats: {
    activeRecommendations: number;
    criticalUnits: number;
    activeTransfers: number;
    connectedBloodBanks: number;
  };
  recentActivity: RecentActivityItem[];
  alerts: AlertItem[];
  topRecommendations: {
    id: string;
    status: string;
    source: string;
    sourceCity: string;
    destination: string;
    destinationCity: string;
    bloodGroup: string;
    component: string;
    units: number;
    distance: number;
    confidence: number;
    priority: string;
    reason: string;
  }[];
};

const PRIORITY_BADGE_STYLES: Record<string, string> = {
  critical: "bg-red-500/10 text-red-600",
  high: "bg-orange-500/10 text-orange-600",
  medium: "bg-amber-500/10 text-amber-600",
  low: "bg-muted text-muted-foreground",
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — PulseLink" },
      { name: "description", content: "What requires your attention today across the PulseLink network." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiGet<{ success: boolean; data: DashboardResponse }>("/api/dashboard"),
  });
  const dashboard = data?.data;
  const stats = dashboard?.stats;
  const recentActivity = dashboard?.recentActivity ?? [];
  const alerts = dashboard?.alerts ?? [];
  const topRecommendations = dashboard?.topRecommendations ?? [];

  // Same recommendation, same server-side effects, same query-invalidation
  // pattern already used on the Operations page — approving/rejecting here
  // updates the dashboard, recommendations list, transfers, and inventory
  // everywhere at once, exactly like a live production app.
  return (
    <PageShell
      title="Dashboard"
      subtitle="Monitor blood shortages, expiring inventory, and recommended transfers across the network."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/operations"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-[13px] font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            Open Operations Center <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-9 rounded-md border border-border bg-card px-3.5 text-[13px] font-medium hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            Refresh Dashboard
          </button>
        </div>
      }
    >
      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-card px-6 py-5 text-muted-foreground">Loading…</div>
          ))
        ) : isError || !stats ? (
          <div className="col-span-4 bg-card px-6 py-5 text-red-600">Unable to load dashboard stats.</div>
        ) : (
          [
            { label: "Active recommendations", value: stats.activeRecommendations },
            { label: "Critical expiring units", value: stats.criticalUnits },
            { label: "Active transfers", value: stats.activeTransfers },
            { label: "Connected banks", value: stats.connectedBloodBanks },
          ].map((s) => (
            <div key={s.label} className="bg-card px-6 py-5">
              <div className="text-[28px] font-semibold leading-none tracking-tight">{s.value}</div>
              <div className="mt-2 text-[12px] text-muted-foreground">{s.label}</div>
            </div>
          ))
        )}
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-[15px] font-semibold tracking-tight">Priority recommendations</h2>
          <Link to="/operations" className="text-[12px] text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </div>

        {topRecommendations.length === 0 ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between px-8 pt-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3 w-3" /> AI Recommendation
              </div>
            </div>
            <div className="p-8 text-center text-muted-foreground">No recommendations currently available.</div>
          </div>
        ) : (
          <div className="space-y-4">
            {topRecommendations.map((rec) => {
              return (
                <div key={rec.id} className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between px-8 pt-7">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-primary">
                        <Sparkles className="h-3 w-3" /> AI Recommendation
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider ${PRIORITY_BADGE_STYLES[rec.priority] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {rec.priority}
                      </span>
                    </div>
                    <div className="text-[11.5px] text-muted-foreground">Confidence {rec.confidence}%</div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 px-8 py-8 md:grid-cols-[1fr_auto_1fr] md:items-center">
                    <div>
                      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">Source</div>
                      <div className="mt-2 text-[20px] font-semibold tracking-tight">{rec.source}</div>
                      <div className="mt-0.5 text-[13px] text-muted-foreground">{rec.sourceCity}</div>
                    </div>
                    <div className="hidden md:flex md:justify-center">
                      <ArrowRight className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <div className="md:text-right">
                      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">Destination</div>
                      <div className="mt-2 text-[20px] font-semibold tracking-tight">{rec.destination}</div>
                      <div className="mt-0.5 text-[13px] text-muted-foreground">{rec.destinationCity}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 border-t border-border md:grid-cols-4">
                    {[
                      ["Blood group", rec.bloodGroup],
                      ["Component", rec.component],
                      ["Units", `${rec.units}`],
                      ["Distance", `${rec.distance} km`],
                    ].map(([l, v], i) => (
                      <div key={l} className={`px-8 py-5 ${i > 0 ? "border-l border-border" : ""} ${i === 2 ? "max-md:border-l-0" : ""}`}>
                        <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">{l}</div>
                        <div className={`mt-1.5 text-[16px] font-semibold ${l === "Distance" ? "text-primary" : ""}`}>{v}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-border px-8 py-4">
                    <span className="text-[12px] text-muted-foreground">
                      Dashboard is a read-only overview — review and approve in Operations.
                    </span>
                    <Link
                      to="/operations"
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
                    >
                      Review in Operations <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[15px] font-semibold tracking-tight">Recent activity</h2>
            <span className="text-[11.5px] text-muted-foreground">Today</span>
          </div>
          <div className="rounded-xl border border-border bg-card">
            <ul className="divide-y divide-border">
              {isLoading ? (
                <li className="p-8 text-center text-muted-foreground">Loading recent activity…</li>
              ) : isError ? (
                <li className="p-8 text-center text-red-600">Unable to load recent activity.</li>
              ) : recentActivity.length === 0 ? (
                <li className="p-8 text-center text-muted-foreground">No recent activity available.</li>
              ) : (
                recentActivity.map((activity) => (
                  <li key={activity._id} className="flex items-center gap-4 px-5 py-4">
                    <Check className="h-4 w-4 shrink-0 text-success" strokeWidth={2} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-medium">{activity.component} transfer updated</div>
                      <div className="text-[12px] text-muted-foreground">
                        {activity.bloodGroup} · {activity.units} units · {activity.sourceBloodBank?.name ?? 'Unknown source'} → {activity.destinationBloodBank?.name ?? 'Unknown destination'}
                      </div>
                    </div>
                    <div className="text-[11.5px] text-muted-foreground">{new Date(activity.createdAt).toLocaleString()}</div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[15px] font-semibold tracking-tight">Alerts</h2>
            <button className="text-[11.5px] text-muted-foreground hover:text-foreground">View all</button>
          </div>
          <div className="rounded-xl border border-border bg-card">
            <ul className="divide-y divide-border">
              {isLoading ? (
                <li className="p-8 text-center text-muted-foreground">Loading alerts…</li>
              ) : isError ? (
                <li className="p-8 text-center text-red-600">Unable to load alerts.</li>
              ) : alerts.length === 0 ? (
                <li className="p-8 text-center text-muted-foreground">No alerts currently.</li>
              ) : (
                alerts.slice(0, 4).map((alert) => (
                  <li key={alert.id} className="flex items-start gap-3 px-5 py-4">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium">{alert.bloodGroup} expiring soon at {alert.bloodBank}</div>
                      <div className="text-[11.5px] text-muted-foreground">{alert.units} units · {alert.hoursRemaining}h remaining</div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

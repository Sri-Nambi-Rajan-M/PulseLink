import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/app-layout";
import { AlertTriangle, Check, Sparkles, Truck, Bell } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — PulseLink" },
      { name: "description", content: "System alerts, recommendations and network updates." },
    ],
  }),
  component: Notifications,
});

const items = [
  { title: "O− shortage predicted at GMCH Vellore", desc: "Model projects shortage within 48 hours. Consider dispatching from Apollo.", tone: "primary", time: "2m ago", icon: AlertTriangle, unread: true },
  { title: "New AI recommendation ready", desc: "B+ Plasma · 15 units · City Central → Brooklyn Blood Services", tone: "info", time: "18m ago", icon: Sparkles, unread: true },
  { title: "Transfer #TRF-2026-001 dispatched", desc: "12 units O+ Platelets · ETA 45 mins", tone: "info", time: "1h ago", icon: Truck, unread: true },
  { title: "Transfer #TRF-2026-003 completed", desc: "10 units B+ Plasma delivered to CMC", tone: "success", time: "Yesterday", icon: Check },
  { title: "Weekly network report available", desc: "236 units saved · 94% success rate", tone: "muted", time: "2 days ago", icon: Bell },
];

function Notifications() {
  return (
    <PageShell
      title="Notifications"
      subtitle="All alerts, AI recommendations and network updates in one place."
      actions={
        <>
          <button className="h-9 rounded-md border border-border bg-card px-3.5 text-[13px] font-medium hover:bg-surface">Mark all as read</button>
        </>
      }
    >
      <div className="flex items-center gap-2">
        {["All", "Unread", "Recommendations", "Transfers", "System"].map((t, i) => (
          <button key={t} className={`h-8 rounded-md px-3 text-[12.5px] font-medium ${i === 0 ? "bg-foreground text-background" : "border border-border bg-card hover:bg-surface"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card">
        <ul className="divide-y divide-border">
          {items.map((n, i) => {
            const Icon = n.icon;
            const tone =
              n.tone === "primary"
                ? "bg-primary/10 text-primary"
                : n.tone === "success"
                  ? "bg-success/10 text-success"
                  : n.tone === "info"
                    ? "bg-info/10 text-info"
                    : "bg-muted text-muted-foreground";
            return (
              <li key={i} className={`flex items-start gap-4 px-5 py-4 ${n.unread ? "bg-primary/[0.02]" : ""}`}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-[13.5px] font-medium text-foreground">{n.title}</div>
                    {n.unread ? <span className="h-1.5 w-1.5 rounded-full bg-primary" /> : null}
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-muted-foreground">{n.desc}</div>
                </div>
                <div className="whitespace-nowrap text-[11.5px] text-muted-foreground">{n.time}</div>
              </li>
            );
          })}
        </ul>
      </div>
    </PageShell>
  );
}

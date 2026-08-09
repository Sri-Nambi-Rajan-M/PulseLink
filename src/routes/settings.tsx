import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/app-layout";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — PulseLink" },
      { name: "description", content: "Manage your PulseLink workspace, integrations and preferences." },
    ],
  }),
  component: SettingsPage,
});

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-[13.5px] font-medium">{label}</div>
        {hint ? <div className="text-[12px] text-muted-foreground">{hint}</div> : null}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function Toggle({ on = false }: { on?: boolean }) {
  return (
    <span className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition ${on ? "bg-primary" : "bg-border"}`}>
      <span className={`h-4 w-4 rounded-full bg-white shadow transition ${on ? "translate-x-4" : ""}`} />
    </span>
  );
}

function SettingsPage() {
  return (
    <PageShell title="Settings" subtitle="Manage your workspace, alerts and integrations.">
      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 lg:col-span-3">
          <ul className="space-y-1 text-[13px]">
            {["Workspace", "Alerts", "AI & Recommendations", "Integrations", "Billing", "Security"].map((s, i) => (
              <li key={s}>
                <button className={`w-full rounded-md px-3 py-2 text-left ${i === 0 ? "bg-surface font-medium text-foreground" : "text-muted-foreground hover:bg-surface hover:text-foreground"}`}>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="col-span-12 space-y-6 lg:col-span-9">
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4 text-[14px] font-semibold">Workspace</div>
            <Row label="Organization name" hint="Displayed to connected banks">
              <input defaultValue="Tamil Nadu Blood Logistics" className="h-9 w-64 rounded-md border border-border bg-background px-3 text-[13px] outline-none focus:ring-2 focus:ring-ring/40" />
            </Row>
            <Row label="Region" hint="Primary operational region">
              <select className="h-9 w-64 rounded-md border border-border bg-background px-3 text-[13px] outline-none">
                <option>South India</option>
                <option>North India</option>
                <option>Pan-India</option>
              </select>
            </Row>
            <Row label="Timezone">
              <select className="h-9 w-64 rounded-md border border-border bg-background px-3 text-[13px] outline-none">
                <option>Asia/Kolkata (GMT+5:30)</option>
              </select>
            </Row>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4 text-[14px] font-semibold">Alerts</div>
            <Row label="Critical expiry warnings" hint="Notify when a unit expires within 24 hours"><Toggle on /></Row>
            <Row label="AI recommendations" hint="Push notifications for new proposals"><Toggle on /></Row>
            <Row label="Transfer status updates" hint="Track dispatch, in-transit and delivery"><Toggle on /></Row>
            <Row label="Weekly performance report" hint="Emailed every Monday 08:00"><Toggle /></Row>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4 text-[14px] font-semibold">AI & Recommendations</div>
            <Row label="Auto-approve low-risk transfers" hint="Distance under 5 km and confidence over 95%"><Toggle /></Row>
            <Row label="Model" hint="AI model powering recommendations">
              <select className="h-9 w-64 rounded-md border border-border bg-background px-3 text-[13px] outline-none">
                <option>PulseLink Neural v3.2</option>
                <option>PulseLink Neural v3.1</option>
              </select>
            </Row>
          </div>

          <div className="flex justify-end gap-2">
            <button className="h-9 rounded-md border border-border bg-card px-3.5 text-[13px] font-medium hover:bg-surface">Discard</button>
            <button className="h-9 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90">Save changes</button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

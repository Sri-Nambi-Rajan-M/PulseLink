import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/app-layout";
import { Mail, Phone, MapPin, Shield } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — PulseLink" },
      { name: "description", content: "Your PulseLink profile and account details." },
    ],
  }),
  component: Profile,
});

function Profile() {
  return (
    <PageShell title="Profile" subtitle="Your account, role and activity within the PulseLink network.">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-[22px] font-semibold text-primary">
              PR
            </div>
            <div className="mt-4 text-[17px] font-semibold">Dr. Priya Raghavan</div>
            <div className="text-[13px] text-muted-foreground">Regional Coordinator · Apollo Blood Bank</div>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11.5px] font-semibold text-success">
              <Shield className="h-3 w-3" /> Verified administrator
            </div>
            <div className="mt-6 space-y-2 text-left text-[12.5px]">
              <div className="inline-flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" /> priya.r@pulselink.health</div>
              <div className="inline-flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /> +91 44 2029 3333</div>
              <div className="inline-flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> Chennai, Tamil Nadu</div>
            </div>
          </div>
        </div>

        <div className="col-span-12 space-y-6 lg:col-span-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { l: "Approvals", v: "312" },
              { l: "Units saved", v: "1,248" },
              { l: "Success rate", v: "96%" },
              { l: "Avg. response", v: "3m 12s" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-border bg-card px-4 py-3">
                <div className="text-[11.5px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
                <div className="mt-1 text-[20px] font-semibold tracking-tight">{s.v}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4 text-[14px] font-semibold">Account details</div>
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              {[
                ["Full name", "Priya Raghavan"],
                ["Employee ID", "PL-00218"],
                ["Role", "Regional Coordinator"],
                ["Organization", "Apollo Blood Bank"],
                ["Joined", "March 2024"],
                ["Last login", "Today, 08:14 AM"],
              ].map(([l, v]) => (
                <div key={l}>
                  <div className="text-[11.5px] uppercase tracking-wider text-muted-foreground">{l}</div>
                  <div className="mt-1 text-[13.5px] font-medium">{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4 text-[14px] font-semibold">Recent approvals</div>
            <ul className="divide-y divide-border">
              {[
                { title: "Approved · Apollo → GMCH Vellore", meta: "O+ Platelets · 12 units · Today, 10:24 AM" },
                { title: "Approved · City Central → Brooklyn Blood Services", meta: "B+ Plasma · 15 units · Yesterday, 4:12 PM" },
                { title: "Approved · Queens Blood Donation Center → Bronx Community Blood Bank", meta: "A− Whole Blood · 8 units · 2 days ago" },
              ].map((a, i) => (
                <li key={i} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <div className="text-[13.5px] font-medium">{a.title}</div>
                    <div className="text-[12px] text-muted-foreground">{a.meta}</div>
                  </div>
                  <button className="text-[12px] font-medium text-muted-foreground hover:text-foreground">Details</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

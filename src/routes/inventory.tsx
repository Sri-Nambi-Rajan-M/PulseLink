import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/app-layout";
import { Search, Filter, ArrowUpDown, Plus, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { apiBase, apiGet, apiPost, apiPut } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Blood Inventory — PulseLink" },
      { name: "description", content: "Real-time blood component inventory across connected banks." },
    ],
  }),
  component: Inventory,
});

type InventoryRow = {
  _id: string;
  bloodGroup: string;
  component: string;
  units: number;
  expiryDate: string;
  status: string;
  bloodBank: { _id: string; name: string; city: string };
};

function StatusPill({ s }: { s: string }) {
  const map: Record<string, string> = {
    available: "bg-success/10 text-success",
    reserved: "bg-warning/15 text-warning-foreground",
    expired: "bg-primary/10 text-primary",
    transferred: "bg-primary text-primary-foreground",
  };
  return <span className={`inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold ${map[s] ?? "bg-muted text-muted-foreground"}`}>{s}</span>;
}

function Inventory() {
  const MOCK_INVENTORY: InventoryRow[] = [
    {
      _id: 'mock-1',
      bloodGroup: 'O+',
      component: 'Whole Blood',
      units: 5,
      expiryDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      status: 'available',
      bloodBank: { _id: 'mock-bank-1', name: 'Demo Blood Bank', city: 'Sample City' },
    },
  ];

  const [showSampleData, setShowSampleData] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => apiGet<{ success: boolean; data: InventoryRow[] }>("/api/inventory"),
  });
  const rows = showSampleData ? MOCK_INVENTORY : data?.data ?? [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ bloodBank: "", bloodGroup: "A+", component: "Whole Blood", units: 1, expiryDate: "" });

  const { data: banksData, isError: banksError } = useQuery({
    queryKey: ["bloodbanks"],
    queryFn: () => apiGet<{ success: boolean; data: { _id: string; name: string; city: string }[] }>("/api/bloodbanks"),
  });
  // Note: unlike the table above, this list feeds the Add/Edit dialog's bank
  // dropdown — a *write* path. If the real bank list fails to load, showing
  // fake banks here would let someone submit an inventory record against a
  // bank ID that doesn't exist. So this never falls back to mock data; the
  // dialog is disabled instead (see disabled={banksError} below).
  const banks = banksData?.data ?? [];

  const openAdd = () => {
    setEditingId(null);
    setForm({ bloodBank: "", bloodGroup: "A+", component: "Whole Blood", units: 1, expiryDate: "" });
    setDialogOpen(true);
  };

  const openEdit = (r: InventoryRow) => {
    setEditingId(r._id);
    setForm({
      bloodBank: r.bloodBank?._id || "",
      bloodGroup: r.bloodGroup,
      component: r.component,
      units: r.units,
      expiryDate: r.expiryDate?.slice(0, 10) || "",
    });
    setDialogOpen(true);
  };

  const submit = async () => {
    const body = { bloodBank: form.bloodBank, bloodGroup: form.bloodGroup, component: form.component, units: Number(form.units), expiryDate: form.expiryDate };
    try {
      if (editingId) {
        await apiPut(`/api/inventory/${editingId}`, body);
      } else {
        await apiPost(`/api/inventory`, body);
      }
      setDialogOpen(false);
      refetch();
    } catch (e) {
      // swallow — api layer throws ApiError with message
      alert((e as any).message || 'Error');
    }
  };

  return (
    <PageShell
      title="Blood Inventory"
      subtitle="View and manage the current blood stock across the network. This data powers recommendations and forecasts."
      actions={
        <>
          <button onClick={() => refetch()} className="h-9 rounded-md border border-border bg-card px-3.5 text-[13px] font-medium hover:bg-surface">
            Refresh Inventory
          </button>
          <button
            onClick={async () => {
              try {
                const token = getToken();
                const res = await fetch(`${apiBase}/api/inventory/export`, {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) throw new Error("Unable to export inventory.");
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "pulselink-inventory.csv";
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              } catch (e) {
                alert((e as any).message || "Error exporting inventory.");
              }
            }}
            className="h-9 rounded-md border border-border bg-card px-3.5 text-[13px] font-medium hover:bg-surface"
          >
            Export CSV
          </button>
          <button onClick={openAdd} disabled={!!banksError} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-[13px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60" title={banksError ? "Bank list unavailable — cannot add inventory right now." : undefined}>
            <Plus className="h-4 w-4" /> Add Inventory
          </button>
        </>
      }
    >
      {(() => {
        // Mirrors the same par-level thresholds the recommendation engine
        // uses server-side (recommendationService.js PAR_LEVEL) so "Low
        // stock" here means the same thing it means everywhere else in the
        // app — not a second, inconsistent definition of "shortage."
        const PAR_LEVEL: Record<string, number> = {
          "Whole Blood": 12,
          "Red Blood Cells": 12,
          Platelets: 6,
          Plasma: 10,
        };
        const available = rows.filter((r) => r.status === "available");
        const now = Date.now();
        const expiringSoon = available.filter(
          (r) => (new Date(r.expiryDate).getTime() - now) / 3600000 < 48,
        );
        const stockByGroupComponent = new Map<string, number>();
        for (const r of available) {
          const key = `${r.bloodGroup}__${r.component}`;
          stockByGroupComponent.set(key, (stockByGroupComponent.get(key) ?? 0) + r.units);
        }
        const lowStockCombos = Array.from(stockByGroupComponent.entries()).filter(
          ([key, units]) => {
            const component = key.split("__")[1];
            const par = PAR_LEVEL[component] ?? 10;
            return units < par;
          },
        );
        const healthyCount = stockByGroupComponent.size - lowStockCombos.length;

        return (
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3">
              <div className="text-[11.5px] font-medium text-primary">Low stock</div>
              <div className="mt-0.5 text-[20px] font-semibold text-foreground">{lowStockCombos.length}</div>
              <div className="text-[11px] text-muted-foreground">blood group / component combinations below par level</div>
            </div>
            <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
              <div className="text-[11.5px] font-medium text-warning-foreground">Expiring soon</div>
              <div className="mt-0.5 text-[20px] font-semibold text-foreground">{expiringSoon.length}</div>
              <div className="text-[11px] text-muted-foreground">units expiring within 48 hours</div>
            </div>
            <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3">
              <div className="text-[11.5px] font-medium text-success">Healthy</div>
              <div className="mt-0.5 text-[20px] font-semibold text-foreground">{Math.max(healthyCount, 0)}</div>
              <div className="text-[11px] text-muted-foreground">combinations at or above par level</div>
            </div>
          </div>
        );
      })()}

      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <div className="flex h-9 flex-1 min-w-[220px] items-center gap-2 rounded-md border border-border bg-surface px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Search blood group, component, location…" className="h-full flex-1 bg-transparent text-[13px] outline-none" />
          </div>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-[13px] font-medium hover:bg-surface">
            <Filter className="h-3.5 w-3.5" /> All Components
          </button>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-[13px] font-medium hover:bg-surface">
            <Filter className="h-3.5 w-3.5" /> All Statuses
          </button>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-[13px] font-medium hover:bg-surface">
            <ArrowUpDown className="h-3.5 w-3.5" /> Sort
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading inventory…</div>
        ) : isError && !showSampleData ? (
          <div className="p-8 text-center">
            <p className="text-red-600">Unable to reach the PulseLink API — no live inventory available.</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button onClick={() => refetch()} className="h-9 rounded-md border border-border bg-background px-3.5 text-[13px] font-medium hover:bg-surface">Retry</button>
              <button onClick={() => setShowSampleData(true)} className="h-9 rounded-md border border-border bg-background px-3.5 text-[13px] font-medium hover:bg-surface">View sample data instead</button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {showSampleData ? (
              <div className="m-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-[13px] text-amber-900">
                Showing sample data — the PulseLink API is unreachable, so this is not live inventory.{" "}
                <button onClick={() => { setShowSampleData(false); refetch(); }} className="font-medium underline underline-offset-2">
                  Try live data again
                </button>
              </div>
            ) : null}
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-surface/60 text-left text-[11.5px] font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3">Blood Group</th>
                  <th className="px-5 py-3">Component</th>
                  <th className="px-5 py-3">Available Units</th>
                  <th className="px-5 py-3">Expiry Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Blood Bank</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id} className="border-b border-border/70 last:border-b-0 hover:bg-surface/60">
                    <td className="px-5 py-3.5">
                      <span className="inline-flex h-7 min-w-[36px] items-center justify-center rounded-md bg-primary/10 px-2 text-[12px] font-semibold text-primary">
                        {r.bloodGroup}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-foreground">{r.component}</td>
                    <td className="px-5 py-3.5 font-semibold text-foreground">{r.units}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{new Date(r.expiryDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5"><StatusPill s={r.status} /></td>
                    <td className="px-5 py-3.5 text-muted-foreground">{r.bloodBank?.name ?? 'Unknown bank'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => openEdit(r)} className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
                {/* Add / Edit Inventory Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingId ? 'Edit Inventory' : 'Add Inventory'}</DialogTitle>
                      <DialogDescription>{editingId ? 'Modify this batch.' : 'Create a new inventory batch.'}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Blood Bank</Label>
                          <select value={form.bloodBank} onChange={(e) => setForm({ ...form, bloodBank: e.target.value })} className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-[13px] outline-none">
                            <option value="">Select bank</option>
                            {banks.map((b: any) => (
                              <option key={b._id} value={b._id}>{b.name} · {b.city}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Blood Group</Label>
                          <select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-[13px] outline-none">
                            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Component</Label>
                          <input value={form.component} onChange={(e) => setForm({ ...form, component: e.target.value })} className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-[13px] outline-none" />
                        </div>
                        <div>
                          <Label>Units</Label>
                          <input type="number" min={0} value={form.units} onChange={(e) => setForm({ ...form, units: Number(e.target.value) })} className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-[13px] outline-none" />
                        </div>
                      </div>
                      <div>
                        <Label>Expiry Date</Label>
                        <Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={submit} className="h-9 w-full rounded-md bg-primary text-[13px] font-medium text-primary-foreground">{editingId ? 'Save Changes' : 'Add Batch'}</button>
                      <button onClick={() => setDialogOpen(false)} className="h-9 w-full rounded-md border border-border">Cancel</button>
                    </div>
                  </DialogContent>
                </Dialog>
          </div>
        )}
      </div>
    </PageShell>
  );
}

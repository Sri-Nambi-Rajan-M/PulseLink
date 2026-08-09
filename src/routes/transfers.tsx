import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/app-layout";
import { apiBase, apiGet, apiPatch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Search, Check, Truck, X, Clock } from "lucide-react";

type TransferItem = {
  _id: string;
  status: "initiated" | "in_transit" | "completed" | "cancelled" | string;
  bloodGroup: string;
  component: string;
  units: number;
  sourceBloodBank?: { name: string; city: string };
  destinationBloodBank?: { name: string; city: string };
  createdAt: string;
};

export const Route = createFileRoute("/transfers")({
  head: () => ({
    meta: [
      { title: "Transfer History — PulseLink" },
      { name: "description", content: "Full history of blood transfers across the PulseLink network." },
    ],
  }),
  component: Transfers,
});

function StatusPill({ s }: { s: string }) {
  const map: Record<string, string> = {
    initiated: "bg-info/10 text-info",
    in_transit: "bg-info/10 text-info",
    completed: "bg-success/10 text-success",
    cancelled: "bg-primary/10 text-primary",
    approved: "bg-success/10 text-success",
  };
  return <span className={`inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold ${map[s] ?? "bg-muted text-muted-foreground"}`}>{s.replace("_", " ")}</span>;
}

function Transfers() {
  const queryClient = useQueryClient();
  const [showSampleData, setShowSampleData] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const MOCK_TRANSFERS: TransferItem[] = [
    {
      _id: 'mock-transfer-1',
      status: 'initiated',
      bloodGroup: 'A+',
      component: 'Platelets',
      units: 4,
      sourceBloodBank: { name: 'Demo Source Bank', city: 'Sample City' },
      destinationBloodBank: { name: 'Demo Destination Bank', city: 'Sample City' },
      createdAt: new Date().toISOString(),
    },
  ];

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["transfers"],
    queryFn: () => apiGet<{ success: boolean; data: TransferItem[] }>("/api/transfers"),
  });
  const transfers = showSampleData ? MOCK_TRANSFERS : data?.data ?? [];

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPatch<{ success: boolean; data: TransferItem }>(`/api/transfers/${id}/status`, { status }),
    onSuccess: (_res, vars) => {
      setActionMessage(`Transfer marked as ${vars.status.replace("_", " ")}.`);
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (error: unknown) => {
      setActionMessage(error instanceof Error ? error.message : "Unable to update transfer status.");
    },
  });

  // Next valid action per status, mirroring the backend's NEXT_STATUS map
  // in transferController.js — kept in sync manually since this is a small,
  // stable state machine (initiated -> in_transit -> completed, or -> cancelled).
  function nextActions(status: string): { label: string; status: string }[] {
    if (status === "initiated") return [{ label: "Mark in transit", status: "in_transit" }, { label: "Cancel", status: "cancelled" }];
    if (status === "in_transit") return [{ label: "Mark completed", status: "completed" }, { label: "Cancel", status: "cancelled" }];
    return [];
  }

  async function downloadDocument(transferId: string) {
    try {
      const token = getToken();
      const res = await fetch(`${apiBase}/api/transfers/${transferId}/document`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Unable to download document.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transfer-${transferId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "Unable to download document.");
    }
  }

  return (
    <PageShell
      title="Transfer History"
      subtitle="Track all blood transfers coordinated across the network and their outcomes."
    >
      {actionMessage ? (
        <div className="mb-4 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
          {actionMessage}
        </div>
      ) : null}
      {isError && !showSampleData ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-red-600">Unable to reach the PulseLink API — no live transfer history available.</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => refetch()}
              className="h-9 rounded-md border border-border bg-background px-3.5 text-[13px] font-medium hover:bg-surface"
            >
              Retry
            </button>
            <button
              onClick={() => setShowSampleData(true)}
              className="h-9 rounded-md border border-border bg-background px-3.5 text-[13px] font-medium hover:bg-surface"
            >
              View sample data instead
            </button>
          </div>
        </div>
      ) : (
        <>
          {showSampleData ? (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
              Showing sample data — the PulseLink API is unreachable, so this is not live network data.{" "}
              <button
                onClick={() => {
                  setShowSampleData(false);
                  refetch();
                }}
                className="font-medium underline underline-offset-2"
              >
                Try live data again
              </button>
            </div>
          ) : null}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4 text-[14px] font-semibold">Recent Activity</div>
        <ul className="p-5">
          {isLoading ? (
            <li className="p-8 text-center text-muted-foreground">Loading transfer activity…</li>
          ) : transfers.length === 0 ? (
            <li className="p-8 text-center text-muted-foreground">No transfer history available.</li>
          ) : (
            transfers.slice(0, 4).map((t, i, arr) => {
              const toneClass = t.status === "completed"
                ? "bg-success/10 text-success"
                : t.status === "in_transit" || t.status === "initiated"
                  ? "bg-info/10 text-info"
                  : "bg-primary/10 text-primary";
              const Icon = t.status === "cancelled" ? X : t.status === "completed" ? Check : Truck;
              const label = t.status === "cancelled" ? "Cancelled" : t.status === "completed" ? "Completed" : t.status === "in_transit" ? "In Transit" : "In Progress";

              return (
                <li key={t._id} className="relative flex gap-4 pb-4 last:pb-0">
                  {i < arr.length - 1 && <span className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />}
                  <div className={`z-10 flex h-8 w-8 items-center justify-center rounded-full ${toneClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-[13.5px] font-medium">Transfer #{t._id.slice(-6)} {label.toLowerCase()}</div>
                      <div className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground"><Clock className="h-3 w-3" /> {new Date(t.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-[12.5px] text-muted-foreground">
                      {t.units} units {t.bloodGroup} · {t.sourceBloodBank?.name ?? 'Unknown source'} → {t.destinationBloodBank?.name ?? 'Unknown destination'}
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <div className="flex h-9 flex-1 min-w-[220px] items-center gap-2 rounded-md border border-border bg-surface px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Search transfers…" className="h-full flex-1 bg-transparent text-[13px] outline-none" />
          </div>
          <button className="h-9 rounded-md border border-border bg-background px-3 text-[13px] font-medium hover:bg-surface">All Statuses</button>
          <button className="h-9 rounded-md border border-border bg-background px-3 text-[13px] font-medium hover:bg-surface">All Blood Groups</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-surface/60 text-left text-[11.5px] font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Transfer ID</th>
                <th className="px-5 py-3">Blood Group / Component</th>
                <th className="px-5 py-3">Units</th>
                <th className="px-5 py-3">From</th>
                <th className="px-5 py-3">To</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date & Time</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="px-5 py-6 text-center text-muted-foreground">Loading transfers…</td></tr>
              ) : transfers.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-6 text-center text-muted-foreground">No transfers found.</td></tr>
              ) : (
                transfers.map((t) => (
                  <tr key={t._id} className="border-b border-border/70 last:border-b-0 hover:bg-surface/60">
                    <td className="px-5 py-3.5 font-medium text-foreground">{t._id}</td>
                    <td className="px-5 py-3.5">{t.bloodGroup} · {t.component}</td>
                    <td className="px-5 py-3.5 font-semibold">{t.units}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{t.sourceBloodBank?.name ?? 'Unknown'}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{t.destinationBloodBank?.name ?? 'Unknown'}</td>
                    <td className="px-5 py-3.5"><StatusPill s={t.status} /></td>
                    <td className="px-5 py-3.5 text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {nextActions(t.status).map((action) => (
                          <button
                            key={action.status}
                            onClick={() => statusMutation.mutate({ id: t._id, status: action.status })}
                            disabled={statusMutation.isPending || showSampleData}
                            className="rounded-md border border-border bg-background px-2 py-1 text-[11.5px] font-medium hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {action.label}
                          </button>
                        ))}
                        <button
                          onClick={() => downloadDocument(t._id)}
                          disabled={showSampleData}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                          title="Download document"
                        >
                          ⬇️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </PageShell>
  );
}

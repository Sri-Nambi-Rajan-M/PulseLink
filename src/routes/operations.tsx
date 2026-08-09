import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/app-layout";
import { apiGet, apiPost } from "@/lib/api";
import {
  Sparkles,
  Check,
  Users,
  Timer,
  ShieldAlert,
  Ruler,
  Droplets,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

export const Route = createFileRoute("/operations")({
  head: () => ({
    meta: [
      { title: "Redistribution Operations Center — PulseLink" },
      {
        name: "description",
        content:
          "Monitor, prioritize and coordinate intelligent blood redistribution across connected blood banks.",
      },
    ],
  }),
  component: Ops,
});

type RecommendationItem = {
  _id: string;
  status: string;
  priority: "high" | "medium" | "low" | "critical";
  sourceBloodBank?: { name: string; city: string; latitude?: number; longitude?: number };
  destinationBloodBank?: { name: string; city: string; latitude?: number; longitude?: number };
  bloodGroup: string;
  component: string;
  units: number;
  distance: number;
  confidence: number;
  expiryScore: number;
  deficitScore: number;
  distanceScore: number;
  matchType: "exact" | "compatible";
  deficitBloodGroup: string;
  estimatedTransferTime: number;
  expiryHoursRemaining: number;
  aiReason: string;
};

type Rec = {
  id: string;
  priority: "high" | "medium" | "low" | "critical";
  source: string;
  sourceCity: string;
  dest: string;
  destCity: string;
  group: string;
  component: string;
  units: number;
  distance: string;
  eta: string;
  confidence: number;
  expiryScore: number;
  deficitScore: number;
  distanceScore: number;
  matchType: "exact" | "compatible";
  neededBloodGroup: string;
  reasons: string[];
  expiresIn: string;
  status: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
};

const MOCK_RECOMMENDATIONS: RecommendationItem[] = [
  {
    _id: 'mock-rec-1',
    status: 'pending',
    priority: 'high',
    sourceBloodBank: { name: 'Demo Source Bank', city: 'Sample City', latitude: 11.0, longitude: 77.0 },
    destinationBloodBank: { name: 'Demo Destination Bank', city: 'Sample City', latitude: 11.4, longitude: 77.7 },
    bloodGroup: 'O+',
    component: 'Whole Blood',
    units: 3,
    distance: 12.4,
    confidence: 91,
    expiryScore: 80,
    deficitScore: 83,
    distanceScore: 100,
    matchType: 'exact',
    deficitBloodGroup: 'O+',
    estimatedTransferTime: 90,
    expiryHoursRemaining: 72,
    aiReason: 'Sample data — could not reach the PulseLink API. This is not a live recommendation.',
  },
];

// Projects real lat/long onto a 0..1 canvas, using the bounding box of
// whatever banks are actually in view (not a hardcoded region), padded so
// source/destination labels never sit flush against an edge — that padding
// gap is what was causing labels to clip/overlap before, since the old
// map used four fixed decorative coordinate pairs with no relationship to
// the real network at all.
function projectLatLng(
  lat: number,
  lng: number,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
) {
  const latRange = bounds.maxLat - bounds.minLat || 1;
  const lngRange = bounds.maxLng - bounds.minLng || 1;
  const PAD = 0.16; // keep points within the middle 68% of the canvas
  const nx = (lng - bounds.minLng) / lngRange;
  const ny = (lat - bounds.minLat) / latRange;
  return {
    x: PAD + nx * (1 - 2 * PAD),
    y: PAD + (1 - ny) * (1 - 2 * PAD), // invert: higher latitude = further north = toward the top
  };
}

function formatEta(minutes: number) {
  if (!minutes) return "TBD";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins} mins`;
}

function Ops() {
  const queryClient = useQueryClient();
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<Record<string, { text: string; usedFallback: boolean }>>({});

  const [showSampleData, setShowSampleData] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["recommendations"],
    queryFn: () => apiGet<{ success: boolean; data: RecommendationItem[] }>("/api/recommendations"),
  });
  const recommendations = (showSampleData ? MOCK_RECOMMENDATIONS : data?.data ?? []).filter(
    (item) => item.status === "pending",
  );
  const resolvedCount = (data?.data ?? []).filter((item) => item.status !== "pending").length;

  // Compute a bounding box from every real bank coordinate currently in
  // view, so the map always fits whatever network is actually loaded
  // instead of assuming a fixed region.
  const bounds = useMemo(() => {
    const lats: number[] = [];
    const lngs: number[] = [];
    for (const item of recommendations) {
      if (item.sourceBloodBank?.latitude != null && item.sourceBloodBank?.longitude != null) {
        lats.push(item.sourceBloodBank.latitude);
        lngs.push(item.sourceBloodBank.longitude);
      }
      if (item.destinationBloodBank?.latitude != null && item.destinationBloodBank?.longitude != null) {
        lats.push(item.destinationBloodBank.latitude);
        lngs.push(item.destinationBloodBank.longitude);
      }
    }
    if (lats.length === 0) {
      // No real coordinates available (e.g. sample data) — fall back to a
      // fixed box so the map still renders something reasonable.
      return { minLat: 10.5, maxLat: 13.1, minLng: 76.9, maxLng: 79.7 };
    }
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  }, [recommendations]);

  const recs = useMemo<Rec[]>(() =>
    recommendations.map((item) => {
      const hasRealCoords =
        item.sourceBloodBank?.latitude != null &&
        item.sourceBloodBank?.longitude != null &&
        item.destinationBloodBank?.latitude != null &&
        item.destinationBloodBank?.longitude != null;

      const from = hasRealCoords
        ? projectLatLng(item.sourceBloodBank!.latitude!, item.sourceBloodBank!.longitude!, bounds)
        : { x: 0.25, y: 0.5 };
      const to = hasRealCoords
        ? projectLatLng(item.destinationBloodBank!.latitude!, item.destinationBloodBank!.longitude!, bounds)
        : { x: 0.75, y: 0.5 };

      return {
        id: item._id,
        priority: item.priority,
        source: item.sourceBloodBank?.name || 'Unknown source',
        sourceCity: item.sourceBloodBank?.city || '',
        dest: item.destinationBloodBank?.name || 'Unknown destination',
        destCity: item.destinationBloodBank?.city || '',
        group: item.bloodGroup,
        component: item.component,
        units: item.units,
        distance: `${item.distance.toFixed(1)} km`,
        eta: formatEta(item.estimatedTransferTime),
        confidence: item.confidence,
        expiryScore: item.expiryScore,
        deficitScore: item.deficitScore,
        distanceScore: item.distanceScore,
        matchType: item.matchType,
        neededBloodGroup: item.deficitBloodGroup || item.bloodGroup,
        reasons: item.aiReason ? item.aiReason.split(". ").filter(Boolean).map((reason) => reason.trim()) : ['No extra details available.'],
        expiresIn: `${item.expiryHoursRemaining} hrs`,
        from,
        to,
        status: item.status,
      };
    }),
    [recommendations, bounds]
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCalculation, setShowCalculation] = useState(false);
  const selected = recs.find((r) => r.id === selectedId) ?? recs[0] ?? null;

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["inventory"] });
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
    queryClient.invalidateQueries({ queryKey: ["transfers"] });
  };

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiPost<{ success: boolean; data: RecommendationItem }>(`/api/recommendations/${id}/approve`),
    onSuccess: () => {
      setActionMessage("Recommendation approved and transfer initiated.");
      invalidateAll();
    },
    onError: (error: unknown) => {
      setActionMessage(error instanceof Error ? error.message : "Unable to approve recommendation.");
    },
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) => apiPost<{ success: boolean; data: RecommendationItem }>(`/api/recommendations/${id}/reject`),
    onSuccess: () => {
      setActionMessage("Recommendation dismissed successfully.");
      invalidateAll();
    },
    onError: (error: unknown) => {
      setActionMessage(error instanceof Error ? error.message : "Unable to dismiss recommendation.");
    },
  });

  const generateMutation = useMutation({
    mutationFn: () => apiPost<{ success: boolean; data: RecommendationItem[] }>("/api/recommendations/generate"),
    onSuccess: () => {
      setActionMessage("AI recommendations regenerated.");
      invalidateAll();
      refetch();
    },
    onError: (error: unknown) => {
      setActionMessage(error instanceof Error ? error.message : "Unable to regenerate recommendations.");
    },
  });

  const explainMutation = useMutation({
    mutationFn: (id: string) =>
      apiPost<{ success: boolean; data: { text: string; configured: boolean; usedFallback?: boolean } }>(
        `/api/recommendations/${id}/explain`,
      ),
    onSuccess: (res, id) => {
      setAiExplanation((prev) => ({
        ...prev,
        [id]: { text: res.data.text, usedFallback: !!res.data.usedFallback },
      }));
    },
    onError: (error: unknown) => {
      setActionMessage(error instanceof Error ? error.message : "Unable to generate AI explanation.");
    },
  });

  const actionInProgress = approveMutation.isPending || dismissMutation.isPending || generateMutation.isPending;

  return (
    <PageShell
      title="Recommended Transfers"
      subtitle="Review AI-ranked transfers that can reduce shortages and prevent inventory expiry."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={actionInProgress}
            className="h-9 rounded-md border border-border bg-card px-3.5 text-[13px] font-medium hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            Refresh
          </button>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={actionInProgress}
            className="h-9 rounded-md bg-primary px-3.5 text-[13px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Generate New Recommendations
          </button>
        </div>
      }
    >
      {actionMessage ? (
        <div className="mb-4 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
          {actionMessage}
        </div>
      ) : null}
      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">Loading recommendations…</div>
      ) : isError && !showSampleData ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-red-600">Unable to reach the PulseLink API — no live recommendations available.</p>
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
      ) : recs.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">No recommendations available.</div>
      ) : (
        <section className="grid grid-cols-12 gap-6">
          {showSampleData ? (
            <div className="col-span-12 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
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
          <div className="col-span-12 xl:col-span-4">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-[15px] font-semibold tracking-tight">Top Recommendations</h2>
              <span className="text-[11.5px] text-muted-foreground">
                {resolvedCount > 0 ? `${resolvedCount} resolved this session · ` : ""}Ranked by expiry × impact
              </span>
            </div>
            <div className="space-y-3">
              {recs.map((r) => {
                const active = r.id === selected?.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => { setSelectedId(r.id); setShowCalculation(false); }}
                    className={`group w-full rounded-xl border bg-card p-5 text-left transition ${
                      active
                        ? "border-primary/50 ring-1 ring-primary/20 shadow-sm"
                        : "border-border hover:border-foreground/15"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold uppercase tracking-wider ${
                          r.priority === "high"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {r.priority}
                      </span>
                      <span className="text-[11px] text-muted-foreground">#{r.id}</span>
                    </div>

                    <div className="mt-4 flex items-center gap-3 text-[13.5px]">
                      <div className="min-w-0 flex-1 truncate font-medium text-foreground">{r.source}</div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1 truncate font-medium text-foreground">{r.dest}</div>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11.5px] text-muted-foreground">
                      <div className="min-w-0 flex-1 truncate">{r.sourceCity}</div>
                      <div className="w-3.5 shrink-0" />
                      <div className="min-w-0 flex-1 truncate">{r.destCity}</div>
                    </div>

                    <div className="mt-4 flex items-center gap-4 text-[12px]">
                      <span className="font-semibold text-primary">{r.group}</span>
                      <span className="text-muted-foreground">{r.component}</span>
                      {r.matchType === "compatible" ? (
                        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                          needs {r.neededBloodGroup}
                        </span>
                      ) : null}
                      <span className="ml-auto text-foreground">{r.units} units</span>
                      <span className="text-muted-foreground">{r.confidence}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="col-span-12 xl:col-span-5">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-[15px] font-semibold tracking-tight">Network Route</h2>
              <span className="text-[11.5px] text-muted-foreground">
                {selected?.distance} · ETA {selected?.eta}
              </span>
            </div>
            {selected ? <NetworkMap selected={selected} /> : null}
          </div>

          <div className="col-span-12 xl:col-span-3">
            {/* Plain-language "why" comes first — this is what the user needs
                to decide, before the supporting facts and before any numeric
                detail. */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <div className="text-[13px] font-semibold text-foreground">
                    Why this was recommended
                  </div>
                </div>
                {selected && !aiExplanation[selected.id] ? (
                  <button
                    onClick={() => explainMutation.mutate(selected.id)}
                    disabled={explainMutation.isPending}
                    className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Sparkles className="h-3 w-3" />
                    {explainMutation.isPending ? "Asking AI…" : "Explain with AI"}
                  </button>
                ) : null}
              </div>

              {selected && aiExplanation[selected.id] ? (
                <div className="mt-3 space-y-2">
                  <p className="text-[12.5px] leading-relaxed text-foreground">
                    {aiExplanation[selected.id].text}
                  </p>
                  {aiExplanation[selected.id].usedFallback ? (
                    <p className="text-[11px] text-muted-foreground">
                      AI isn't configured on this deployment (no GROQ_API_KEY) — showing the rule-based
                      explanation instead.
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">Generated by AI from this recommendation's factors.</p>
                  )}
                </div>
              ) : (
                <ul className="mt-3 space-y-2.5 text-[12.5px] leading-relaxed">
                  {selected?.reasons.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-foreground">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" strokeWidth={2.5} />
                      {r}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mb-4 mt-5">
              <h2 className="text-[15px] font-semibold tracking-tight">Transfer Impact</h2>
              <div className="text-[11.5px] text-muted-foreground">If this transfer is approved</div>
            </div>

            <div className="rounded-xl border border-border bg-card">
              <div className="divide-y divide-border">
                {selected && [
                  {
                    l: "Supplying",
                    v: `${selected.group} ${selected.component}`,
                    icon: Droplets,
                  },
                  {
                    l: "Blood shortage at destination",
                    v: selected.neededBloodGroup,
                    icon: Droplets,
                    tone: selected.matchType === "exact" ? undefined : ("primary" as const),
                  },
                  { l: "Units transferred", v: `${selected.units}`, icon: Droplets },
                  { l: "Distance", v: selected.distance, icon: Ruler },
                  { l: "Delivery time", v: selected.eta, icon: Timer },
                  {
                    l: "Expiry risk",
                    v: selected.priority === "high" ? "Reduced" : "Managed",
                    icon: ShieldAlert,
                    tone: "primary" as const,
                  },
                  {
                    l: "Match type",
                    v: selected.matchType === "exact" ? "Exact type" : `Compatible substitute (not ${selected.neededBloodGroup} exactly)`,
                    icon: Users,
                    tone: "success" as const,
                  },
                ].map((row) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.l} className="flex items-center gap-3 px-4 py-3.5">
                      <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                      <div className="flex-1 text-[12.5px] text-muted-foreground">{row.l}</div>
                      <div
                        className={`text-[13px] font-semibold ${
                          row.tone === "primary"
                            ? "text-primary"
                            : row.tone === "success"
                              ? "text-success"
                              : "text-foreground"
                        }`}
                      >
                        {row.v}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-border p-3 space-y-2">
                <button
                  onClick={() => selected && approveMutation.mutate(selected.id)}
                  disabled={!selected || selected.status !== "pending" || actionInProgress}
                  className="h-9 w-full rounded-md bg-primary text-[13px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Approve Transfer
                </button>
                <button
                  onClick={() => selected && dismissMutation.mutate(selected.id)}
                  disabled={!selected || selected.status !== "pending" || actionInProgress}
                  className="h-9 w-full rounded-md border border-border bg-background text-[13px] font-medium text-foreground shadow-sm hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </div>

            {/* Advanced/technical detail — collapsed by default. The
                composite score and its four weighted sub-scores are real
                numbers (not decoration), but they're Level-5 detail per the
                page's information hierarchy: useful for someone who wants to
                verify the math, not needed to make the approve/reject call. */}
            {selected ? (
              <div className="mt-4 rounded-xl border border-border bg-card">
                <button
                  onClick={() => setShowCalculation((v) => !v)}
                  className="flex w-full items-center justify-between px-5 py-3.5 text-left"
                >
                  <span className="text-[12.5px] font-medium text-foreground">View detailed calculation</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${showCalculation ? "rotate-180" : ""}`}
                  />
                </button>
                {showCalculation ? (
                  <div className="border-t border-border p-5 pt-4">
                    <div className="space-y-3">
                      {[
                        { label: "Expiry urgency", value: selected.expiryScore, weight: "35%" },
                        { label: "Destination deficit", value: selected.deficitScore, weight: "30%" },
                        { label: "Distance feasibility", value: selected.distanceScore, weight: "20%" },
                        {
                          label: "Type match",
                          value: selected.matchType === "exact" ? 100 : 60,
                          weight: "15%",
                        },
                      ].map((row) => (
                        <div key={row.label}>
                          <div className="flex items-center justify-between text-[11.5px] text-muted-foreground">
                            <span>
                              {row.label} <span className="text-[10.5px]">({row.weight} weight)</span>
                            </span>
                            <span className="font-medium text-foreground">{row.value}/100</span>
                          </div>
                          <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                            <div
                              className="h-1.5 rounded-full bg-primary"
                              style={{ width: `${row.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
                      Composite = 0.35×expiry + 0.30×deficit + 0.20×distance + 0.15×match ={" "}
                      <span className="font-medium text-foreground">{selected.confidence}/100</span>. Deterministic
                      weighted scoring, not a machine-learning model.
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      )}
    </PageShell>
  );
}

function NetworkMap({ selected }: { selected: Rec }) {
  const W = 880;
  const H = 520;
  const sx = selected.from.x * W;
  const sy = selected.from.y * H;
  const tx = selected.to.x * W;
  const ty = selected.to.y * H;
  const cx1 = sx + (tx - sx) * 0.35;
  const cy1 = sy - 60;
  const cx2 = sx + (tx - sx) * 0.65;
  const cy2 = ty + 60;
  const path = `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card" style={{ aspectRatio: `${W}/${H}` }}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="oklch(0.95 0.006 250)" strokeWidth="1" />
          </pattern>
          <radialGradient id="src-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.58 0.22 27 / 0.14)" />
            <stop offset="100%" stopColor="oklch(0.58 0.22 27 / 0)" />
          </radialGradient>
          <radialGradient id="dst-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.66 0.16 152 / 0.14)" />
            <stop offset="100%" stopColor="oklch(0.66 0.16 152 / 0)" />
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />
        <circle cx={sx} cy={sy} r="140" fill="url(#src-glow)" />
        <circle cx={tx} cy={ty} r="140" fill="url(#dst-glow)" />
        <path d={path} fill="none" stroke="oklch(0.58 0.22 27 / 0.12)" strokeWidth="12" strokeLinecap="round" />
        <path
          d={path}
          fill="none"
          stroke="oklch(0.58 0.22 27)"
          strokeWidth="2"
          strokeLinecap="round"
          className="route-dash"
        />
        <g>
          <circle cx={sx} cy={sy} r="18" fill="oklch(0.58 0.22 27)" opacity="0.14" className="pulse-dot" />
          <circle cx={sx} cy={sy} r="7" fill="oklch(0.58 0.22 27)" />
          <circle cx={sx} cy={sy} r="7" fill="none" stroke="white" strokeWidth="2" />
        </g>
        <g>
          <circle cx={tx} cy={ty} r="18" fill="oklch(0.66 0.16 152)" opacity="0.14" className="pulse-dot" />
          <circle cx={tx} cy={ty} r="7" fill="oklch(0.66 0.16 152)" />
          <circle cx={tx} cy={ty} r="7" fill="none" stroke="white" strokeWidth="2" />
        </g>
      </svg>

      <div
        className="absolute rounded-lg border border-border bg-background/95 px-3 py-2 shadow-sm backdrop-blur"
        style={{ left: `${selected.from.x * 100}%`, top: `${selected.from.y * 100}%`, transform: "translate(16px, -50%)" }}
      >
        <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">Source</div>
        <div className="mt-0.5 text-[12.5px] font-semibold text-foreground">{selected.source}</div>
        <div className="text-[11px] text-muted-foreground">{selected.sourceCity}</div>
      </div>

      <div
        className="absolute rounded-lg border border-border bg-background/95 px-3 py-2 shadow-sm backdrop-blur"
        style={{ left: `${selected.to.x * 100}%`, top: `${selected.to.y * 100}%`, transform: "translate(-100%, -50%) translateX(-16px)" }}
      >
        <div className="text-[10px] font-semibold uppercase tracking-wider text-success">Destination</div>
        <div className="mt-0.5 text-[12.5px] font-semibold text-foreground">{selected.dest}</div>
        <div className="text-[11px] text-muted-foreground">{selected.destCity}</div>
      </div>
    </div>
  );
}

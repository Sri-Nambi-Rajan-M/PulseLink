import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/app-layout";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { apiGet } from "@/lib/api";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — PulseLink" },
      { name: "description", content: "Monitor blood demand, inventory trends, and redistribution performance." },
    ],
  }),
  component: Analytics,
});

type DashboardAnalytics = {
  bloodDemand: { _id: string; totalUnits: number }[];
  inventoryTrend: { _id: { year: number; month: number }; totalUnits: number }[];
  transfers: { _id: string; count: number }[];
  unitsSaved: number;
  expiryReduction: number;
};

type ShortageForecast = {
  bloodBank: string;
  bloodBankName: string;
  city: string;
  bloodGroup: string;
  currentStock: number;
  avgDailyConsumption: number;
  trend: "rising" | "falling" | "stable";
  predicted24h: number;
  predicted72h: number;
  daysUntilStockout: number;
  riskLevel: "critical" | "high" | "medium" | "low";
  confidence: number;
};

type ForecastResponse = {
  success: boolean;
  data: ShortageForecast[];
  summary: { critical: number; high: number; medium: number; low: number };
};

const groupColors: Record<string, string> = {
  "O+": "oklch(0.58 0.22 27)",
  "A+": "oklch(0.58 0.17 250)",
  "B+": "oklch(0.66 0.16 152)",
  "AB+": "oklch(0.78 0.15 75)",
  "O-": "oklch(0.5 0.02 260)",
  "O−": "oklch(0.5 0.02 260)",
  Others: "oklch(0.75 0.02 260)",
};

const gridStroke = "oklch(0.93 0.008 250)";
const axisStyle = { fontSize: 11, fill: "oklch(0.5 0.02 260)" };

function Card({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card ${className}`}>
      <div className="border-b border-border px-5 py-4">
        <div className="text-[14px] font-semibold">{title}</div>
        {subtitle ? <div className="text-[12px] text-muted-foreground">{subtitle}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

const riskStyles: Record<ShortageForecast["riskLevel"], string> = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function RiskBadge({ level }: { level: ShortageForecast["riskLevel"] }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${riskStyles[level]}`}>
      {level}
    </span>
  );
}

function TrendIcon({ trend }: { trend: ShortageForecast["trend"] }) {
  if (trend === "rising") return <TrendingUp className="h-3.5 w-3.5 text-red-600" />;
  if (trend === "falling") return <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

function Analytics() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => apiGet<{ success: boolean; data: DashboardAnalytics }>("/api/analytics"),
  });
  const analytics = data?.data;

  const { data: forecastData, isLoading: forecastLoading } = useQuery({
    queryKey: ["forecast"],
    queryFn: () => apiGet<ForecastResponse>("/api/forecast"),
  });
  const forecasts = forecastData?.data ?? [];
  const forecastSummary = forecastData?.summary;

  const demand = analytics?.bloodDemand.map((item) => ({ m: item._id, v: item.totalUnits })) ?? [];
  const inventory = analytics?.inventoryTrend.map((item) => ({ d: `${item._id.month}/${item._id.year}`, v: item.totalUnits })) ?? [];
  const redistribution = analytics?.transfers.map((item) => ({ m: item._id, v: item.count })) ?? [];
  const groupData = analytics?.bloodDemand.map((item) => ({ name: item._id, value: item.totalUnits, color: groupColors[item._id] ?? "#8884d8" })) ?? [];
  const savedVsExpired = analytics
    ? [
        { m: "Units Saved", saved: analytics.unitsSaved, expired: 0 },
        { m: "Expiry Risk", saved: 0, expired: analytics.expiryReduction },
      ]
    : [];

  return (
    <PageShell
      title="Analytics Overview"
      subtitle="Insights and trends across your blood redistribution network."
      actions={
        <>
          <button onClick={() => refetch()} className="h-9 rounded-md border border-border bg-card px-3.5 text-[13px] font-medium hover:bg-surface">Refresh Analytics</button>
          <button className="h-9 rounded-md border border-border bg-card px-3.5 text-[13px] font-medium hover:bg-surface">Last 30 days</button>
          <button className="h-9 rounded-md bg-primary px-3.5 text-[13px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90">Export Report</button>
        </>
      }
    >
      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">Loading analytics…</div>
      ) : isError || !analytics ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-red-600">Unable to load analytics.</div>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { l: "Units Saved", v: analytics.unitsSaved.toLocaleString() },
              { l: "Expiry Reduction", v: `${analytics.expiryReduction}%` },
              { l: "Total Demand Groups", v: analytics.bloodDemand.length },
              { l: "Transfer Trend", v: analytics.transfers.length },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-border bg-card px-5 py-4">
                <div className="text-[11.5px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
                <div className="mt-2 text-[26px] font-semibold tracking-tight leading-none">{s.v}</div>
              </div>
            ))}
          </section>

          <Card
            title="AI Shortage Forecast"
            subtitle="Predicted stockouts over the next 72 hours, projected from 60 days of consumption trend — not just current stock"
          >
            {forecastLoading ? (
              <div className="py-6 text-center text-[13px] text-muted-foreground">Running forecast model…</div>
            ) : forecasts.length === 0 ? (
              <div className="py-6 text-center text-[13px] text-muted-foreground">
                Not enough consumption history yet to forecast — check back once usage data accumulates.
              </div>
            ) : (
              <>
                <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(["critical", "high", "medium", "low"] as const).map((level) => (
                    <div key={level} className={`rounded-lg border px-3 py-2.5 ${riskStyles[level]}`}>
                      <div className="text-[10.5px] font-medium uppercase tracking-wider opacity-80">{level} risk</div>
                      <div className="mt-0.5 text-[20px] font-semibold leading-none">
                        {forecastSummary?.[level] ?? 0}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12.5px]">
                    <thead>
                      <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                        <th className="pb-2 pr-4 font-medium">Blood Bank</th>
                        <th className="pb-2 pr-4 font-medium">Group</th>
                        <th className="pb-2 pr-4 font-medium">Current Stock</th>
                        <th className="pb-2 pr-4 font-medium">Trend</th>
                        <th className="pb-2 pr-4 font-medium">72h Predicted Demand</th>
                        <th className="pb-2 pr-4 font-medium">Days to Stockout</th>
                        <th className="pb-2 pr-4 font-medium">Confidence</th>
                        <th className="pb-2 font-medium">Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecasts.slice(0, 10).map((f) => (
                        <tr key={`${f.bloodBank}-${f.bloodGroup}`} className="border-b border-border/60 last:border-0">
                          <td className="py-2.5 pr-4">
                            <div className="font-medium text-foreground">{f.bloodBankName}</div>
                            <div className="text-[11px] text-muted-foreground">{f.city}</div>
                          </td>
                          <td className="py-2.5 pr-4 font-medium">{f.bloodGroup}</td>
                          <td className="py-2.5 pr-4">{f.currentStock} units</td>
                          <td className="py-2.5 pr-4">
                            <span className="inline-flex items-center gap-1.5 capitalize">
                              <TrendIcon trend={f.trend} /> {f.trend}
                            </span>
                          </td>
                          <td className="py-2.5 pr-4">{f.predicted72h} units</td>
                          <td className="py-2.5 pr-4">
                            {f.daysUntilStockout >= 99 ? "—" : `${f.daysUntilStockout}d`}
                          </td>
                          <td className="py-2.5 pr-4 text-muted-foreground">{f.confidence}%</td>
                          <td className="py-2.5">
                            <RiskBadge level={f.riskLevel} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {forecastSummary && forecastSummary.critical > 0 ? (
                  <div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-[12.5px] text-red-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      {forecastSummary.critical} blood group{forecastSummary.critical > 1 ? "s are" : " is"} projected to
                      run out in under 24 hours at current consumption trend — review the Operations Center for matching
                      redistribution recommendations.
                    </span>
                  </div>
                ) : null}
              </>
            )}
          </Card>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card title="Blood Demand" subtitle="Current demand by blood group" className="xl:col-span-2">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={demand} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke={gridStroke} vertical={false} />
                    <XAxis dataKey="m" tick={axisStyle} tickLine={false} axisLine={false} />
                    <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid oklch(0.92 0.008 250)" }} />
                    <Line type="monotone" dataKey="v" stroke="oklch(0.58 0.22 27)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Demand Distribution" subtitle="Current blood group share">
              <div className="flex h-[280px] items-center">
                <div className="h-full flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={groupData} innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
                        {groupData.map((g) => (
                          <Cell key={g.name} fill={g.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="flex-1 space-y-1.5 text-[12.5px]">
                  {groupData.map((g) => (
                    <li key={g.name} className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: g.color }} />
                        {g.name}
                      </span>
                      <span className="font-semibold">{Math.round((g.value / Math.max(...groupData.map((item) => item.value), 1)) * 100)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card title="Inventory Trend" subtitle="Total available units across the network">
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={inventory} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.58 0.22 27)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="oklch(0.58 0.22 27)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={gridStroke} vertical={false} />
                    <XAxis dataKey="d" tick={axisStyle} tickLine={false} axisLine={false} />
                    <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid oklch(0.92 0.008 250)" }} />
                    <Area type="monotone" dataKey="v" stroke="oklch(0.58 0.22 27)" strokeWidth={2} fill="url(#invGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Redistribution Trend" subtitle="Transfers coordinated per month">
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={redistribution} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke={gridStroke} vertical={false} />
                    <XAxis dataKey="m" tick={axisStyle} tickLine={false} axisLine={false} />
                    <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid oklch(0.92 0.008 250)" }} />
                    <Bar dataKey="v" fill="oklch(0.58 0.22 27)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>

          <Card title="Expiry Reduction" subtitle="Units saved versus expiry risk">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={savedVsExpired} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="m" tick={axisStyle} tickLine={false} axisLine={false} />
                  <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid oklch(0.92 0.008 250)" }} />
                  <Bar dataKey="saved" fill="oklch(0.66 0.16 152)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expired" fill="oklch(0.58 0.22 27)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}
    </PageShell>
  );
}

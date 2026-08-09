import { i as apiGet } from "./api-DTZYjuPk.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as TriangleAlert, b as Minus, o as TrendingUp, s as TrendingDown } from "../_libs/lucide-react.mjs";
import { n as PageShell } from "./app-layout-BIvV6DWg.mjs";
import { a as YAxis, c as Line, d as Pie, f as Cell, i as LineChart, l as CartesianGrid, m as Tooltip, n as PieChart, o as XAxis, p as ResponsiveContainer, r as BarChart, s as Area, t as AreaChart, u as Bar } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analytics-ByB3w-TW.js
var import_jsx_runtime = require_jsx_runtime();
var groupColors = {
	"O+": "oklch(0.58 0.22 27)",
	"A+": "oklch(0.58 0.17 250)",
	"B+": "oklch(0.66 0.16 152)",
	"AB+": "oklch(0.78 0.15 75)",
	"O-": "oklch(0.5 0.02 260)",
	"O−": "oklch(0.5 0.02 260)",
	Others: "oklch(0.75 0.02 260)"
};
var gridStroke = "oklch(0.93 0.008 250)";
var axisStyle = {
	fontSize: 11,
	fill: "oklch(0.5 0.02 260)"
};
function Card({ title, subtitle, children, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `rounded-xl border border-border bg-card ${className}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-b border-border px-5 py-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[14px] font-semibold",
				children: title
			}), subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[12px] text-muted-foreground",
				children: subtitle
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "p-5",
			children
		})]
	});
}
var riskStyles = {
	critical: "bg-red-50 text-red-700 border-red-200",
	high: "bg-orange-50 text-orange-700 border-orange-200",
	medium: "bg-amber-50 text-amber-700 border-amber-200",
	low: "bg-emerald-50 text-emerald-700 border-emerald-200"
};
function RiskBadge({ level }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${riskStyles[level]}`,
		children: level
	});
}
function TrendIcon({ trend }) {
	if (trend === "rising") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3.5 w-3.5 text-red-600" });
	if (trend === "falling") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "h-3.5 w-3.5 text-emerald-600" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-3.5 w-3.5 text-muted-foreground" });
}
function Analytics() {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["analytics"],
		queryFn: () => apiGet("/api/analytics")
	});
	const analytics = data?.data;
	const { data: forecastData, isLoading: forecastLoading } = useQuery({
		queryKey: ["forecast"],
		queryFn: () => apiGet("/api/forecast")
	});
	const forecasts = forecastData?.data ?? [];
	const forecastSummary = forecastData?.summary;
	const demand = analytics?.bloodDemand.map((item) => ({
		m: item._id,
		v: item.totalUnits
	})) ?? [];
	const inventory = analytics?.inventoryTrend.map((item) => ({
		d: `${item._id.month}/${item._id.year}`,
		v: item.totalUnits
	})) ?? [];
	const redistribution = analytics?.transfers.map((item) => ({
		m: item._id,
		v: item.count
	})) ?? [];
	const groupData = analytics?.bloodDemand.map((item) => ({
		name: item._id,
		value: item.totalUnits,
		color: groupColors[item._id] ?? "#8884d8"
	})) ?? [];
	const savedVsExpired = analytics ? [{
		m: "Units Saved",
		saved: analytics.unitsSaved,
		expired: 0
	}, {
		m: "Expiry Risk",
		saved: 0,
		expired: analytics.expiryReduction
	}] : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, {
		title: "Analytics Overview",
		subtitle: "Insights and trends across your blood redistribution network.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => refetch(),
				className: "h-9 rounded-md border border-border bg-card px-3.5 text-[13px] font-medium hover:bg-surface",
				children: "Refresh Analytics"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "h-9 rounded-md border border-border bg-card px-3.5 text-[13px] font-medium hover:bg-surface",
				children: "Last 30 days"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "h-9 rounded-md bg-primary px-3.5 text-[13px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90",
				children: "Export Report"
			})
		] }),
		children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-xl border border-border bg-card p-8 text-center text-muted-foreground",
			children: "Loading analytics…"
		}) : isError || !analytics ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-xl border border-border bg-card p-8 text-center text-red-600",
			children: "Unable to load analytics."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid grid-cols-2 gap-4 lg:grid-cols-4",
				children: [
					{
						l: "Units Saved",
						v: analytics.unitsSaved.toLocaleString()
					},
					{
						l: "Expiry Reduction",
						v: `${analytics.expiryReduction}%`
					},
					{
						l: "Total Demand Groups",
						v: analytics.bloodDemand.length
					},
					{
						l: "Transfer Trend",
						v: analytics.transfers.length
					}
				].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-card px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11.5px] uppercase tracking-wider text-muted-foreground",
						children: s.l
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 text-[26px] font-semibold tracking-tight leading-none",
						children: s.v
					})]
				}, s.l))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				title: "AI Shortage Forecast",
				subtitle: "Predicted stockouts over the next 72 hours, projected from 60 days of consumption trend — not just current stock",
				children: forecastLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "py-6 text-center text-[13px] text-muted-foreground",
					children: "Running forecast model…"
				}) : forecasts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "py-6 text-center text-[13px] text-muted-foreground",
					children: "Not enough consumption history yet to forecast — check back once usage data accumulates."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4",
						children: [
							"critical",
							"high",
							"medium",
							"low"
						].map((level) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `rounded-lg border px-3 py-2.5 ${riskStyles[level]}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[10.5px] font-medium uppercase tracking-wider opacity-80",
								children: [level, " risk"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-0.5 text-[20px] font-semibold leading-none",
								children: forecastSummary?.[level] ?? 0
							})]
						}, level))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-left text-[12.5px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 pr-4 font-medium",
										children: "Blood Bank"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 pr-4 font-medium",
										children: "Group"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 pr-4 font-medium",
										children: "Current Stock"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 pr-4 font-medium",
										children: "Trend"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 pr-4 font-medium",
										children: "72h Predicted Demand"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 pr-4 font-medium",
										children: "Days to Stockout"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 pr-4 font-medium",
										children: "Confidence"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 font-medium",
										children: "Risk"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: forecasts.slice(0, 10).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border/60 last:border-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "py-2.5 pr-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-medium text-foreground",
											children: f.bloodBankName
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] text-muted-foreground",
											children: f.city
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5 pr-4 font-medium",
										children: f.bloodGroup
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "py-2.5 pr-4",
										children: [f.currentStock, " units"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5 pr-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex items-center gap-1.5 capitalize",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendIcon, { trend: f.trend }),
												" ",
												f.trend
											]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "py-2.5 pr-4",
										children: [f.predicted72h, " units"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5 pr-4",
										children: f.daysUntilStockout >= 99 ? "—" : `${f.daysUntilStockout}d`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "py-2.5 pr-4 text-muted-foreground",
										children: [f.confidence, "%"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskBadge, { level: f.riskLevel })
									})
								]
							}, `${f.bloodBank}-${f.bloodGroup}`)) })]
						})
					}),
					forecastSummary && forecastSummary.critical > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-[12.5px] text-red-700",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mt-0.5 h-4 w-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							forecastSummary.critical,
							" blood group",
							forecastSummary.critical > 1 ? "s are" : " is",
							" projected to run out in under 24 hours at current consumption trend — review the Operations Center for matching redistribution recommendations."
						] })]
					}) : null
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid grid-cols-1 gap-6 xl:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					title: "Blood Demand",
					subtitle: "Current demand by blood group",
					className: "xl:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-[280px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
								data: demand,
								margin: {
									top: 5,
									right: 10,
									left: -10,
									bottom: 0
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										stroke: gridStroke,
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "m",
										tick: axisStyle,
										tickLine: false,
										axisLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										tick: axisStyle,
										tickLine: false,
										axisLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
										borderRadius: 8,
										fontSize: 12,
										border: "1px solid oklch(0.92 0.008 250)"
									} }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
										type: "monotone",
										dataKey: "v",
										stroke: "oklch(0.58 0.22 27)",
										strokeWidth: 2,
										dot: false
									})
								]
							})
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					title: "Demand Distribution",
					subtitle: "Current blood group share",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex h-[280px] items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full flex-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
								width: "100%",
								height: "100%",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PieChart, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
									data: groupData,
									innerRadius: 55,
									outerRadius: 90,
									paddingAngle: 2,
									dataKey: "value",
									children: groupData.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: g.color }, g.name))
								}) })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "flex-1 space-y-1.5 text-[12.5px]",
							children: groupData.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "h-2 w-2 rounded-full",
										style: { background: g.color }
									}), g.name]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-semibold",
									children: [Math.round(g.value / Math.max(...groupData.map((item) => item.value), 1) * 100), "%"]
								})]
							}, g.name))
						})]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid grid-cols-1 gap-6 xl:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					title: "Inventory Trend",
					subtitle: "Total available units across the network",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-[240px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
								data: inventory,
								margin: {
									top: 5,
									right: 10,
									left: -10,
									bottom: 0
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
										id: "invGrad",
										x1: "0",
										y1: "0",
										x2: "0",
										y2: "1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "0%",
											stopColor: "oklch(0.58 0.22 27)",
											stopOpacity: .35
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "100%",
											stopColor: "oklch(0.58 0.22 27)",
											stopOpacity: 0
										})]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										stroke: gridStroke,
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "d",
										tick: axisStyle,
										tickLine: false,
										axisLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										tick: axisStyle,
										tickLine: false,
										axisLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
										borderRadius: 8,
										fontSize: 12,
										border: "1px solid oklch(0.92 0.008 250)"
									} }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										type: "monotone",
										dataKey: "v",
										stroke: "oklch(0.58 0.22 27)",
										strokeWidth: 2,
										fill: "url(#invGrad)"
									})
								]
							})
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					title: "Redistribution Trend",
					subtitle: "Transfers coordinated per month",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-[240px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: redistribution,
								margin: {
									top: 5,
									right: 10,
									left: -10,
									bottom: 0
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										stroke: gridStroke,
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "m",
										tick: axisStyle,
										tickLine: false,
										axisLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										tick: axisStyle,
										tickLine: false,
										axisLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
										borderRadius: 8,
										fontSize: 12,
										border: "1px solid oklch(0.92 0.008 250)"
									} }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "v",
										fill: "oklch(0.58 0.22 27)",
										radius: [
											6,
											6,
											0,
											0
										]
									})
								]
							})
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				title: "Expiry Reduction",
				subtitle: "Units saved versus expiry risk",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-[260px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: savedVsExpired,
							margin: {
								top: 5,
								right: 10,
								left: -10,
								bottom: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: gridStroke,
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "m",
									tick: axisStyle,
									tickLine: false,
									axisLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tick: axisStyle,
									tickLine: false,
									axisLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
									borderRadius: 8,
									fontSize: 12,
									border: "1px solid oklch(0.92 0.008 250)"
								} }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "saved",
									fill: "oklch(0.66 0.16 152)",
									radius: [
										6,
										6,
										0,
										0
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "expired",
									fill: "oklch(0.58 0.22 27)",
									radius: [
										6,
										6,
										0,
										0
									]
								})
							]
						})
					})
				})
			})
		] })
	});
}
//#endregion
export { Analytics as component };

import { i as apiGet } from "./api-DTZYjuPk.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { M as ChevronRight, P as Check, u as Sparkles, z as ArrowRight } from "../_libs/lucide-react.mjs";
import { n as PageShell } from "./app-layout-BIvV6DWg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DPolPYvp.js
var import_jsx_runtime = require_jsx_runtime();
var PRIORITY_BADGE_STYLES = {
	critical: "bg-red-500/10 text-red-600",
	high: "bg-orange-500/10 text-orange-600",
	medium: "bg-amber-500/10 text-amber-600",
	low: "bg-muted text-muted-foreground"
};
function Dashboard() {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["dashboard"],
		queryFn: () => apiGet("/api/dashboard")
	});
	const dashboard = data?.data;
	const stats = dashboard?.stats;
	const recentActivity = dashboard?.recentActivity ?? [];
	const alerts = dashboard?.alerts ?? [];
	const topRecommendations = dashboard?.topRecommendations ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: "Dashboard",
		subtitle: "Monitor blood shortages, expiring inventory, and recommended transfers across the network.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/operations",
				className: "inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-[13px] font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90",
				children: ["Open Operations Center ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3.5 w-3.5" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => refetch(),
				disabled: isLoading,
				className: "h-9 rounded-md border border-border bg-card px-3.5 text-[13px] font-medium hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60",
				children: "Refresh Dashboard"
			})]
		}),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4",
				children: isLoading ? Array.from({ length: 4 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "bg-card px-6 py-5 text-muted-foreground",
					children: "Loading…"
				}, index)) : isError || !stats ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "col-span-4 bg-card px-6 py-5 text-red-600",
					children: "Unable to load dashboard stats."
				}) : [
					{
						label: "Active recommendations",
						value: stats.activeRecommendations
					},
					{
						label: "Critical expiring units",
						value: stats.criticalUnits
					},
					{
						label: "Active transfers",
						value: stats.activeTransfers
					},
					{
						label: "Connected banks",
						value: stats.connectedBloodBanks
					}
				].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-card px-6 py-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[28px] font-semibold leading-none tracking-tight",
						children: s.value
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 text-[12px] text-muted-foreground",
						children: s.label
					})]
				}, s.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-baseline justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-[15px] font-semibold tracking-tight",
					children: "Priority recommendations"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/operations",
					className: "text-[12px] text-muted-foreground hover:text-foreground",
					children: "View all"
				})]
			}), topRecommendations.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "overflow-hidden rounded-xl border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center justify-between px-8 pt-7",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3 w-3" }), " AI Recommendation"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-8 text-center text-muted-foreground",
					children: "No recommendations currently available."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-4",
				children: topRecommendations.map((rec) => {
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "overflow-hidden rounded-xl border border-border bg-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between px-8 pt-7",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-primary",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3 w-3" }), " AI Recommendation"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider ${PRIORITY_BADGE_STYLES[rec.priority] ?? "bg-muted text-muted-foreground"}`,
										children: rec.priority
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11.5px] text-muted-foreground",
									children: [
										"Confidence ",
										rec.confidence,
										"%"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-1 gap-6 px-8 py-8 md:grid-cols-[1fr_auto_1fr] md:items-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground",
											children: "Source"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 text-[20px] font-semibold tracking-tight",
											children: rec.source
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-0.5 text-[13px] text-muted-foreground",
											children: rec.sourceCity
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "hidden md:flex md:justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
											className: "h-5 w-5 text-muted-foreground",
											strokeWidth: 1.5
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "md:text-right",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground",
												children: "Destination"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-2 text-[20px] font-semibold tracking-tight",
												children: rec.destination
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-0.5 text-[13px] text-muted-foreground",
												children: rec.destinationCity
											})
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 border-t border-border md:grid-cols-4",
								children: [
									["Blood group", rec.bloodGroup],
									["Component", rec.component],
									["Units", `${rec.units}`],
									["Distance", `${rec.distance} km`]
								].map(([l, v], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `px-8 py-5 ${i > 0 ? "border-l border-border" : ""} ${i === 2 ? "max-md:border-l-0" : ""}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10.5px] uppercase tracking-wider text-muted-foreground",
										children: l
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `mt-1.5 text-[16px] font-semibold ${l === "Distance" ? "text-primary" : ""}`,
										children: v
									})]
								}, l))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3 border-t border-border px-8 py-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[12px] text-muted-foreground",
									children: "Dashboard is a read-only overview — review and approve in Operations."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/operations",
									className: "inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90",
									children: ["Review in Operations ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5" })]
								})]
							})
						]
					}, rec.id);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid grid-cols-1 gap-6 xl:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "xl:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-baseline justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-[15px] font-semibold tracking-tight",
							children: "Recent activity"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11.5px] text-muted-foreground",
							children: "Today"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-xl border border-border bg-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "divide-y divide-border",
							children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "p-8 text-center text-muted-foreground",
								children: "Loading recent activity…"
							}) : isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "p-8 text-center text-red-600",
								children: "Unable to load recent activity."
							}) : recentActivity.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "p-8 text-center text-muted-foreground",
								children: "No recent activity available."
							}) : recentActivity.map((activity) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-4 px-5 py-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
										className: "h-4 w-4 shrink-0 text-success",
										strokeWidth: 2
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[13.5px] font-medium",
											children: [activity.component, " transfer updated"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[12px] text-muted-foreground",
											children: [
												activity.bloodGroup,
												" · ",
												activity.units,
												" units · ",
												activity.sourceBloodBank?.name ?? "Unknown source",
												" → ",
												activity.destinationBloodBank?.name ?? "Unknown destination"
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11.5px] text-muted-foreground",
										children: new Date(activity.createdAt).toLocaleString()
									})
								]
							}, activity._id))
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-baseline justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-[15px] font-semibold tracking-tight",
						children: "Alerts"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "text-[11.5px] text-muted-foreground hover:text-foreground",
						children: "View all"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-xl border border-border bg-card",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-border",
						children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "p-8 text-center text-muted-foreground",
							children: "Loading alerts…"
						}) : isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "p-8 text-center text-red-600",
							children: "Unable to load alerts."
						}) : alerts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "p-8 text-center text-muted-foreground",
							children: "No alerts currently."
						}) : alerts.slice(0, 4).map((alert) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-3 px-5 py-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[13px] font-medium",
									children: [
										alert.bloodGroup,
										" expiring soon at ",
										alert.bloodBank
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11.5px] text-muted-foreground",
									children: [
										alert.units,
										" units · ",
										alert.hoursRemaining,
										"h remaining"
									]
								})]
							})]
						}, alert.id))
					})
				})] })]
			})
		]
	});
}
//#endregion
export { Dashboard as component };

import { i as __toESM } from "../_runtime.mjs";
import { i as apiGet, o as apiPost } from "./api-DTZYjuPk.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { N as ChevronDown, O as Droplets, P as Check, f as ShieldAlert, g as Ruler, l as Timer, n as Users, u as Sparkles, z as ArrowRight } from "../_libs/lucide-react.mjs";
import { n as PageShell } from "./app-layout-BIvV6DWg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/operations-C0igK95P.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MOCK_RECOMMENDATIONS = [{
	_id: "mock-rec-1",
	status: "pending",
	priority: "high",
	sourceBloodBank: {
		name: "Demo Source Bank",
		city: "Sample City",
		latitude: 11,
		longitude: 77
	},
	destinationBloodBank: {
		name: "Demo Destination Bank",
		city: "Sample City",
		latitude: 11.4,
		longitude: 77.7
	},
	bloodGroup: "O+",
	component: "Whole Blood",
	units: 3,
	distance: 12.4,
	confidence: 91,
	expiryScore: 80,
	deficitScore: 83,
	distanceScore: 100,
	matchType: "exact",
	deficitBloodGroup: "O+",
	estimatedTransferTime: 90,
	expiryHoursRemaining: 72,
	aiReason: "Sample data — could not reach the PulseLink API. This is not a live recommendation."
}];
function projectLatLng(lat, lng, bounds) {
	const latRange = bounds.maxLat - bounds.minLat || 1;
	const lngRange = bounds.maxLng - bounds.minLng || 1;
	const PAD = .16;
	const nx = (lng - bounds.minLng) / lngRange;
	const ny = (lat - bounds.minLat) / latRange;
	return {
		x: PAD + nx * (1 - 2 * PAD),
		y: PAD + (1 - ny) * (1 - 2 * PAD)
	};
}
function formatEta(minutes) {
	if (!minutes) return "TBD";
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return hours > 0 ? `${hours}h ${mins}m` : `${mins} mins`;
}
function Ops() {
	const queryClient = useQueryClient();
	const [actionMessage, setActionMessage] = (0, import_react.useState)(null);
	const [aiExplanation, setAiExplanation] = (0, import_react.useState)({});
	const [showSampleData, setShowSampleData] = (0, import_react.useState)(false);
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["recommendations"],
		queryFn: () => apiGet("/api/recommendations")
	});
	const recommendations = (showSampleData ? MOCK_RECOMMENDATIONS : data?.data ?? []).filter((item) => item.status === "pending");
	const resolvedCount = (data?.data ?? []).filter((item) => item.status !== "pending").length;
	const bounds = (0, import_react.useMemo)(() => {
		const lats = [];
		const lngs = [];
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
		if (lats.length === 0) return {
			minLat: 10.5,
			maxLat: 13.1,
			minLng: 76.9,
			maxLng: 79.7
		};
		return {
			minLat: Math.min(...lats),
			maxLat: Math.max(...lats),
			minLng: Math.min(...lngs),
			maxLng: Math.max(...lngs)
		};
	}, [recommendations]);
	const recs = (0, import_react.useMemo)(() => recommendations.map((item) => {
		const hasRealCoords = item.sourceBloodBank?.latitude != null && item.sourceBloodBank?.longitude != null && item.destinationBloodBank?.latitude != null && item.destinationBloodBank?.longitude != null;
		const from = hasRealCoords ? projectLatLng(item.sourceBloodBank.latitude, item.sourceBloodBank.longitude, bounds) : {
			x: .25,
			y: .5
		};
		const to = hasRealCoords ? projectLatLng(item.destinationBloodBank.latitude, item.destinationBloodBank.longitude, bounds) : {
			x: .75,
			y: .5
		};
		return {
			id: item._id,
			priority: item.priority,
			source: item.sourceBloodBank?.name || "Unknown source",
			sourceCity: item.sourceBloodBank?.city || "",
			dest: item.destinationBloodBank?.name || "Unknown destination",
			destCity: item.destinationBloodBank?.city || "",
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
			reasons: item.aiReason ? item.aiReason.split(". ").filter(Boolean).map((reason) => reason.trim()) : ["No extra details available."],
			expiresIn: `${item.expiryHoursRemaining} hrs`,
			from,
			to,
			status: item.status
		};
	}), [recommendations, bounds]);
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const [showCalculation, setShowCalculation] = (0, import_react.useState)(false);
	const selected = recs.find((r) => r.id === selectedId) ?? recs[0] ?? null;
	const invalidateAll = () => {
		queryClient.invalidateQueries({ queryKey: ["recommendations"] });
		queryClient.invalidateQueries({ queryKey: ["dashboard"] });
		queryClient.invalidateQueries({ queryKey: ["inventory"] });
		queryClient.invalidateQueries({ queryKey: ["analytics"] });
		queryClient.invalidateQueries({ queryKey: ["transfers"] });
	};
	const approveMutation = useMutation({
		mutationFn: (id) => apiPost(`/api/recommendations/${id}/approve`),
		onSuccess: () => {
			setActionMessage("Recommendation approved and transfer initiated.");
			invalidateAll();
		},
		onError: (error) => {
			setActionMessage(error instanceof Error ? error.message : "Unable to approve recommendation.");
		}
	});
	const dismissMutation = useMutation({
		mutationFn: (id) => apiPost(`/api/recommendations/${id}/reject`),
		onSuccess: () => {
			setActionMessage("Recommendation dismissed successfully.");
			invalidateAll();
		},
		onError: (error) => {
			setActionMessage(error instanceof Error ? error.message : "Unable to dismiss recommendation.");
		}
	});
	const generateMutation = useMutation({
		mutationFn: () => apiPost("/api/recommendations/generate"),
		onSuccess: () => {
			setActionMessage("AI recommendations regenerated.");
			invalidateAll();
			refetch();
		},
		onError: (error) => {
			setActionMessage(error instanceof Error ? error.message : "Unable to regenerate recommendations.");
		}
	});
	const explainMutation = useMutation({
		mutationFn: (id) => apiPost(`/api/recommendations/${id}/explain`),
		onSuccess: (res, id) => {
			setAiExplanation((prev) => ({
				...prev,
				[id]: {
					text: res.data.text,
					usedFallback: !!res.data.usedFallback
				}
			}));
		},
		onError: (error) => {
			setActionMessage(error instanceof Error ? error.message : "Unable to generate AI explanation.");
		}
	});
	const actionInProgress = approveMutation.isPending || dismissMutation.isPending || generateMutation.isPending;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: "Recommended Transfers",
		subtitle: "Review AI-ranked transfers that can reduce shortages and prevent inventory expiry.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => refetch(),
				disabled: actionInProgress,
				className: "h-9 rounded-md border border-border bg-card px-3.5 text-[13px] font-medium hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60",
				children: "Refresh"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => generateMutation.mutate(),
				disabled: actionInProgress,
				className: "h-9 rounded-md bg-primary px-3.5 text-[13px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60",
				children: "Generate New Recommendations"
			})]
		}),
		children: [actionMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground",
			children: actionMessage
		}) : null, isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-xl border border-border bg-card p-8 text-center text-muted-foreground",
			children: "Loading recommendations…"
		}) : isError && !showSampleData ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-border bg-card p-8 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-red-600",
				children: "Unable to reach the PulseLink API — no live recommendations available."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-center justify-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => refetch(),
					className: "h-9 rounded-md border border-border bg-background px-3.5 text-[13px] font-medium hover:bg-surface",
					children: "Retry"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setShowSampleData(true),
					className: "h-9 rounded-md border border-border bg-background px-3.5 text-[13px] font-medium hover:bg-surface",
					children: "View sample data instead"
				})]
			})]
		}) : recs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-xl border border-border bg-card p-8 text-center text-muted-foreground",
			children: "No recommendations available."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid grid-cols-12 gap-6",
			children: [
				showSampleData ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-12 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-900",
					children: [
						"Showing sample data — the PulseLink API is unreachable, so this is not live network data.",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								setShowSampleData(false);
								refetch();
							},
							className: "font-medium underline underline-offset-2",
							children: "Try live data again"
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-12 xl:col-span-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-baseline justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-[15px] font-semibold tracking-tight",
							children: "Top Recommendations"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[11.5px] text-muted-foreground",
							children: [resolvedCount > 0 ? `${resolvedCount} resolved this session · ` : "", "Ranked by expiry × impact"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: recs.map((r) => {
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => {
									setSelectedId(r.id);
									setShowCalculation(false);
								},
								className: `group w-full rounded-xl border bg-card p-5 text-left transition ${r.id === selected?.id ? "border-primary/50 ring-1 ring-primary/20 shadow-sm" : "border-border hover:border-foreground/15"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold uppercase tracking-wider ${r.priority === "high" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`,
											children: r.priority
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[11px] text-muted-foreground",
											children: ["#", r.id]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex items-center gap-3 text-[13.5px]",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "min-w-0 flex-1 truncate font-medium text-foreground",
												children: r.source
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3.5 w-3.5 shrink-0 text-muted-foreground" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "min-w-0 flex-1 truncate font-medium text-foreground",
												children: r.dest
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-1 flex items-center gap-3 text-[11.5px] text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "min-w-0 flex-1 truncate",
												children: r.sourceCity
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-3.5 shrink-0" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "min-w-0 flex-1 truncate",
												children: r.destCity
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex items-center gap-4 text-[12px]",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-primary",
												children: r.group
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: r.component
											}),
											r.matchType === "compatible" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800",
												children: ["needs ", r.neededBloodGroup]
											}) : null,
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "ml-auto text-foreground",
												children: [r.units, " units"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-muted-foreground",
												children: [r.confidence, "%"]
											})
										]
									})
								]
							}, r.id);
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-12 xl:col-span-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-baseline justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-[15px] font-semibold tracking-tight",
							children: "Network Route"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[11.5px] text-muted-foreground",
							children: [
								selected?.distance,
								" · ETA ",
								selected?.eta
							]
						})]
					}), selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NetworkMap, { selected }) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-12 xl:col-span-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-border bg-card p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[13px] font-semibold text-foreground",
										children: "Why this was recommended"
									})]
								}), selected && !aiExplanation[selected.id] ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => explainMutation.mutate(selected.id),
									disabled: explainMutation.isPending,
									className: "inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3 w-3" }), explainMutation.isPending ? "Asking AI…" : "Explain with AI"]
								}) : null]
							}), selected && aiExplanation[selected.id] ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[12.5px] leading-relaxed text-foreground",
									children: aiExplanation[selected.id].text
								}), aiExplanation[selected.id].usedFallback ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground",
									children: "AI isn't configured on this deployment (no GROQ_API_KEY) — showing the rule-based explanation instead."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground",
									children: "Generated by AI from this recommendation's factors."
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 space-y-2.5 text-[12.5px] leading-relaxed",
								children: selected?.reasons.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-start gap-2 text-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
										className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-success",
										strokeWidth: 2.5
									}), r]
								}, r))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 mt-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-[15px] font-semibold tracking-tight",
								children: "Transfer Impact"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11.5px] text-muted-foreground",
								children: "If this transfer is approved"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-border bg-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "divide-y divide-border",
								children: selected && [
									{
										l: "Supplying",
										v: `${selected.group} ${selected.component}`,
										icon: Droplets
									},
									{
										l: "Blood shortage at destination",
										v: selected.neededBloodGroup,
										icon: Droplets,
										tone: selected.matchType === "exact" ? void 0 : "primary"
									},
									{
										l: "Units transferred",
										v: `${selected.units}`,
										icon: Droplets
									},
									{
										l: "Distance",
										v: selected.distance,
										icon: Ruler
									},
									{
										l: "Delivery time",
										v: selected.eta,
										icon: Timer
									},
									{
										l: "Expiry risk",
										v: selected.priority === "high" ? "Reduced" : "Managed",
										icon: ShieldAlert,
										tone: "primary"
									},
									{
										l: "Match type",
										v: selected.matchType === "exact" ? "Exact type" : `Compatible substitute (not ${selected.neededBloodGroup} exactly)`,
										icon: Users,
										tone: "success"
									}
								].map((row) => {
									const Icon = row.icon;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3 px-4 py-3.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
												className: "h-4 w-4 text-muted-foreground",
												strokeWidth: 1.75
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex-1 text-[12.5px] text-muted-foreground",
												children: row.l
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: `text-[13px] font-semibold ${row.tone === "primary" ? "text-primary" : row.tone === "success" ? "text-success" : "text-foreground"}`,
												children: row.v
											})
										]
									}, row.l);
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-t border-border p-3 space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => selected && approveMutation.mutate(selected.id),
									disabled: !selected || selected.status !== "pending" || actionInProgress,
									className: "h-9 w-full rounded-md bg-primary text-[13px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60",
									children: "Approve Transfer"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => selected && dismissMutation.mutate(selected.id),
									disabled: !selected || selected.status !== "pending" || actionInProgress,
									className: "h-9 w-full rounded-md border border-border bg-background text-[13px] font-medium text-foreground shadow-sm hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60",
									children: "Reject"
								})]
							})]
						}),
						selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 rounded-xl border border-border bg-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setShowCalculation((v) => !v),
								className: "flex w-full items-center justify-between px-5 py-3.5 text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[12.5px] font-medium text-foreground",
									children: "View detailed calculation"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `h-4 w-4 text-muted-foreground transition-transform ${showCalculation ? "rotate-180" : ""}` })]
							}), showCalculation ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-t border-border p-5 pt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-3",
									children: [
										{
											label: "Expiry urgency",
											value: selected.expiryScore,
											weight: "35%"
										},
										{
											label: "Destination deficit",
											value: selected.deficitScore,
											weight: "30%"
										},
										{
											label: "Distance feasibility",
											value: selected.distanceScore,
											weight: "20%"
										},
										{
											label: "Type match",
											value: selected.matchType === "exact" ? 100 : 60,
											weight: "15%"
										}
									].map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between text-[11.5px] text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											row.label,
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[10.5px]",
												children: [
													"(",
													row.weight,
													" weight)"
												]
											})
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-medium text-foreground",
											children: [row.value, "/100"]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 h-1.5 w-full rounded-full bg-muted",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-1.5 rounded-full bg-primary",
											style: { width: `${row.value}%` }
										})
									})] }, row.label))
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 border-t border-border pt-3 text-[11px] text-muted-foreground",
									children: [
										"Composite = 0.35×expiry + 0.30×deficit + 0.20×distance + 0.15×match =",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-medium text-foreground",
											children: [selected.confidence, "/100"]
										}),
										". Deterministic weighted scoring, not a machine-learning model."
									]
								})]
							}) : null]
						}) : null
					]
				})
			]
		})]
	});
}
function NetworkMap({ selected }) {
	const W = 880;
	const H = 520;
	const sx = selected.from.x * W;
	const sy = selected.from.y * H;
	const tx = selected.to.x * W;
	const ty = selected.to.y * H;
	const path = `M ${sx} ${sy} C ${sx + (tx - sx) * .35} ${sy - 60}, ${sx + (tx - sx) * .65} ${ty + 60}, ${tx} ${ty}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative overflow-hidden rounded-xl border border-border bg-card",
		style: { aspectRatio: `${W}/${H}` },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				className: "absolute inset-0 h-full w-full",
				viewBox: `0 0 ${W} ${H}`,
				preserveAspectRatio: "xMidYMid slice",
				xmlns: "http://www.w3.org/2000/svg",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pattern", {
							id: "grid",
							width: "40",
							height: "40",
							patternUnits: "userSpaceOnUse",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: "M 40 0 L 0 0 0 40",
								fill: "none",
								stroke: "oklch(0.95 0.006 250)",
								strokeWidth: "1"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("radialGradient", {
							id: "src-glow",
							cx: "50%",
							cy: "50%",
							r: "50%",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "0%",
								stopColor: "oklch(0.58 0.22 27 / 0.14)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "100%",
								stopColor: "oklch(0.58 0.22 27 / 0)"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("radialGradient", {
							id: "dst-glow",
							cx: "50%",
							cy: "50%",
							r: "50%",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "0%",
								stopColor: "oklch(0.66 0.16 152 / 0.14)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "100%",
								stopColor: "oklch(0.66 0.16 152 / 0)"
							})]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						width: "100%",
						height: "100%",
						fill: "url(#grid)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: sx,
						cy: sy,
						r: "140",
						fill: "url(#src-glow)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: tx,
						cy: ty,
						r: "140",
						fill: "url(#dst-glow)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: path,
						fill: "none",
						stroke: "oklch(0.58 0.22 27 / 0.12)",
						strokeWidth: "12",
						strokeLinecap: "round"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: path,
						fill: "none",
						stroke: "oklch(0.58 0.22 27)",
						strokeWidth: "2",
						strokeLinecap: "round",
						className: "route-dash"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: sx,
							cy: sy,
							r: "18",
							fill: "oklch(0.58 0.22 27)",
							opacity: "0.14",
							className: "pulse-dot"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: sx,
							cy: sy,
							r: "7",
							fill: "oklch(0.58 0.22 27)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: sx,
							cy: sy,
							r: "7",
							fill: "none",
							stroke: "white",
							strokeWidth: "2"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: tx,
							cy: ty,
							r: "18",
							fill: "oklch(0.66 0.16 152)",
							opacity: "0.14",
							className: "pulse-dot"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: tx,
							cy: ty,
							r: "7",
							fill: "oklch(0.66 0.16 152)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: tx,
							cy: ty,
							r: "7",
							fill: "none",
							stroke: "white",
							strokeWidth: "2"
						})
					] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute rounded-lg border border-border bg-background/95 px-3 py-2 shadow-sm backdrop-blur",
				style: {
					left: `${selected.from.x * 100}%`,
					top: `${selected.from.y * 100}%`,
					transform: "translate(16px, -50%)"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] font-semibold uppercase tracking-wider text-primary",
						children: "Source"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-0.5 text-[12.5px] font-semibold text-foreground",
						children: selected.source
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] text-muted-foreground",
						children: selected.sourceCity
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute rounded-lg border border-border bg-background/95 px-3 py-2 shadow-sm backdrop-blur",
				style: {
					left: `${selected.to.x * 100}%`,
					top: `${selected.to.y * 100}%`,
					transform: "translate(-100%, -50%) translateX(-16px)"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] font-semibold uppercase tracking-wider text-success",
						children: "Destination"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-0.5 text-[12.5px] font-semibold text-foreground",
						children: selected.dest
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] text-muted-foreground",
						children: selected.destCity
					})
				]
			})
		]
	});
}
//#endregion
export { Ops as component };

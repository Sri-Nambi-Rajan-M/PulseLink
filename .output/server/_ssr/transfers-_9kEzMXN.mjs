import { i as __toESM } from "../_runtime.mjs";
import { a as apiPatch, i as apiGet, n as apiBase, u as getToken } from "./api-DTZYjuPk.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { P as Check, h as Search, i as Truck, j as Clock, t as X } from "../_libs/lucide-react.mjs";
import { n as PageShell } from "./app-layout-BIvV6DWg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/transfers-_9kEzMXN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StatusPill({ s }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold ${{
			initiated: "bg-info/10 text-info",
			in_transit: "bg-info/10 text-info",
			completed: "bg-success/10 text-success",
			cancelled: "bg-primary/10 text-primary",
			approved: "bg-success/10 text-success"
		}[s] ?? "bg-muted text-muted-foreground"}`,
		children: s.replace("_", " ")
	});
}
function Transfers() {
	const queryClient = useQueryClient();
	const [showSampleData, setShowSampleData] = (0, import_react.useState)(false);
	const [actionMessage, setActionMessage] = (0, import_react.useState)(null);
	const MOCK_TRANSFERS = [{
		_id: "mock-transfer-1",
		status: "initiated",
		bloodGroup: "A+",
		component: "Platelets",
		units: 4,
		sourceBloodBank: {
			name: "Demo Source Bank",
			city: "Sample City"
		},
		destinationBloodBank: {
			name: "Demo Destination Bank",
			city: "Sample City"
		},
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	}];
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["transfers"],
		queryFn: () => apiGet("/api/transfers")
	});
	const transfers = showSampleData ? MOCK_TRANSFERS : data?.data ?? [];
	const statusMutation = useMutation({
		mutationFn: ({ id, status }) => apiPatch(`/api/transfers/${id}/status`, { status }),
		onSuccess: (_res, vars) => {
			setActionMessage(`Transfer marked as ${vars.status.replace("_", " ")}.`);
			queryClient.invalidateQueries({ queryKey: ["transfers"] });
			queryClient.invalidateQueries({ queryKey: ["inventory"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
			queryClient.invalidateQueries({ queryKey: ["analytics"] });
		},
		onError: (error) => {
			setActionMessage(error instanceof Error ? error.message : "Unable to update transfer status.");
		}
	});
	function nextActions(status) {
		if (status === "initiated") return [{
			label: "Mark in transit",
			status: "in_transit"
		}, {
			label: "Cancel",
			status: "cancelled"
		}];
		if (status === "in_transit") return [{
			label: "Mark completed",
			status: "completed"
		}, {
			label: "Cancel",
			status: "cancelled"
		}];
		return [];
	}
	async function downloadDocument(transferId) {
		try {
			const token = getToken();
			const res = await fetch(`${apiBase}/api/transfers/${transferId}/document`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: "Transfer History",
		subtitle: "Track all blood transfers coordinated across the network and their outcomes.",
		children: [actionMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground",
			children: actionMessage
		}) : null, isError && !showSampleData ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-border bg-card p-8 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-red-600",
				children: "Unable to reach the PulseLink API — no live transfer history available."
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
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			showSampleData ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-900",
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
				className: "rounded-xl border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-b border-border px-5 py-4 text-[14px] font-semibold",
					children: "Recent Activity"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "p-5",
					children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "p-8 text-center text-muted-foreground",
						children: "Loading transfer activity…"
					}) : transfers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "p-8 text-center text-muted-foreground",
						children: "No transfer history available."
					}) : transfers.slice(0, 4).map((t, i, arr) => {
						const toneClass = t.status === "completed" ? "bg-success/10 text-success" : t.status === "in_transit" || t.status === "initiated" ? "bg-info/10 text-info" : "bg-primary/10 text-primary";
						const Icon = t.status === "cancelled" ? X : t.status === "completed" ? Check : Truck;
						const label = t.status === "cancelled" ? "Cancelled" : t.status === "completed" ? "Completed" : t.status === "in_transit" ? "In Transit" : "In Progress";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "relative flex gap-4 pb-4 last:pb-0",
							children: [
								i < arr.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute left-[15px] top-8 bottom-0 w-px bg-border" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `z-10 flex h-8 w-8 items-center justify-center rounded-full ${toneClass}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[13.5px] font-medium",
											children: [
												"Transfer #",
												t._id.slice(-6),
												" ",
												label.toLowerCase()
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "inline-flex items-center gap-1 text-[11.5px] text-muted-foreground",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }),
												" ",
												new Date(t.createdAt).toLocaleString()
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[12.5px] text-muted-foreground",
										children: [
											t.units,
											" units ",
											t.bloodGroup,
											" · ",
											t.sourceBloodBank?.name ?? "Unknown source",
											" → ",
											t.destinationBloodBank?.name ?? "Unknown destination"
										]
									})]
								})
							]
						}, t._id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2 border-b border-border p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex h-9 flex-1 min-w-[220px] items-center gap-2 rounded-md border border-border bg-surface px-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								placeholder: "Search transfers…",
								className: "h-full flex-1 bg-transparent text-[13px] outline-none"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "h-9 rounded-md border border-border bg-background px-3 text-[13px] font-medium hover:bg-surface",
							children: "All Statuses"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "h-9 rounded-md border border-border bg-background px-3 text-[13px] font-medium hover:bg-surface",
							children: "All Blood Groups"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-[13px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border bg-surface/60 text-left text-[11.5px] font-medium uppercase tracking-wider text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-5 py-3",
									children: "Transfer ID"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-5 py-3",
									children: "Blood Group / Component"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-5 py-3",
									children: "Units"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-5 py-3",
									children: "From"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-5 py-3",
									children: "To"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-5 py-3",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-5 py-3",
									children: "Date & Time"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-5 py-3 text-right",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 8,
							className: "px-5 py-6 text-center text-muted-foreground",
							children: "Loading transfers…"
						}) }) : transfers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 8,
							className: "px-5 py-6 text-center text-muted-foreground",
							children: "No transfers found."
						}) }) : transfers.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/70 last:border-b-0 hover:bg-surface/60",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3.5 font-medium text-foreground",
									children: t._id
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-5 py-3.5",
									children: [
										t.bloodGroup,
										" · ",
										t.component
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3.5 font-semibold",
									children: t.units
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3.5 text-muted-foreground",
									children: t.sourceBloodBank?.name ?? "Unknown"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3.5 text-muted-foreground",
									children: t.destinationBloodBank?.name ?? "Unknown"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { s: t.status })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3.5 text-muted-foreground",
									children: new Date(t.createdAt).toLocaleString()
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-end gap-1.5",
										children: [nextActions(t.status).map((action) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => statusMutation.mutate({
												id: t._id,
												status: action.status
											}),
											disabled: statusMutation.isPending || showSampleData,
											className: "rounded-md border border-border bg-background px-2 py-1 text-[11.5px] font-medium hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60",
											children: action.label
										}, action.status)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => downloadDocument(t._id),
											disabled: showSampleData,
											className: "rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60",
											title: "Download document",
											children: "⬇️"
										})]
									})
								})
							]
						}, t._id)) })]
					})
				})]
			})
		] })]
	});
}
//#endregion
export { Transfers as component };

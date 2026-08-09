import { i as __toESM } from "../_runtime.mjs";
import { i as apiGet, n as apiBase, o as apiPost, s as apiPut, u as getToken } from "./api-DTZYjuPk.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { D as Ellipsis, E as Funnel, R as ArrowUpDown, _ as Plus, h as Search } from "../_libs/lucide-react.mjs";
import { n as PageShell } from "./app-layout-BIvV6DWg.mjs";
import { n as Label, t as Input } from "./label-nLUZFr79.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogDescription, t as Dialog } from "./dialog-naZYOZnZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/inventory-D0EZOXAF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StatusPill({ s }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold ${{
			available: "bg-success/10 text-success",
			reserved: "bg-warning/15 text-warning-foreground",
			expired: "bg-primary/10 text-primary",
			transferred: "bg-primary text-primary-foreground"
		}[s] ?? "bg-muted text-muted-foreground"}`,
		children: s
	});
}
function Inventory() {
	const MOCK_INVENTORY = [{
		_id: "mock-1",
		bloodGroup: "O+",
		component: "Whole Blood",
		units: 5,
		expiryDate: new Date(Date.now() + 7 * 864e5).toISOString(),
		status: "available",
		bloodBank: {
			_id: "mock-bank-1",
			name: "Demo Blood Bank",
			city: "Sample City"
		}
	}];
	const [showSampleData, setShowSampleData] = (0, import_react.useState)(false);
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["inventory"],
		queryFn: () => apiGet("/api/inventory")
	});
	const rows = showSampleData ? MOCK_INVENTORY : data?.data ?? [];
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)({
		bloodBank: "",
		bloodGroup: "A+",
		component: "Whole Blood",
		units: 1,
		expiryDate: ""
	});
	const { data: banksData, isError: banksError } = useQuery({
		queryKey: ["bloodbanks"],
		queryFn: () => apiGet("/api/bloodbanks")
	});
	const banks = banksData?.data ?? [];
	const openAdd = () => {
		setEditingId(null);
		setForm({
			bloodBank: "",
			bloodGroup: "A+",
			component: "Whole Blood",
			units: 1,
			expiryDate: ""
		});
		setDialogOpen(true);
	};
	const openEdit = (r) => {
		setEditingId(r._id);
		setForm({
			bloodBank: r.bloodBank?._id || "",
			bloodGroup: r.bloodGroup,
			component: r.component,
			units: r.units,
			expiryDate: r.expiryDate?.slice(0, 10) || ""
		});
		setDialogOpen(true);
	};
	const submit = async () => {
		const body = {
			bloodBank: form.bloodBank,
			bloodGroup: form.bloodGroup,
			component: form.component,
			units: Number(form.units),
			expiryDate: form.expiryDate
		};
		try {
			if (editingId) await apiPut(`/api/inventory/${editingId}`, body);
			else await apiPost(`/api/inventory`, body);
			setDialogOpen(false);
			refetch();
		} catch (e) {
			alert(e.message || "Error");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: "Blood Inventory",
		subtitle: "View and manage the current blood stock across the network. This data powers recommendations and forecasts.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => refetch(),
				className: "h-9 rounded-md border border-border bg-card px-3.5 text-[13px] font-medium hover:bg-surface",
				children: "Refresh Inventory"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: async () => {
					try {
						const token = getToken();
						const res = await fetch(`${apiBase}/api/inventory/export`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
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
						alert(e.message || "Error exporting inventory.");
					}
				},
				className: "h-9 rounded-md border border-border bg-card px-3.5 text-[13px] font-medium hover:bg-surface",
				children: "Export CSV"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: openAdd,
				disabled: !!banksError,
				className: "inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-[13px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60",
				title: banksError ? "Bank list unavailable — cannot add inventory right now." : void 0,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Inventory"]
			})
		] }),
		children: [(() => {
			const PAR_LEVEL = {
				"Whole Blood": 12,
				"Red Blood Cells": 12,
				Platelets: 6,
				Plasma: 10
			};
			const available = rows.filter((r) => r.status === "available");
			const now = Date.now();
			const expiringSoon = available.filter((r) => (new Date(r.expiryDate).getTime() - now) / 36e5 < 48);
			const stockByGroupComponent = /* @__PURE__ */ new Map();
			for (const r of available) {
				const key = `${r.bloodGroup}__${r.component}`;
				stockByGroupComponent.set(key, (stockByGroupComponent.get(key) ?? 0) + r.units);
			}
			const lowStockCombos = Array.from(stockByGroupComponent.entries()).filter(([key, units]) => {
				const component = key.split("__")[1];
				return units < (PAR_LEVEL[component] ?? 10);
			});
			const healthyCount = stockByGroupComponent.size - lowStockCombos.length;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-primary/25 bg-primary/5 px-4 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11.5px] font-medium text-primary",
								children: "Low stock"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-0.5 text-[20px] font-semibold text-foreground",
								children: lowStockCombos.length
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] text-muted-foreground",
								children: "blood group / component combinations below par level"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-warning/30 bg-warning/10 px-4 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11.5px] font-medium text-warning-foreground",
								children: "Expiring soon"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-0.5 text-[20px] font-semibold text-foreground",
								children: expiringSoon.length
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] text-muted-foreground",
								children: "units expiring within 48 hours"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-success/30 bg-success/10 px-4 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11.5px] font-medium text-success",
								children: "Healthy"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-0.5 text-[20px] font-semibold text-foreground",
								children: Math.max(healthyCount, 0)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] text-muted-foreground",
								children: "combinations at or above par level"
							})
						]
					})
				]
			});
		})(), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-border bg-card",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 border-b border-border p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex h-9 flex-1 min-w-[220px] items-center gap-2 rounded-md border border-border bg-surface px-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							placeholder: "Search blood group, component, location…",
							className: "h-full flex-1 bg-transparent text-[13px] outline-none"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-[13px] font-medium hover:bg-surface",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "h-3.5 w-3.5" }), " All Components"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-[13px] font-medium hover:bg-surface",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "h-3.5 w-3.5" }), " All Statuses"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-[13px] font-medium hover:bg-surface",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: "h-3.5 w-3.5" }), " Sort"]
					})
				]
			}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-8 text-center text-muted-foreground",
				children: "Loading inventory…"
			}) : isError && !showSampleData ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-8 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-red-600",
					children: "Unable to reach the PulseLink API — no live inventory available."
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
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "overflow-x-auto",
				children: [
					showSampleData ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "m-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-[13px] text-amber-900",
						children: [
							"Showing sample data — the PulseLink API is unreachable, so this is not live inventory.",
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-[13px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border bg-surface/60 text-left text-[11.5px] font-medium uppercase tracking-wider text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-5 py-3",
									children: "Blood Group"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-5 py-3",
									children: "Component"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-5 py-3",
									children: "Available Units"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-5 py-3",
									children: "Expiry Date"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-5 py-3",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-5 py-3",
									children: "Blood Bank"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-5 py-3 text-right",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/70 last:border-b-0 hover:bg-surface/60",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "inline-flex h-7 min-w-[36px] items-center justify-center rounded-md bg-primary/10 px-2 text-[12px] font-semibold text-primary",
										children: r.bloodGroup
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3.5 text-foreground",
									children: r.component
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3.5 font-semibold text-foreground",
									children: r.units
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3.5 text-muted-foreground",
									children: new Date(r.expiryDate).toLocaleDateString()
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { s: r.status })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3.5 text-muted-foreground",
									children: r.bloodBank?.name ?? "Unknown bank"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3.5 text-right",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => openEdit(r),
										className: "rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "h-4 w-4" })
									})
								})
							]
						}, r._id)) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
						open: dialogOpen,
						onOpenChange: setDialogOpen,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editingId ? "Edit Inventory" : "Add Inventory" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: editingId ? "Modify this batch." : "Create a new inventory batch." })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 py-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Blood Bank" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: form.bloodBank,
											onChange: (e) => setForm({
												...form,
												bloodBank: e.target.value
											}),
											className: "h-9 w-full rounded-md border border-border bg-background px-2.5 text-[13px] outline-none",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "",
												children: "Select bank"
											}), banks.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
												value: b._id,
												children: [
													b.name,
													" · ",
													b.city
												]
											}, b._id))]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Blood Group" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											value: form.bloodGroup,
											onChange: (e) => setForm({
												...form,
												bloodGroup: e.target.value
											}),
											className: "h-9 w-full rounded-md border border-border bg-background px-2.5 text-[13px] outline-none",
											children: [
												"A+",
												"A-",
												"B+",
												"B-",
												"AB+",
												"AB-",
												"O+",
												"O-"
											].map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: g,
												children: g
											}, g))
										})] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Component" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: form.component,
											onChange: (e) => setForm({
												...form,
												component: e.target.value
											}),
											className: "h-9 w-full rounded-md border border-border bg-background px-2.5 text-[13px] outline-none"
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Units" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											min: 0,
											value: form.units,
											onChange: (e) => setForm({
												...form,
												units: Number(e.target.value)
											}),
											className: "h-9 w-full rounded-md border border-border bg-background px-2.5 text-[13px] outline-none"
										})] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Expiry Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.expiryDate,
										onChange: (e) => setForm({
											...form,
											expiryDate: e.target.value
										})
									})] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: submit,
									className: "h-9 w-full rounded-md bg-primary text-[13px] font-medium text-primary-foreground",
									children: editingId ? "Save Changes" : "Add Batch"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setDialogOpen(false),
									className: "h-9 w-full rounded-md border border-border",
									children: "Cancel"
								})]
							})
						] })
					})
				]
			})]
		})]
	});
}
//#endregion
export { Inventory as component };

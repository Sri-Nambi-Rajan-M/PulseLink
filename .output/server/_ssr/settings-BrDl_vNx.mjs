import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as PageShell } from "./app-layout-BIvV6DWg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-BrDl_vNx.js
var import_jsx_runtime = require_jsx_runtime();
function Row({ label, hint, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3 border-b border-border px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[13.5px] font-medium",
			children: label
		}), hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[12px] text-muted-foreground",
			children: hint
		}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-2",
			children
		})]
	});
}
function Toggle({ on = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-flex h-5 w-9 items-center rounded-full p-0.5 transition ${on ? "bg-primary" : "bg-border"}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-4 w-4 rounded-full bg-white shadow transition ${on ? "translate-x-4" : ""}` })
	});
}
function SettingsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, {
		title: "Settings",
		subtitle: "Manage your workspace, alerts and integrations.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-12 gap-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "col-span-12 lg:col-span-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1 text-[13px]",
					children: [
						"Workspace",
						"Alerts",
						"AI & Recommendations",
						"Integrations",
						"Billing",
						"Security"
					].map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: `w-full rounded-md px-3 py-2 text-left ${i === 0 ? "bg-surface font-medium text-foreground" : "text-muted-foreground hover:bg-surface hover:text-foreground"}`,
						children: s
					}) }, s))
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-12 space-y-6 lg:col-span-9",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border-b border-border px-5 py-4 text-[14px] font-semibold",
								children: "Workspace"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Organization name",
								hint: "Displayed to connected banks",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									defaultValue: "Tamil Nadu Blood Logistics",
									className: "h-9 w-64 rounded-md border border-border bg-background px-3 text-[13px] outline-none focus:ring-2 focus:ring-ring/40"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Region",
								hint: "Primary operational region",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "h-9 w-64 rounded-md border border-border bg-background px-3 text-[13px] outline-none",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "South India" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "North India" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Pan-India" })
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Timezone",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: "h-9 w-64 rounded-md border border-border bg-background px-3 text-[13px] outline-none",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Asia/Kolkata (GMT+5:30)" })
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border-b border-border px-5 py-4 text-[14px] font-semibold",
								children: "Alerts"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Critical expiry warnings",
								hint: "Notify when a unit expires within 24 hours",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, { on: true })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "AI recommendations",
								hint: "Push notifications for new proposals",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, { on: true })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Transfer status updates",
								hint: "Track dispatch, in-transit and delivery",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, { on: true })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Weekly performance report",
								hint: "Emailed every Monday 08:00",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border-b border-border px-5 py-4 text-[14px] font-semibold",
								children: "AI & Recommendations"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Auto-approve low-risk transfers",
								hint: "Distance under 5 km and confidence over 95%",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Model",
								hint: "AI model powering recommendations",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "h-9 w-64 rounded-md border border-border bg-background px-3 text-[13px] outline-none",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "PulseLink Neural v3.2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "PulseLink Neural v3.1" })]
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "h-9 rounded-md border border-border bg-card px-3.5 text-[13px] font-medium hover:bg-surface",
							children: "Discard"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "h-9 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90",
							children: "Save changes"
						})]
					})
				]
			})]
		})
	});
}
//#endregion
export { SettingsPage as component };

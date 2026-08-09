import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { L as Bell, P as Check, a as TriangleAlert, i as Truck, u as Sparkles } from "../_libs/lucide-react.mjs";
import { n as PageShell } from "./app-layout-BIvV6DWg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-mobHKeXi.js
var import_jsx_runtime = require_jsx_runtime();
var items = [
	{
		title: "O− shortage predicted at GMCH Vellore",
		desc: "Model projects shortage within 48 hours. Consider dispatching from Apollo.",
		tone: "primary",
		time: "2m ago",
		icon: TriangleAlert,
		unread: true
	},
	{
		title: "New AI recommendation ready",
		desc: "B+ Plasma · 15 units · City Central → Brooklyn Blood Services",
		tone: "info",
		time: "18m ago",
		icon: Sparkles,
		unread: true
	},
	{
		title: "Transfer #TRF-2026-001 dispatched",
		desc: "12 units O+ Platelets · ETA 45 mins",
		tone: "info",
		time: "1h ago",
		icon: Truck,
		unread: true
	},
	{
		title: "Transfer #TRF-2026-003 completed",
		desc: "10 units B+ Plasma delivered to CMC",
		tone: "success",
		time: "Yesterday",
		icon: Check
	},
	{
		title: "Weekly network report available",
		desc: "236 units saved · 94% success rate",
		tone: "muted",
		time: "2 days ago",
		icon: Bell
	}
];
function Notifications() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: "Notifications",
		subtitle: "All alerts, AI recommendations and network updates in one place.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			className: "h-9 rounded-md border border-border bg-card px-3.5 text-[13px] font-medium hover:bg-surface",
			children: "Mark all as read"
		}) }),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-2",
			children: [
				"All",
				"Unread",
				"Recommendations",
				"Transfers",
				"System"
			].map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: `h-8 rounded-md px-3 text-[12.5px] font-medium ${i === 0 ? "bg-foreground text-background" : "border border-border bg-card hover:bg-surface"}`,
				children: t
			}, t))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-xl border border-border bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border",
				children: items.map((n, i) => {
					const Icon = n.icon;
					const tone = n.tone === "primary" ? "bg-primary/10 text-primary" : n.tone === "success" ? "bg-success/10 text-success" : n.tone === "info" ? "bg-info/10 text-info" : "bg-muted text-muted-foreground";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: `flex items-start gap-4 px-5 py-4 ${n.unread ? "bg-primary/[0.02]" : ""}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `flex h-9 w-9 items-center justify-center rounded-lg ${tone}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[13.5px] font-medium text-foreground",
										children: n.title
									}), n.unread ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-primary" }) : null]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-0.5 text-[12.5px] text-muted-foreground",
									children: n.desc
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "whitespace-nowrap text-[11.5px] text-muted-foreground",
								children: n.time
							})
						]
					}, i);
				})
			})
		})]
	});
}
//#endregion
export { Notifications as component };

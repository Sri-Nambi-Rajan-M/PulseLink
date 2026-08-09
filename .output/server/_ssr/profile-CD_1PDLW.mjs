import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { S as Mail, d as Shield, v as Phone, x as MapPin } from "../_libs/lucide-react.mjs";
import { n as PageShell } from "./app-layout-BIvV6DWg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-CD_1PDLW.js
var import_jsx_runtime = require_jsx_runtime();
function Profile() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, {
		title: "Profile",
		subtitle: "Your account, role and activity within the PulseLink network.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-12 gap-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "col-span-12 lg:col-span-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-card p-6 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-[22px] font-semibold text-primary",
							children: "PR"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 text-[17px] font-semibold",
							children: "Dr. Priya Raghavan"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[13px] text-muted-foreground",
							children: "Regional Coordinator · Apollo Blood Bank"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11.5px] font-semibold text-success",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-3 w-3" }), " Verified administrator"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 space-y-2 text-left text-[12.5px]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "inline-flex items-center gap-2 text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-3.5 w-3.5" }), " priya.r@pulselink.health"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "inline-flex items-center gap-2 text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3.5 w-3.5" }), " +91 44 2029 3333"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "inline-flex items-center gap-2 text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5" }), " Chennai, Tamil Nadu"]
								})
							]
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-12 space-y-6 lg:col-span-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-4 sm:grid-cols-4",
						children: [
							{
								l: "Approvals",
								v: "312"
							},
							{
								l: "Units saved",
								v: "1,248"
							},
							{
								l: "Success rate",
								v: "96%"
							},
							{
								l: "Avg. response",
								v: "3m 12s"
							}
						].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-border bg-card px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11.5px] uppercase tracking-wider text-muted-foreground",
								children: s.l
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-[20px] font-semibold tracking-tight",
								children: s.v
							})]
						}, s.l))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border-b border-border px-5 py-4 text-[14px] font-semibold",
							children: "Account details"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-1 gap-4 p-5 sm:grid-cols-2",
							children: [
								["Full name", "Priya Raghavan"],
								["Employee ID", "PL-00218"],
								["Role", "Regional Coordinator"],
								["Organization", "Apollo Blood Bank"],
								["Joined", "March 2024"],
								["Last login", "Today, 08:14 AM"]
							].map(([l, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11.5px] uppercase tracking-wider text-muted-foreground",
								children: l
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-[13.5px] font-medium",
								children: v
							})] }, l))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border-b border-border px-5 py-4 text-[14px] font-semibold",
							children: "Recent approvals"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "divide-y divide-border",
							children: [
								{
									title: "Approved · Apollo → GMCH Vellore",
									meta: "O+ Platelets · 12 units · Today, 10:24 AM"
								},
								{
									title: "Approved · City Central → Brooklyn Blood Services",
									meta: "B+ Plasma · 15 units · Yesterday, 4:12 PM"
								},
								{
									title: "Approved · Queens Blood Donation Center → Bronx Community Blood Bank",
									meta: "A− Whole Blood · 8 units · 2 days ago"
								}
							].map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between px-5 py-3.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[13.5px] font-medium",
									children: a.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[12px] text-muted-foreground",
									children: a.meta
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "text-[12px] font-medium text-muted-foreground hover:text-foreground",
									children: "Details"
								})]
							}, i))
						})]
					})
				]
			})]
		})
	});
}
//#endregion
export { Profile as component };

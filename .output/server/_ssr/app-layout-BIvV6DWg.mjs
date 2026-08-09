import { i as __toESM } from "../_runtime.mjs";
import { c as clearAuth, d as isAuthenticated, i as apiGet, l as getStoredUser, o as apiPost } from "./api-DTZYjuPk.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as useNavigate, f as Outlet, g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { A as Command, B as ArrowLeftRight, C as LogOut, F as ChartColumn, I as Building2, L as Bell, T as LayoutDashboard, V as Activity, h as Search, k as Droplet, m as Send, p as Settings, r as UserRound, t as X, u as Sparkles, w as LoaderCircle } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-layout-BIvV6DWg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STARTER_PROMPTS = [
	"Which banks are at risk of running out this week?",
	"Summarize today's pending recommendations.",
	"What's the highest-confidence transfer right now?"
];
function CopilotWidget() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [input, setInput] = (0, import_react.useState)("");
	const [messages, setMessages] = (0, import_react.useState)([]);
	const scrollRef = (0, import_react.useRef)(null);
	const { data: statusData } = useQuery({
		queryKey: ["copilot-status"],
		queryFn: () => apiGet("/api/copilot/status"),
		enabled: open,
		staleTime: 6e4
	});
	const configured = statusData?.data.configured ?? true;
	const askMutation = useMutation({
		mutationFn: (question) => apiPost("/api/copilot/ask", { question }),
		onSuccess: (res) => {
			setMessages((prev) => [...prev, {
				id: `${Date.now()}-a`,
				role: "assistant",
				text: res.data.answer
			}]);
		},
		onError: (error) => {
			setMessages((prev) => [...prev, {
				id: `${Date.now()}-e`,
				role: "assistant",
				text: error instanceof Error ? error.message : "Something went wrong reaching the copilot."
			}]);
		}
	});
	(0, import_react.useEffect)(() => {
		scrollRef.current?.scrollTo({
			top: scrollRef.current.scrollHeight,
			behavior: "smooth"
		});
	}, [messages, askMutation.isPending]);
	const send = (text) => {
		const trimmed = text.trim();
		if (!trimmed || askMutation.isPending) return;
		setMessages((prev) => [...prev, {
			id: `${Date.now()}-u`,
			role: "user",
			text: trimmed
		}]);
		setInput("");
		askMutation.mutate(trimmed);
	};
	if (!open) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick: () => setOpen(true),
		title: "Ask PulseLink — get a plain-language explanation",
		className: "fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md hover:border-primary/40 hover:text-primary",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed bottom-6 right-6 z-40 flex h-[520px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b border-border bg-primary/5 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[13px] font-semibold text-foreground",
						children: "Ask PulseLink"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10.5px] text-muted-foreground",
						children: configured ? "Grounded in live network data" : "Not configured on this deployment"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setOpen(false),
					className: "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-surface hover:text-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: scrollRef,
				className: "flex-1 space-y-3 overflow-y-auto px-4 py-4",
				children: [messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[12.5px] text-muted-foreground",
						children: "Ask about network status, shortage risk, or why a transfer was recommended — answers are grounded in your current live data."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-1.5",
						children: STARTER_PROMPTS.map((prompt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => send(prompt),
							className: "block w-full rounded-md border border-border bg-background px-3 py-2 text-left text-[12px] text-foreground hover:bg-surface",
							children: prompt
						}, prompt))
					})]
				}) : messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `max-w-[85%] rounded-lg px-3 py-2 text-[12.5px] leading-relaxed ${m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "mr-auto border border-border bg-background text-foreground"}`,
					children: m.text
				}, m.id)), askMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mr-auto flex max-w-[85%] items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-[12px] text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }), " Checking live network data…"]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t border-border p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: (e) => {
						e.preventDefault();
						send(input);
					},
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: input,
						onChange: (e) => setInput(e.target.value),
						placeholder: "Ask a question…",
						className: "h-9 flex-1 rounded-md border border-border bg-background px-3 text-[12.5px] outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: askMutation.isPending || !input.trim(),
						className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" })
					})]
				})
			})
		]
	});
}
var nav = [
	{
		label: "Overview",
		items: [{
			to: "/",
			label: "Dashboard",
			icon: LayoutDashboard
		}, {
			to: "/operations",
			label: "Recommended Transfers",
			icon: Activity,
			star: true
		}]
	},
	{
		label: "Network",
		items: [
			{
				to: "/inventory",
				label: "Blood Inventory",
				icon: Droplet
			},
			{
				to: "/banks",
				label: "Blood Banks",
				icon: Building2
			},
			{
				to: "/transfers",
				label: "Transfer History",
				icon: ArrowLeftRight
			}
		]
	},
	{
		label: "Insights",
		items: [{
			to: "/analytics",
			label: "Analytics",
			icon: ChartColumn
		}, {
			to: "/notifications",
			label: "Notifications",
			icon: Bell,
			preview: true
		}]
	},
	{
		label: "Account",
		items: [{
			to: "/settings",
			label: "Settings",
			icon: Settings,
			preview: true
		}, {
			to: "/profile",
			label: "Profile",
			icon: UserRound,
			preview: true
		}]
	}
];
function PulseLogo({ compact = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex items-center ${compact ? "gap-2" : "gap-2.5"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `relative flex items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm ${compact ? "h-7 w-7" : "h-8 w-8"}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 24 24",
				className: "h-4 w-4",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "2.4",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M3 12h3l2-5 4 10 2-5h7" })
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: compact ? "hidden" : "leading-tight",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[15px] font-semibold tracking-tight text-foreground",
				children: "PulseLink"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] text-muted-foreground",
				children: "Blood Logistics OS"
			})]
		})]
	});
}
function initialsFor(name) {
	if (!name) return "?";
	return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}
function AppLayout() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const navigate = useNavigate();
	const [user, setUser] = (0, import_react.useState)(null);
	const [checkedAuth, setCheckedAuth] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (pathname === "/login") {
			setCheckedAuth(true);
			return;
		}
		if (!isAuthenticated()) {
			navigate({
				to: "/login",
				replace: true
			});
			return;
		}
		setUser(getStoredUser());
		setCheckedAuth(true);
	}, [pathname, navigate]);
	const handleLogout = () => {
		clearAuth();
		navigate({
			to: "/login",
			replace: true
		});
	};
	if (pathname === "/login") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
	if (!checkedAuth) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-surface text-sm text-muted-foreground",
		children: "Loading…"
	});
	const displayName = user?.name ?? "Signed in";
	const displayRole = user?.role === "admin" ? "Administrator" : user?.role ?? "Operator";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen w-full bg-surface",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-16 items-center border-b border-sidebar-border px-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PulseLogo, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex-1 overflow-y-auto px-3 py-5",
						children: nav.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-1.5 px-3 text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground/80",
								children: group.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-0.5",
								children: group.items.map((item) => {
									const active = pathname === item.to;
									const Icon = item.icon;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: item.to,
										className: `group flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
												className: `h-[16px] w-[16px] ${active ? "text-primary" : ""}`,
												strokeWidth: 2
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "flex-1",
												children: item.label
											}),
											"star" in item && item.star ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-primary" }) : null,
											"preview" in item && item.preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "rounded-full bg-muted px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-muted-foreground",
												children: "Preview"
											}) : null
										]
									}) }, item.to);
								})
							})]
						}, group.label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-t border-sidebar-border p-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2.5 rounded-md px-2 py-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary",
									children: initialsFor(displayName)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1 leading-tight",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "truncate text-[12.5px] font-medium text-foreground",
										children: displayName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "truncate text-[11px] text-muted-foreground",
										children: displayRole
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: handleLogout,
									title: "Sign out",
									className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5" })
								})
							]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/85 px-8 backdrop-blur-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex h-9 flex-1 max-w-md items-center gap-2 rounded-md border border-border bg-surface px-3 text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									placeholder: "Search units, banks, transfers…",
									className: "h-full flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "hidden items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium md:inline-flex",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Command, { className: "h-3 w-3" }), " K"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-surface hover:text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary",
							children: initialsFor(displayName)
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopilotWidget, {})
		]
	});
}
function PageShell({ title, subtitle, actions, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-[1400px] px-8 pb-16 pt-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-8 flex items-end justify-between gap-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-[28px] font-semibold tracking-tight text-foreground",
				children: title
			}), subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 max-w-2xl text-[14px] text-muted-foreground",
				children: subtitle
			}) : null] }), actions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-2",
				children: actions
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-6",
			children
		})]
	});
}
//#endregion
export { PageShell as n, AppLayout as t };

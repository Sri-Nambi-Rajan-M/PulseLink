import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { c as HeadContent, d as createRouter, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as AppLayout } from "./app-layout-BIvV6DWg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CbX79gRl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-D9AJGdtc.css";
function reportError(error, context = {}) {
	if (typeof window === "undefined") return;
	const options = {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	};
	const fullContext = {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	};
	if (window.__errorReporter?.captureException) {
		window.__errorReporter.captureException(error, fullContext, options);
		return;
	}
	console.error("[error-reporting]", error, fullContext);
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$11 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "PulseLink — Intelligent Blood Redistribution Platform" },
			{
				name: "description",
				content: "PulseLink is an intelligent inter-bank redistribution platform that moves expiring blood units from surplus banks to banks running short, before that stock goes to waste."
			},
			{
				property: "og:title",
				content: "PulseLink — Intelligent Blood Redistribution"
			},
			{
				property: "og:description",
				content: "Enterprise decision-support software for coordinating blood inventory across a network of blood banks."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$11.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, {})
	});
}
var $$splitComponentImporter$9 = () => import("./transfers-_9kEzMXN.mjs");
var Route$10 = createFileRoute("/transfers")({
	head: () => ({ meta: [{ title: "Transfer History — PulseLink" }, {
		name: "description",
		content: "Full history of blood transfers across the PulseLink network."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var BASE_URL = "";
var Route$9 = createFileRoute("/sitemap.xml")({ server: { handlers: { GET: async () => {
	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
		"/",
		"/operations",
		"/inventory",
		"/banks",
		"/transfers",
		"/analytics",
		"/notifications",
		"/settings",
		"/profile"
	].map((p) => `  <url><loc>${BASE_URL}${p}</loc><changefreq>weekly</changefreq></url>`).join("\n")}\n</urlset>`;
	return new Response(xml, { headers: {
		"Content-Type": "application/xml",
		"Cache-Control": "public, max-age=3600"
	} });
} } } });
var $$splitComponentImporter$8 = () => import("./settings-BrDl_vNx.mjs");
var Route$8 = createFileRoute("/settings")({
	head: () => ({ meta: [{ title: "Settings — PulseLink" }, {
		name: "description",
		content: "Manage your PulseLink workspace, integrations and preferences."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./profile-CD_1PDLW.mjs");
var Route$7 = createFileRoute("/profile")({
	head: () => ({ meta: [{ title: "Profile — PulseLink" }, {
		name: "description",
		content: "Your PulseLink profile and account details."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./operations-C0igK95P.mjs");
var Route$6 = createFileRoute("/operations")({
	head: () => ({ meta: [{ title: "Redistribution Operations Center — PulseLink" }, {
		name: "description",
		content: "Monitor, prioritize and coordinate intelligent blood redistribution across connected blood banks."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./notifications-mobHKeXi.mjs");
var Route$5 = createFileRoute("/notifications")({
	head: () => ({ meta: [{ title: "Notifications — PulseLink" }, {
		name: "description",
		content: "System alerts, recommendations and network updates."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./login-DNIusBKR.mjs");
var Route$4 = createFileRoute("/login")({
	head: () => ({ meta: [{ title: "Sign in — PulseLink" }, {
		name: "description",
		content: "Sign in to the PulseLink blood redistribution platform."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./inventory-D0EZOXAF.mjs");
var Route$3 = createFileRoute("/inventory")({
	head: () => ({ meta: [{ title: "Blood Inventory — PulseLink" }, {
		name: "description",
		content: "Real-time blood component inventory across connected banks."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./banks-DV3dFL3s.mjs");
var Route$2 = createFileRoute("/banks")({
	head: () => ({ meta: [{ title: "Blood Banks — PulseLink" }, {
		name: "description",
		content: "All blood banks connected to the PulseLink redistribution network."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./analytics-ByB3w-TW.mjs");
var Route$1 = createFileRoute("/analytics")({
	head: () => ({ meta: [{ title: "Analytics — PulseLink" }, {
		name: "description",
		content: "Monitor blood demand, inventory trends, and redistribution performance."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./routes-DPolPYvp.mjs");
var Route = createFileRoute("/")({
	head: () => ({ meta: [{ title: "Dashboard — PulseLink" }, {
		name: "description",
		content: "What requires your attention today across the PulseLink network."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var TransfersRoute = Route$10.update({
	id: "/transfers",
	path: "/transfers",
	getParentRoute: () => Route$11
});
var SitemapDotxmlRoute = Route$9.update({
	id: "/sitemap.xml",
	path: "/sitemap.xml",
	getParentRoute: () => Route$11
});
var SettingsRoute = Route$8.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => Route$11
});
var ProfileRoute = Route$7.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => Route$11
});
var OperationsRoute = Route$6.update({
	id: "/operations",
	path: "/operations",
	getParentRoute: () => Route$11
});
var NotificationsRoute = Route$5.update({
	id: "/notifications",
	path: "/notifications",
	getParentRoute: () => Route$11
});
var LoginRoute = Route$4.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$11
});
var InventoryRoute = Route$3.update({
	id: "/inventory",
	path: "/inventory",
	getParentRoute: () => Route$11
});
var BanksRoute = Route$2.update({
	id: "/banks",
	path: "/banks",
	getParentRoute: () => Route$11
});
var AnalyticsRoute = Route$1.update({
	id: "/analytics",
	path: "/analytics",
	getParentRoute: () => Route$11
});
var rootRouteChildren = {
	IndexRoute: Route.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$11
	}),
	AnalyticsRoute,
	BanksRoute,
	InventoryRoute,
	LoginRoute,
	NotificationsRoute,
	OperationsRoute,
	ProfileRoute,
	SettingsRoute,
	SitemapDotxmlRoute,
	TransfersRoute
};
var routeTree = Route$11._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };

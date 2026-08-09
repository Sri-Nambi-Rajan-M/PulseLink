globalThis.__nitro_main__ = import.meta.url;
import { a as toEventHandler, c as serve, i as defineLazyEventHandler, n as HTTPError, r as defineHandler, s as NodeResponse, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { i as withoutTrailingSlash, n as joinURL, r as withLeadingSlash, t as decodePath } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-08-09T13:22:18.382Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/favicon.svg": {
		"type": "image/svg+xml",
		"etag": "\"134-W0hvfgvkyFxqXP7ffMYJ74LBYx4\"",
		"mtime": "2026-08-09T13:22:18.547Z",
		"size": 308,
		"path": "../public/favicon.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"19-yHADZo6lKl+mSNPU9098EiqzPCE\"",
		"mtime": "2026-08-09T13:22:18.967Z",
		"size": 25,
		"path": "../public/robots.txt"
	},
	"/assets/api-EqNG2Tbb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3a22-bZjgg6j2O3A/7g1nfQ+zARevG2Y\"",
		"mtime": "2026-08-09T14:48:31.887Z",
		"size": 14882,
		"path": "../public/assets/api-EqNG2Tbb.js"
	},
	"/assets/arrow-right-B11WwsDT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"98-6tUqX2OU6PHtGi14xWdfKWnp41E\"",
		"mtime": "2026-08-09T14:48:32.367Z",
		"size": 152,
		"path": "../public/assets/arrow-right-B11WwsDT.js"
	},
	"/assets/banks-JWQDH-Ju.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"31c8-7lxt3CGfBqzytNbLwxE4AgaOhlI\"",
		"mtime": "2026-08-09T14:48:32.371Z",
		"size": 12744,
		"path": "../public/assets/banks-JWQDH-Ju.js"
	},
	"/assets/check-D56iIETS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6f-Y0gQrqZ0wyxxMaXqV2K10ybcTJE\"",
		"mtime": "2026-08-09T14:48:32.427Z",
		"size": 111,
		"path": "../public/assets/check-D56iIETS.js"
	},
	"/assets/clsx-CjueKrWZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"170-hIN6XMVOMUzluNGmYPaM/SbauwQ\"",
		"mtime": "2026-08-09T14:48:32.431Z",
		"size": 368,
		"path": "../public/assets/clsx-CjueKrWZ.js"
	},
	"/assets/app-layout-BTAuFzf6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c2b2-15rFatKeWwfVKOYqYfGZhzbGTbA\"",
		"mtime": "2026-08-09T14:48:31.905Z",
		"size": 115378,
		"path": "../public/assets/app-layout-BTAuFzf6.js"
	},
	"/assets/analytics-BwFRmpkt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"686f2-z2pkx18GYJxltipBRFS8nAxHzkc\"",
		"mtime": "2026-08-09T14:48:30.313Z",
		"size": 427762,
		"path": "../public/assets/analytics-BwFRmpkt.js"
	},
	"/assets/dialog-CokybxS7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7e81-YxIV9kNuOyCRQAlnPoVQW2zQF88\"",
		"mtime": "2026-08-09T14:48:32.434Z",
		"size": 32385,
		"path": "../public/assets/dialog-CokybxS7.js"
	},
	"/assets/inter-cyrillic-ext-wght-normal-BOeWTOD4.woff2": {
		"type": "font/woff2",
		"etag": "\"6568-cF1iUGbboMFZ8TfnP5HiMgl9II0\"",
		"mtime": "2026-08-09T14:48:32.850Z",
		"size": 25960,
		"path": "../public/assets/inter-cyrillic-ext-wght-normal-BOeWTOD4.woff2"
	},
	"/assets/inter-cyrillic-wght-normal-DqGufNeO.woff2": {
		"type": "font/woff2",
		"etag": "\"493c-n3Oy9D6jvzfMjpClqox+Zo7ERQQ\"",
		"mtime": "2026-08-09T14:48:32.852Z",
		"size": 18748,
		"path": "../public/assets/inter-cyrillic-wght-normal-DqGufNeO.woff2"
	},
	"/assets/inter-greek-ext-wght-normal-DlzME5K_.woff2": {
		"type": "font/woff2",
		"etag": "\"2be0-BP5iTzJeB8nLqYAgKpWNi5o1Zm8\"",
		"mtime": "2026-08-09T14:48:32.854Z",
		"size": 11232,
		"path": "../public/assets/inter-greek-ext-wght-normal-DlzME5K_.woff2"
	},
	"/assets/inter-greek-wght-normal-CkhJZR-_.woff2": {
		"type": "font/woff2",
		"etag": "\"4a34-xor/hj4YNqI52zFecXnUbzQ4Xs4\"",
		"mtime": "2026-08-09T14:48:32.856Z",
		"size": 18996,
		"path": "../public/assets/inter-greek-wght-normal-CkhJZR-_.woff2"
	},
	"/assets/inter-latin-wght-normal-Dx4kXJAl.woff2": {
		"type": "font/woff2",
		"etag": "\"bc80-8R1ym7Ck2DUNLqPQ/AYs9u8tUpg\"",
		"mtime": "2026-08-09T14:48:32.859Z",
		"size": 48256,
		"path": "../public/assets/inter-latin-wght-normal-Dx4kXJAl.woff2"
	},
	"/assets/inter-vietnamese-wght-normal-CBcvBZtf.woff2": {
		"type": "font/woff2",
		"etag": "\"280c-nBythjoDQ0+5wVAendJ6wU7Xz2M\"",
		"mtime": "2026-08-09T14:48:32.861Z",
		"size": 10252,
		"path": "../public/assets/inter-vietnamese-wght-normal-CBcvBZtf.woff2"
	},
	"/assets/inventory-ET3PG5x8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2e27-FnqyI+FOMvkd6Xx9ShCt8uj9SNk\"",
		"mtime": "2026-08-09T14:48:32.491Z",
		"size": 11815,
		"path": "../public/assets/inventory-ET3PG5x8.js"
	},
	"/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2": {
		"type": "font/woff2",
		"etag": "\"14c4c-zz61D7IQFMB9QxHvTAOk/Vh4ibQ\"",
		"mtime": "2026-08-09T14:48:32.858Z",
		"size": 85068,
		"path": "../public/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2"
	},
	"/assets/label-7YZgvf-H.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7a74-9CxXFDKZWG+sC3j0pYb7ZrfVPhc\"",
		"mtime": "2026-08-09T14:48:32.518Z",
		"size": 31348,
		"path": "../public/assets/label-7YZgvf-H.js"
	},
	"/assets/index-B81sBBgO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3c2d4-oIN7QO+gQyCzRIW8/yKn6AO2PpA\"",
		"mtime": "2026-08-09T14:48:29.912Z",
		"size": 246484,
		"path": "../public/assets/index-B81sBBgO.js"
	},
	"/assets/login-DpXwqfhI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"def-+g2SOzdusVUX5IdpoDq/+CiS19I\"",
		"mtime": "2026-08-09T14:48:32.604Z",
		"size": 3567,
		"path": "../public/assets/login-DpXwqfhI.js"
	},
	"/assets/map-pin-CPv-m2ts.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f6-Qc2IfvqffD9wJn0th4iNRk8rPnY\"",
		"mtime": "2026-08-09T14:48:32.617Z",
		"size": 246,
		"path": "../public/assets/map-pin-CPv-m2ts.js"
	},
	"/assets/operations-D95WpXjr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4b1e-s7zOamjHFtSeBxuvvffVUdo70dM\"",
		"mtime": "2026-08-09T14:48:32.638Z",
		"size": 19230,
		"path": "../public/assets/operations-D95WpXjr.js"
	},
	"/assets/notifications-BHMxwrLV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a8e-pyex91dNDq01ekW70berTPgtLUs\"",
		"mtime": "2026-08-09T14:48:32.620Z",
		"size": 2702,
		"path": "../public/assets/notifications-BHMxwrLV.js"
	},
	"/assets/profile-Bk_hqwmk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11d4-Ot0Ft3/uXoMJ2tBt1hFArKSY6eQ\"",
		"mtime": "2026-08-09T14:48:32.744Z",
		"size": 4564,
		"path": "../public/assets/profile-Bk_hqwmk.js"
	},
	"/assets/rolldown-runtime-QTnfLwEv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b6-wnqLLSlp3SaE+lbe74bKNe5Rpds\"",
		"mtime": "2026-08-09T14:48:32.767Z",
		"size": 694,
		"path": "../public/assets/rolldown-runtime-QTnfLwEv.js"
	},
	"/assets/settings-BlaHnQm0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10bc-OhQ50YZSNXDBRyB/cNoLOOBx40g\"",
		"mtime": "2026-08-09T14:48:32.816Z",
		"size": 4284,
		"path": "../public/assets/settings-BlaHnQm0.js"
	},
	"/assets/routes-CB1EzrF0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"22e2-Xv4Tzyd7hSDxXmEQ3YvPC2izFyw\"",
		"mtime": "2026-08-09T14:48:32.772Z",
		"size": 8930,
		"path": "../public/assets/routes-CB1EzrF0.js"
	},
	"/assets/styles-D9AJGdtc.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"15dab-7uPxTRf+0DHAF6mtyQ2EwO8pshs\"",
		"mtime": "2026-08-09T14:48:32.883Z",
		"size": 89515,
		"path": "../public/assets/styles-D9AJGdtc.css"
	},
	"/assets/transfers-DJq9OKAN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"22e0-6/0oTMiE8HvstU/fdkm0Cys1t/g\"",
		"mtime": "2026-08-09T14:48:32.825Z",
		"size": 8928,
		"path": "../public/assets/transfers-DJq9OKAN.js"
	},
	"/assets/triangle-alert-DilE8inb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fc-ht3OI3baxvjQKpZc8ejG7PjC9FY\"",
		"mtime": "2026-08-09T14:48:32.843Z",
		"size": 252,
		"path": "../public/assets/triangle-alert-DilE8inb.js"
	},
	"/assets/truck-C0zLheAU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"189-1hWN9EssaYo9QgJFiFHwbvuA0Is\"",
		"mtime": "2026-08-09T14:48:32.846Z",
		"size": 393,
		"path": "../public/assets/truck-C0zLheAU.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets-node
function readAsset(id) {
	const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
	return promises.readFile(resolve(serverDir, public_assets_data_default[id].path));
}
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
function getAsset(id) {
	return public_assets_data_default[id];
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/static.mjs
var METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
var EncodingMap = {
	gzip: ".gz",
	br: ".br",
	zstd: ".zst"
};
var static_default = defineHandler((event) => {
	if (event.req.method && !METHODS.has(event.req.method)) return;
	let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
	let asset;
	const encodings = [...(event.req.headers.get("accept-encoding") || "").split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
	for (const encoding of encodings) for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
		const _asset = getAsset(_id);
		if (_asset) {
			asset = _asset;
			id = _id;
			break;
		}
	}
	if (!asset) {
		if (isPublicAssetURL(id)) {
			event.res.headers.delete("Cache-Control");
			throw new HTTPError({ status: 404 });
		}
		return;
	}
	if (encodings.length > 1) event.res.headers.append("Vary", "Accept-Encoding");
	if (event.req.headers.get("if-none-match") === asset.etag) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	const ifModifiedSinceH = event.req.headers.get("if-modified-since");
	const mtimeDate = new Date(asset.mtime);
	if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	if (asset.type) event.res.headers.set("Content-Type", asset.type);
	if (asset.etag && !event.res.headers.has("ETag")) event.res.headers.set("ETag", asset.etag);
	if (asset.mtime && !event.res.headers.has("Last-Modified")) event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
	if (asset.encoding && !event.res.headers.has("Content-Encoding")) event.res.headers.set("Content-Encoding", asset.encoding);
	if (asset.size > 0 && !event.res.headers.has("Content-Length")) event.res.headers.set("Content-Length", asset.size.toString());
	return readAsset(id);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_LOa4wk = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_LOa4wk
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
var globalMiddleware = [toEventHandler(static_default)].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~middleware"].push(...globalMiddleware);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		middleware.push(...h3App["~middleware"]);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/hooks.mjs
function _captureError(error, type) {
	console.error(`[${type}]`, error);
	useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
	process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
	process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
//#endregion
//#region #nitro/virtual/tracing
var tracingSrvxPlugins = [];
//#endregion
//#region node_modules/nitro/dist/presets/node/runtime/node-server.mjs
var _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
var port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
var host = process.env.NITRO_HOST || process.env.HOST;
var cert = process.env.NITRO_SSL_CERT;
var key = process.env.NITRO_SSL_KEY;
var nitroApp = useNitroApp();
serve({
	port,
	hostname: host,
	tls: cert && key ? {
		cert,
		key
	} : void 0,
	fetch: nitroApp.fetch,
	plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
var node_server_default = {};
//#endregion
export { node_server_default as default };

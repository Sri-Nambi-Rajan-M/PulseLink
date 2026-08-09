type ReportedErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type ErrorReporter = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: ReportedErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    // Optional hook for wiring up a real error-monitoring provider (Sentry,
    // Bugsnag, a custom endpoint, etc). Left undefined by default, in which
    // case reportError() just logs to the console instead of no-oping
    // silently against a third-party global.
    __errorReporter?: ErrorReporter;
  }
}

export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  const options: ReportedErrorOptions = {
    mechanism: "react_error_boundary",
    handled: false,
    severity: "error",
  };
  const fullContext = {
    source: "react_error_boundary",
    route: window.location.pathname,
    ...context,
  };

  if (window.__errorReporter?.captureException) {
    window.__errorReporter.captureException(error, fullContext, options);
    return;
  }

  console.error("[error-reporting]", error, fullContext);
}

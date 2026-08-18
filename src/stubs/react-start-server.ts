// Stub for @tanstack/react-start/server used in Capacitor SPA builds.
// The real module relies on server-only APIs (h3, node:http, etc.) that
// cannot run inside an Android WebView.  Every export is replaced with a
// no-op that throws at runtime so the build succeeds and the app only
// fails if the code path is actually reached (which it shouldn't be —
// server functions degrade gracefully to HTTP calls in the client bundle).

export function getRequest(): never {
  throw new Error("getRequest() is not available in the Capacitor build.");
}

export function getEvent(): never {
  throw new Error("getEvent() is not available in the Capacitor build.");
}

export function getRequestHeaders(): Record<string, string> {
  return {};
}

export function getRequestHeader(): string | undefined {
  return undefined;
}

export function getRequestURL(): URL {
  return new URL(globalThis.location?.href ?? "https://localhost");
}

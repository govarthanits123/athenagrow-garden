import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import {
  askAthenaServer,
  generateLearningPathServer,
  generateQuizServer,
} from "./lib/ai.functions";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

async function handleAthenaApiRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonError("Method not allowed", 405);
  }

  try {
    const body = (await request.json()) as {
      action?: string;
      data?: unknown;
    };

    switch (body.action) {
      case "askAthena":
        return Response.json(await askAthenaServer(body.data as any));
      case "generateLearningPath":
        return Response.json(await generateLearningPathServer(body.data as any));
      case "generateQuiz":
        return Response.json(await generateQuizServer(body.data as any));
      default:
        return jsonError("Unknown Athena action.", 400);
    }
  } catch (error) {
    console.error("[Athena API]", error);
    const message = error instanceof Error ? error.message : "Athena request failed.";
    return jsonError(message, 500);
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/athena") {
        return await handleAthenaApiRequest(request);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

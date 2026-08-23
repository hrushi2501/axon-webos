import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  convertToModelMessages,
  safeValidateUIMessages,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { generateMasterPrompt } from "@/lib/master-prompt";
import { FixedWindowRateLimiter } from "@/lib/server/rate-limit";

export const maxDuration = 30;
export const runtime = "nodejs";

const MAX_CHAT_BODY_BYTES = 65_536;
const MAX_CHAT_CONTEXT_CHARACTERS = 4_000;
const MAX_CHAT_MESSAGES = 30;

const readBoundedInteger = (
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : fallback;
};

const chatRateLimit = readBoundedInteger(
  process.env.CHAT_RATE_LIMIT_MAX,
  10,
  1,
  1_000,
);
const chatRateLimitWindowMs = readBoundedInteger(
  process.env.CHAT_RATE_LIMIT_WINDOW_MS,
  60_000,
  1_000,
  3_600_000,
);
const rateLimiter = new FixedWindowRateLimiter(
  chatRateLimit,
  chatRateLimitWindowMs,
);

interface ChatRequestBody {
  context?: string;
  messages?: unknown;
}

const tools = {
  openWindow: tool({
    description: "Open an application window in Axon OS",
    inputSchema: z.object({
      appId: z
        .string()
        .describe(
          'Application ID such as "files", "settings", "about", "resume", "projects", "contact", or "task-manager"',
        ),
      title: z.string().max(100).describe("Human-readable application title"),
    }),
  }),
  closeWindow: tool({
    description: "Close a specific window or the active window",
    inputSchema: z.object({
      windowId: z
        .string()
        .max(100)
        .describe('Window ID to close, or "active" for the focused window'),
    }),
  }),
  changeTheme: tool({
    description: "Change the Axon OS wallpaper or accent color",
    inputSchema: z.object({
      setting: z.enum(["wallpaper", "color"]),
      value: z.string().max(100).describe("An available setting ID"),
    }),
  }),
};

const jsonError = (error: string, status: number, headers: HeadersInit = {}) =>
  Response.json(
    { error },
    {
      headers: { "Cache-Control": "no-store", ...headers },
      status,
    },
  );

const getClientKey = (request: Request): string => {
  const forwardedFor = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();

  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    forwardedFor ??
    "direct-client"
  );
};

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return jsonError("content_type_must_be_application_json", 415);
  }

  const rateLimitResult = rateLimiter.consume(getClientKey(request));
  const rateLimitHeaders = {
    "X-RateLimit-Limit": String(chatRateLimit),
    "X-RateLimit-Remaining": String(rateLimitResult.remaining),
    "X-RateLimit-Reset": String(Math.ceil(rateLimitResult.resetAt / 1_000)),
  };

  if (!rateLimitResult.allowed) {
    return jsonError("rate_limit_exceeded", 429, {
      ...rateLimitHeaders,
      "Retry-After": String(
        Math.max(1, Math.ceil((rateLimitResult.resetAt - Date.now()) / 1_000)),
      ),
    });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_CHAT_BODY_BYTES) {
    return jsonError("request_too_large", 413, rateLimitHeaders);
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_CHAT_BODY_BYTES) {
    return jsonError("request_too_large", 413, rateLimitHeaders);
  }

  let requestBody: ChatRequestBody;
  try {
    requestBody = JSON.parse(rawBody) as ChatRequestBody;
  } catch {
    return jsonError("invalid_json", 400, rateLimitHeaders);
  }

  if (
    requestBody.context !== undefined &&
    (typeof requestBody.context !== "string" ||
      requestBody.context.length > MAX_CHAT_CONTEXT_CHARACTERS)
  ) {
    return jsonError("invalid_context", 400, rateLimitHeaders);
  }

  if (
    !Array.isArray(requestBody.messages) ||
    requestBody.messages.length > MAX_CHAT_MESSAGES
  ) {
    return jsonError("invalid_messages", 400, rateLimitHeaders);
  }

  const validatedMessages = await safeValidateUIMessages<UIMessage>({
    messages: requestBody.messages,
  });
  if (!validatedMessages.success) {
    return jsonError("invalid_messages", 400, rateLimitHeaders);
  }

  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonError("ai_service_not_configured", 503, rateLimitHeaders);
  }

  try {
    const google = createGoogleGenerativeAI({ apiKey });
    const modelMessages = await convertToModelMessages(validatedMessages.data, {
      ignoreIncompleteToolCalls: true,
      tools,
    });
    const result = streamText({
      abortSignal: request.signal,
      messages: modelMessages,
      model: google(process.env.GEMINI_MODEL ?? "gemini-2.5-flash"),
      system: generateMasterPrompt(requestBody.context ?? ""),
      timeout: 30_000,
      tools,
    });

    return result.toUIMessageStreamResponse({
      headers: {
        "Cache-Control": "no-store",
        ...rateLimitHeaders,
      },
      onError: (error) => {
        console.error("Axon Copilot stream failed", {
          error: error instanceof Error ? error.name : "UnknownError",
        });
        return "The AI service is temporarily unavailable.";
      },
    });
  } catch (error) {
    console.error("Axon Copilot request failed", {
      error: error instanceof Error ? error.name : "UnknownError",
    });
    return jsonError("ai_service_unavailable", 502, rateLimitHeaders);
  }
}

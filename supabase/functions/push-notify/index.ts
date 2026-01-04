import { serve } from "https://deno.land/std@0.204.0/http/server.ts";

const EXPO_ENDPOINT = "https://exp.host/--/api/v2/push/send";
const MAX_TOKENS_PER_REQUEST = 100;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type RequestBody = {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let payload: RequestBody;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const tokens = Array.isArray(payload.tokens)
    ? payload.tokens.filter((token) => typeof token === "string" && token.length > 0)
    : [];

  if (!tokens.length) {
    return jsonResponse({ error: "No tokens provided" }, 400);
  }
  if (typeof payload.title !== "string" || typeof payload.body !== "string") {
    return jsonResponse({ error: "Missing title or body" }, 400);
  }

  const chunks = chunkTokens(tokens, MAX_TOKENS_PER_REQUEST);
  const results: unknown[] = [];

  for (const chunk of chunks) {
    const messages = chunk.map((token) => ({
      to: token,
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
    }));

    const response = await fetch(EXPO_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messages),
    });

    const responseJson = await response.json().catch(() => ({}));

    if (!response.ok) {
      return jsonResponse(
        { error: "Expo push request failed", details: responseJson },
        502
      );
    }

    results.push(responseJson);
  }

  return jsonResponse({ success: true, batches: results.length, results }, 200);
});

function chunkTokens(tokens: string[], size: number): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < tokens.length; i += size) {
    chunks.push(tokens.slice(i, i + size));
  }
  return chunks;
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

import { z } from "zod";

const API_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const API_KEY = process.env.AGENT_API_KEY || "test-key";

async function assertApi(path: string, payload: any, headers: any, expectedStatus: number, expectedOk: boolean) {
  console.log(`Testing POST ${path}...`);
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(payload),
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : await res.text();

  if (res.status !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus}, got ${res.status}. Body: ${JSON.stringify(body)}`);
  }

  if (isJson && body.ok !== expectedOk) {
    throw new Error(`Expected ok ${expectedOk}, got ${body.ok}. Body: ${JSON.stringify(body)}`);
  }
  
  return body;
}

async function run() {
  console.log("Running Agent API Smoke Tests...");

  // 1. 401 without key
  await assertApi("/api/agent/availability", {}, {}, 401, false);

  const authHeaders = { "x-agent-api-key": API_KEY };

  // 2. 422 on bad body
  await assertApi("/api/agent/availability", { bad: "payload" }, authHeaders, 422, false);

  // 3. correct envelope
  const availRes = await assertApi("/api/agent/availability", {
    event_date: "2026-10-15"
  }, authHeaders, 200, true);

  if (!availRes.status || !availRes.message) {
     throw new Error("Missing status or message in availability response");
  }

  // 4. idempotent repeat
  const idempotencyKey = "test-idemp-" + Date.now();
  const headersWithIdempotency = { ...authHeaders, "Idempotency-Key": idempotencyKey };
  
  const req1 = await assertApi("/api/agent/availability", { event_date: "2026-10-15" }, headersWithIdempotency, 200, true);
  const req2 = await assertApi("/api/agent/availability", { event_date: "2026-10-15" }, headersWithIdempotency, 200, true);

  if (JSON.stringify(req1) !== JSON.stringify(req2)) {
      throw new Error("Idempotent repeat returned different responses");
  }

  console.log("All smoke tests passed.");
}

run().catch((err) => {
  console.error("Smoke tests failed:", err);
  process.exit(1);
});

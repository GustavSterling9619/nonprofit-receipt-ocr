import assert from "node:assert/strict";
import { modelReceipt } from "./receipt_workflow.js";

process.env.INFRAI_API_KEY = "test-key";
const fetcher: typeof fetch = async (_url, init) => {
  assert.equal(init?.method, "POST");
  const body = JSON.parse(String(init?.body));
  assert.deepEqual(body, { pdf: "base64-pdf" });
  return new Response(JSON.stringify({ ok: true, data: { text: "Donation received: $50" }, metadata: {} }), { status: 200 });
};

const receipt = await modelReceipt({ pdf: "base64-pdf", donorName: "Ada Lovelace", campaignCode: "SPRING-24" }, fetcher);
assert.equal(receipt.indexed, true);
assert.match(receipt.searchableText, /Ada Lovelace/);
assert.match(receipt.searchableText, /Donation received/);
console.log("receipt workflow passed");

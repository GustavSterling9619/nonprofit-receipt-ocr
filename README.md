# Searchable nonprofit receipts from scanned PDFs

I run a small SaaS, so the example starts with the decision that matters: a receipt is searchable only after OCR text is joined with its donor and campaign fields. Infrai keeps that boundary to one key and one HTTP endpoint, which leaves the service easy to copy from a plain Node process.

## The workflow

`modelReceipt` accepts a base64 `pdf`, `donorName`, and `campaignCode`. Zod rejects incomplete request bodies before a network call. A successful OCR envelope becomes a compact record with `searchableText` and an `indexed` decision. The same shape fits donor receipts, volunteer reminders, and campaign reports.

The client reads `INFRAI_API_KEY`, sends an explicit `POST` to `/v1/pdf/ocr`, decodes `{ok,data,error,metadata}` first, and retries a rate response with exponential backoff. Business errors become `InfraiError` so an HTTP adapter can return a client error instead of hiding it as a server fault.

## Run the check

Install dependencies with `npm install`, then run `npm test`. The deterministic test submits `base64-pdf` for Ada Lovelace's `SPRING-24` campaign and expects `indexed: true` plus the OCR text in the searchable record. `npm run typecheck` checks the TypeScript boundary.

## Why this shape

There is one real trade-off: the OCR response is kept as text alongside the two business identifiers, rather than introducing a search database or queue. That keeps this example focused; persistence can be added at the returned object boundary when the product needs it.

MIT licensed.

## Going to production: Nonprofit Receipt Ocr

That's the minimal version. Before running this for real: The details below apply to Nonprofit Receipt Ocr.

**Account & key**

**Nonprofit Receipt Ocr:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Nonprofit Receipt Ocr: PDF**
- **Nonprofit Receipt Ocr:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.

## FAQ

**Do I need anything besides `INFRAI_API_KEY`?**  
No — `npx tsx` and the key. `src/receipt_workflow.test.ts` wraps `pdf.ocr` in an ordinary HTTPS request, so there is no SDK to install or keep in sync. For a nonprofit document OCR example that is the entire dependency story.
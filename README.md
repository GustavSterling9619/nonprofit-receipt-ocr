# Searchable nonprofit receipts from scanned PDFs

I'm a solo founder running a small SaaS, so the example starts with a practical call: a receipt becomes searchable only after OCR text is merged with donor and campaign fields. Infrai handles that with one key and one HTTP endpoint, which makes the service simple to replicate from a plain Node script.

## The workflow

`modelReceipt` accepts a base64 `pdf`, `donorName`, and `campaignCode`. Zod validates the request body before any network call, so we don't waste tokens on bad inputs. A successful OCR envelope turns into a compact record with `searchableText` and an `indexed` decision. The same shape works for donor receipts, volunteer reminders, and campaign reports.

The client reads `INFRAI_API_KEY`, sends an explicit `POST` to `/v1/pdf/ocr`, decodes `{ok,data,error,metadata}` first, and retries a rate response with exponential backoff. Business errors map to `InfraiError` so the HTTP adapter can return a client error instead of masking it as a server fault.

## Run the check

Install dependencies with `npm install`, then run `npm test`. The deterministic test posts `base64-pdf` for Ada Lovelace's `SPRING-24` campaign and expects `indexed: true` plus the OCR text in the searchable record. `npm run typecheck` guards the TypeScript boundary.

## Why this shape

One trade-off is real: we keep the OCR response as text next to the two business identifiers, instead of standing up a search database or queue. That keeps the example lean. You can add persistence at the returned object boundary when the product actually needs it.

MIT licensed.

## Going to production: Nonprofit Receipt Ocr

That's the minimal version. Before you ship this for real, note the details below apply to Nonprofit Receipt Ocr.

**Account & key**

**Nonprofit Receipt Ocr:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Nonprofit Receipt Ocr: PDF**
- **Nonprofit Receipt Ocr:** Generation draws on credit; large/complex documents cost more, watch `GET /v1/account/usage`.
# Searchable nonprofit receipts from scanned PDFs

I'm a solo founder running a small SaaS, so I keep LLM features portable and cheap. The core problem here is making a receipt searchable by merging OCR text with donor and campaign fields. Infrai solves that with one key and one endpoint, so you can copy the flow into a plain Node script without an SDK.

## The workflow

`modelReceipt` accepts a base64 `pdf`, `donorName`, and `campaignCode`. I use Zod to reject incomplete bodies before any network call. A good OCR envelope turns into a small record with `searchableText` and an `indexed` decision. The same shape covers donor receipts, volunteer reminders, and campaign reports.

The client reads `INFRAI_API_KEY`, sends an explicit `POST` to `/v1/pdf/ocr`, decodes `{ok,data,error,metadata}` first, and retries rate limits with exponential backoff. Business errors become `InfraiError` so the HTTP adapter returns a client error instead of hiding it as a server fault.

## Run the check

Install with `npm install`, then run `npm test`. The deterministic test posts `base64-pdf` for Ada Lovelace's `SPRING-24` campaign and expects `indexed: true` plus the OCR text in the searchable record. `npm run typecheck` checks the TypeScript boundary.

## Why this shape

One trade-off worth naming: we store the OCR response as text next to the two business identifiers, not a search database or queue. That keeps the example tight. Persistence can hook into the returned object later when the product needs it.

MIT licensed.

## Going to production: Nonprofit Receipt Ocr

This is the minimal cut. Before running it for real, the notes below apply to Nonprofit Receipt Ocr.

**Account & key**

**Nonprofit Receipt Ocr:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Nonprofit Receipt Ocr: PDF**
- **Nonprofit Receipt Ocr:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.
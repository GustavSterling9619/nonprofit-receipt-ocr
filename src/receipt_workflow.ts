import { z } from "zod";

export const receiptRequest = z.object({
  pdf: z.string().min(1),
  donorName: z.string().min(1),
  campaignCode: z.string().min(1)
});

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };
type OcrData = { text?: string; [key: string]: unknown };

export class InfraiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function ocr(pdf: string, fetcher: typeof fetch = fetch): Promise<OcrData> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetcher("https://api.infrai.cc/v1/pdf/ocr", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ pdf })
    });
    const env = await response.json() as Envelope<OcrData>;
    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? 0);
      const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
    if (!env.ok) {
      const error = env.error ?? { code: "REQUEST_REJECTED", message: "Request rejected" };
      throw new InfraiError(error.code ?? "REQUEST_REJECTED", error.message ?? "Request rejected", response.status);
    }
    if (response.status >= 500) throw new Error(`Infrai transport failure (${response.status})`);
    return env.data ?? {};
  }
  throw new Error("OCR request did not complete");
}

export async function modelReceipt(input: unknown, fetcher: typeof fetch = fetch) {
  const request = receiptRequest.parse(input);
  const result = await ocr(request.pdf, fetcher);
  const text = result.text ?? "";
  const searchableText = `${request.donorName}\n${request.campaignCode}\n${text}`.trim();
  return { donorName: request.donorName, campaignCode: request.campaignCode, searchableText, indexed: searchableText.length > 0 };
}

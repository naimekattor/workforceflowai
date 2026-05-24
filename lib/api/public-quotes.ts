import { buildApiUrl } from "./config";
import type { Customer } from "./customers";
import type { Quote } from "./quotes";

type PublicQuoteResult =
  | { ok: true; quote: Quote }
  | { ok: false; status: number; message: string };

type PublicQuoteDecisionResult =
  | { ok: true; message?: string }
  | { ok: false; status: number; message: string };

type PublicCustomerResult =
  | { ok: true; customer: Customer }
  | { ok: false; status: number; message: string };

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const data: unknown = await response.json();

    if (typeof data === "object" && data !== null && "detail" in data) {
      const detail = data.detail;
      if (typeof detail === "string") {
        return detail;
      }
    }

    if (typeof data === "object" && data !== null && "message" in data) {
      const message = data.message;
      if (typeof message === "string") {
        return message;
      }
    }

    if (typeof data === "string") {
      return data;
    }
  } catch {
    // Use the fallback below when the backend returns an empty or non-JSON body.
  }

  return fallback;
}

export async function getPublicQuote(
  id: string | number,
  accessToken?: string
): Promise<PublicQuoteResult> {
  const headers = accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : undefined;

  const response = await fetch(buildApiUrl(`/api/quote/${id}/`), {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: await readErrorMessage(response, "Failed to load quote."),
    };
  }

  return {
    ok: true,
    quote: (await response.json()) as Quote,
  };
}

export async function getPublicCustomer(
  id: string | number,
  accessToken?: string
): Promise<PublicCustomerResult> {
  const headers = accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : undefined;

  const response = await fetch(buildApiUrl(`/api/customer/${id}/`), {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: await readErrorMessage(response, "Failed to load customer."),
    };
  }

  return {
    ok: true,
    customer: (await response.json()) as Customer,
  };
}

async function submitPublicQuoteDecision(
  path: "/api/quote/accept/" | "/api/quote/reject/",
  quoteId: number,
  accessToken?: string
): Promise<PublicQuoteDecisionResult> {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(buildApiUrl(path), {
    method: "POST",
    headers,
    body: JSON.stringify({ quote_id: Number(quoteId) }),
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: await readErrorMessage(
        response,
        "Unable to update this quote. Please try again."
      ),
    };
  }

  let message: string | undefined;
  try {
    const data: unknown = await response.json();
    if (typeof data === "object" && data !== null) {
      const record = data as Record<string, unknown>;
      for (const key of ["message", "detail", "success"] as const) {
        if (key in record) {
          const value = record[key];
          if (typeof value === "string") {
            message = value;
            break;
          }
        }
      }
    }
  } catch {
    // A successful empty response is still a successful quote decision.
  }

  return {
    ok: true,
    message,
  };
}

export async function acceptPublicQuote(
  quoteId: number,
  accessToken?: string
): Promise<PublicQuoteDecisionResult> {
  return submitPublicQuoteDecision("/api/quote/accept/", quoteId, accessToken);
}

export async function rejectPublicQuote(
  quoteId: number,
  accessToken?: string
): Promise<PublicQuoteDecisionResult> {
  return submitPublicQuoteDecision("/api/quote/reject/", quoteId, accessToken);
}

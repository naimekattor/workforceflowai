import { buildApiUrl } from "./config";
import type { Customer } from "./customers";
import type { Quote } from "./quotes";

type PublicQuoteResult =
  | { ok: true; quote: Quote }
  | { ok: false; status: number; message: string };

type PublicCheckoutResult =
  | { ok: true; checkout_url: string }
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

  //sd

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

export async function createPublicQuoteCheckout(
  quoteId: string | number,
  accessToken?: string
): Promise<PublicCheckoutResult> {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(buildApiUrl("/api/quote/checkout/"), {
    method: "POST",
    headers,
    body: JSON.stringify({ quote_id: quoteId }),
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: await readErrorMessage(
        response,
        "Failed to create checkout session."
      ),
    };
  }

  const data = (await response.json()) as { checkout_url?: string };

  if (!data.checkout_url) {
    return {
      ok: false,
      status: 502,
      message: "Checkout URL was not returned by the backend.",
    };
  }

  return {
    ok: true,
    checkout_url: data.checkout_url,
  };
}

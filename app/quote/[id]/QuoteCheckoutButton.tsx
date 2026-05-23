"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

type QuoteCheckoutButtonProps = {
  quoteId: number;
};

async function readCheckoutError(response: Response) {
  try {
    const data: unknown = await response.json();

    if (typeof data === "object" && data !== null && "detail" in data) {
      const detail = data.detail;
      if (typeof detail === "string") {
        return detail;
      }
    }
  } catch {
    // The fallback below is enough when the response body is empty.
  }

  return "Unable to start checkout. Please contact the sender.";
}

export default function QuoteCheckoutButton({
  quoteId,
}: QuoteCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/public/quote-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quote_id: quoteId }),
      });

      if (!response.ok) {
        throw new Error(await readCheckoutError(response));
      }

      const data = (await response.json()) as { checkout_url?: string };

      if (!data.checkout_url) {
        throw new Error("Checkout URL was not returned.");
      }

      window.location.href = data.checkout_url;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to start checkout. Please contact the sender."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#22d3ee] px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#06b6d4] disabled:bg-slate-300 sm:w-auto"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4" />
        )}
        {loading ? "Opening checkout..." : "Pay Deposit / Checkout"}
      </button>
      {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
    </div>
  );
}

"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { acceptPublicQuote, rejectPublicQuote } from "@/lib/api/public-quotes";

type QuoteDecisionButtonsProps = {
  quoteId: number;
  quoteStatus?: string;
};

type Decision = "accept" | "reject";

export default function QuoteDecisionButtons({
  quoteId,
  quoteStatus,
}: QuoteDecisionButtonsProps) {
  const [pendingDecision, setPendingDecision] = useState<Decision | null>(null);
  const [completedDecision, setCompletedDecision] = useState<Decision | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleDecision = async (decision: Decision) => {
    try {
      setPendingDecision(decision);
      setErrorMessage("");
      setMessage("");

      const result =
        decision === "accept"
          ? await acceptPublicQuote(quoteId)
          : await rejectPublicQuote(quoteId);

      if (!result.ok) {
        throw new Error(result.message);
      }

      setCompletedDecision(decision);
      setMessage(
        result.message ||
          (decision === "accept" ? "Quote accepted." : "Quote rejected.")
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update this quote. Please try again."
      );
    } finally {
      setPendingDecision(null);
    }
  };

  const normalizedQuoteStatus = quoteStatus?.trim().toLowerCase();

  if (
    normalizedQuoteStatus === "accepted" ||
    normalizedQuoteStatus === "rejected" ||
    normalizedQuoteStatus === "paid"
  ) {
    const isPositiveStatus =
      normalizedQuoteStatus === "accepted" || normalizedQuoteStatus === "paid";

    return (
      <div
        className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold shadow-sm ${
          isPositiveStatus
            ? "bg-emerald-100 text-emerald-700"
            : "border border-red-200 bg-white text-red-600"
        }`}
      >
        {isPositiveStatus ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
        {quoteStatus}
      </div>
    );
  }

  const isDisabled = Boolean(pendingDecision) || Boolean(completedDecision);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleDecision("accept")}
          disabled={isDisabled}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:bg-slate-300"
        >
          {pendingDecision === "accept" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Accept
        </button>
        <button
          type="button"
          onClick={() => handleDecision("reject")}
          disabled={isDisabled}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 shadow-sm transition-colors hover:bg-red-50 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
        >
          {pendingDecision === "reject" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          Reject
        </button>
      </div>
      {message && <p className="text-xs font-medium text-emerald-700">{message}</p>}
      {errorMessage && <p className="text-xs font-medium text-red-600">{errorMessage}</p>}
    </div>
  );
}

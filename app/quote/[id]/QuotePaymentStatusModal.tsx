"use client";

import { useEffect, useRef } from "react";
import { showError, showSuccess } from "@/lib/ui/alerts";

type QuotePaymentStatusModalProps = {
  status?: string;
};

export default function QuotePaymentStatusModal({
  status,
}: QuotePaymentStatusModalProps) {
  const hasShown = useRef(false);

  useEffect(() => {
    if (hasShown.current) {
      return;
    }

    const normalizedStatus = status?.toLowerCase();

    if (normalizedStatus === "success") {
      hasShown.current = true;
      void showSuccess(
        "Your payment was completed successfully.",
        "Payment successful"
      );
    }

    if (normalizedStatus === "cancel") {
      hasShown.current = true;
      void showError(
        "Payment was cancelled. Please pay again to complete this quote.",
        "Payment cancelled"
      );
    }
  }, [status]);

  return null;
}

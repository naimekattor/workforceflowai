type StripeConnectReturnStatus = "success" | "failed";

const ACCOUNT_SETTINGS_WALLET_PATH = "/dashboard/account-settings?tab=wallet";

function getFrontendBaseUrl() {
  return (process.env.NEXT_PUBLIC_FRONTEND_URL || "").replace(/\/+$/, "");
}

export function buildStripeConnectReturnUrl(
  status: StripeConnectReturnStatus
) {
  const path = `${ACCOUNT_SETTINGS_WALLET_PATH}&stripe_status=${status}`;
  const origin = getFrontendBaseUrl();

  return origin ? `${origin}${path}` : path;
}

export function getStripeConnectOnboardingReturnUrls() {
  return {
    refresh_url: buildStripeConnectReturnUrl("failed"),
    return_url: buildStripeConnectReturnUrl("success"),
  };
}

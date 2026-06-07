"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import {
  Banknote,
  CheckCircle2,
  History,
  Loader2,
  Plus,
  Power,
  RefreshCw,
  Star,
  Trash2,
  Wallet,
} from "lucide-react";
import {
  BillingInfo,
  createStripeConnectOnboardingLink,
  deleteStripeConnectAccount,
  getBillingHistory,
  getStripeConnectAccounts,
  getStripeConnectWallet,
  requestStripeConnectPayout,
  setPrimaryStripeConnectAccount,
  StripeConnectAccountSummary,
  StripeConnectWalletResponse,
  turnActiveStripeConnectAccount,
} from "@/lib/api/billing";
import { getStripeConnectOnboardingReturnUrls } from "@/lib/api/stripe-connect-urls";
import { confirmAction, showError, showSuccess } from "@/lib/ui/alerts";

function firstMessage(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.find((item): item is string => typeof item === "string");
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return (
      firstMessage(record.non_field_errors) ||
      firstMessage(record.message) ||
      firstMessage(record.detail) ||
      firstMessage(record.error)
    );
  }
  return undefined;
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (!isAxiosError(error)) return fallback;

  const data = error.response?.data;
  if (!data || typeof data !== "object") return fallback;

  const record = data as Record<string, unknown>;
  return (
    firstMessage(record.error) ||
    firstMessage(record.detail) ||
    firstMessage(record.message) ||
    firstMessage(record.non_field_errors) ||
    fallback
  );
}

function getActionMessage(
  response: { detail?: string; error?: string; message?: string },
  fallback: string
) {
  return response.message || response.detail || response.error || fallback;
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(
  value: string | number | null | undefined
) {
  if (value === null || value === undefined || value === "") return "-";

  const amount = typeof value === "number" ? value : Number.parseFloat(value);
  if (Number.isNaN(amount)) return String(value);

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(amount);
}

function availableBalance(wallet: StripeConnectWalletResponse | null) {
  return (
    wallet?.wallet?.available ??
    wallet?.available_balance ??
    wallet?.available ??
    wallet?.balance
  );
}

function pendingBalance(wallet: StripeConnectWalletResponse | null) {
  return wallet?.wallet?.pending ?? wallet?.pending_balance ?? wallet?.pending;
}

function billingStatusClassName(status: string) {
  const normalized = status.toLowerCase();

  if (["paid", "success", "completed", "active"].includes(normalized)) {
    return "text-emerald-600";
  }

  if (["failed", "cancelled", "canceled", "expired"].includes(normalized)) {
    return "text-red-600";
  }

  if (["pending", "processing"].includes(normalized)) {
    return "text-amber-600";
  }

  return "text-slate-500";
}

function AccountBadges({ account }: { account: StripeConnectAccountSummary }) {
  return (
    <div className="flex flex-wrap gap-2">
      {account.is_primary && (
        <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">
          Primary
        </span>
      )}
      {account.is_current_plan && (
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
          Active
        </span>
      )}
      <span
        className={`rounded-full px-2 py-1 text-[11px] font-bold ${
          account.can_receive_payouts
            ? "bg-cyan-50 text-cyan-700"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        {account.can_receive_payouts ? "Payouts enabled" : "Payouts pending"}
      </span>
    </div>
  );
}

export default function WalletTab() {
  const [wallet, setWallet] = useState<StripeConnectWalletResponse | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState("");
  const [accounts, setAccounts] = useState<StripeConnectAccountSummary[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState("");
  const [history, setHistory] = useState<BillingInfo[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [accountAction, setAccountAction] = useState("");
  const [addingAccount, setAddingAccount] = useState(false);

  const loadWallet = useCallback(async () => {
    try {
      setWalletLoading(true);
      setWalletError("");
      const data = await getStripeConnectWallet();
      setWallet(data);
      setWalletError(data.error || data.detail || "");
    } catch (error) {
      setWallet(null);
      setWalletError(
        getApiErrorMessage(error, "Wallet balance is currently unavailable.")
      );
    } finally {
      setWalletLoading(false);
    }
  }, []);

  const loadAccounts = useCallback(async () => {
    try {
      setAccountsLoading(true);
      setAccountsError("");
      const data = await getStripeConnectAccounts();
      setAccounts(Array.isArray(data.accounts) ? data.accounts : []);
    } catch (error) {
      setAccounts([]);
      setAccountsError(
        getApiErrorMessage(error, "Failed to load connected Stripe accounts.")
      );
    } finally {
      setAccountsLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      setHistoryError("");
      const data = await getBillingHistory();
      setHistory(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      setHistory([]);
      setHistoryError(
        getApiErrorMessage(error, "Failed to load payout history.")
      );
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const refreshWallet = useCallback(async () => {
    await Promise.all([loadWallet(), loadAccounts(), loadHistory()]);
  }, [loadAccounts, loadHistory, loadWallet]);

  useEffect(() => {
    void refreshWallet();
  }, [refreshWallet]);

  const handleAddAccount = async () => {
    try {
      setAddingAccount(true);
      const response = await createStripeConnectOnboardingLink(
        getStripeConnectOnboardingReturnUrls()
      );

      if (!response.url) {
        throw new Error("Stripe onboarding response did not include a URL.");
      }

      window.location.assign(response.url);
    } catch (error) {
      await showError(
        getApiErrorMessage(error, "Failed to add a Stripe account.")
      );
      setAddingAccount(false);
    }
  };

  const handleAccountAction = async (
    action: "primary" | "active",
    accountId: number
  ) => {
    try {
      setAccountAction(`${action}-${accountId}`);
      const response =
        action === "primary"
          ? await setPrimaryStripeConnectAccount(accountId)
          : await turnActiveStripeConnectAccount(accountId);

      await showSuccess(
        getActionMessage(
          response,
          action === "primary"
            ? "Primary Stripe account updated."
            : "Active Stripe account updated."
        )
      );
      await Promise.all([loadAccounts(), loadWallet()]);
    } catch (error) {
      await showError(
        getApiErrorMessage(error, "Failed to update the Stripe account.")
      );
    } finally {
      setAccountAction("");
    }
  };

  const handleDeleteAccount = async (account: StripeConnectAccountSummary) => {
    const confirmed = await confirmAction({
      title: "Delete Stripe account?",
      text: `Remove ${account.display_name || "this Stripe account"} from your wallet?`,
      confirmButtonText: "Delete",
    });

    if (!confirmed) return;

    try {
      setAccountAction(`delete-${account.id}`);
      await deleteStripeConnectAccount(account.id);
      await showSuccess("Stripe account deleted.");
      await Promise.all([loadAccounts(), loadWallet()]);
    } catch (error) {
      await showError(
        getApiErrorMessage(error, "Failed to delete the Stripe account.")
      );
    } finally {
      setAccountAction("");
    }
  };

  const handleWithdraw = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number.parseFloat(payoutAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      await showError("Enter a valid withdrawal amount.");
      return;
    }

    try {
      setPayoutLoading(true);
      const response = await requestStripeConnectPayout(payoutAmount);
      await showSuccess(
        getActionMessage(response, "Withdrawal request submitted.")
      );
      setPayoutAmount("");
      await Promise.all([loadWallet(), loadHistory()]);
    } catch (error) {
      await showError(
        getApiErrorMessage(error, "Failed to submit the withdrawal request.")
      );
    } finally {
      setPayoutLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-cyan-500" />
              <h2 className="text-[15px] font-bold text-slate-900">Balance</h2>
            </div>
            <button
              type="button"
              onClick={() => void refreshWallet()}
              disabled={walletLoading}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Refresh wallet"
              title="Refresh wallet"
            >
              <RefreshCw
                className={`h-4 w-4 ${walletLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {walletLoading ? (
            <p className="text-sm text-slate-500">Loading balance...</p>
          ) : (
            <>
              <p className="mb-1 text-3xl font-bold text-slate-900">
                {formatMoney(availableBalance(wallet))}
              </p>
              <p className="text-xs text-slate-500">Available to withdraw</p>
              {pendingBalance(wallet) !== undefined && (
                <p className="mt-4 text-xs font-medium text-slate-600">
                  Pending: {formatMoney(pendingBalance(wallet))}
                </p>
              )}
            </>
          )}

          {walletError && (
            <p className="mt-4 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              {walletError}
            </p>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <Banknote className="h-5 w-5 text-emerald-500" />
            <h2 className="text-[15px] font-bold text-slate-900">Withdraw</h2>
          </div>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label
                htmlFor="wallet-payout-amount"
                className="mb-1.5 block text-xs font-bold text-slate-700"
              >
                Amount
              </label>
              <input
                id="wallet-payout-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={payoutAmount}
                onChange={(event) => setPayoutAmount(event.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                required
              />
            </div>
            <button
              type="submit"
              disabled={payoutLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#22d3ee] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#06b6d4] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {payoutLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Withdraw
            </button>
          </form>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">
              Stripe Connect Accounts
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Add accounts, choose the primary account, and select the active payout account.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddAccount}
            disabled={addingAccount}
            className="inline-flex items-center gap-2 rounded-lg bg-[#22d3ee] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#06b6d4] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {addingAccount ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add Stripe Account
          </button>
        </div>

        {accountsError && (
          <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
            {accountsError}
          </p>
        )}

        {accountsLoading ? (
          <p className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Loading Stripe accounts...
          </p>
        ) : accounts.length === 0 ? (
          <p className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No Stripe accounts connected.
          </p>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <article
                key={account.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {account.display_name || `Stripe account ${account.id}`}
                      </h3>
                      {account.onboarding_complete && (
                        <CheckCircle2
                          className="h-4 w-4 text-emerald-500"
                          aria-label="Onboarding complete"
                        />
                      )}
                    </div>
                    <AccountBadges account={account} />
                    <p className="mt-2 text-xs text-slate-500">
                      {formatLabel(account.account_health)} - Added {formatDate(account.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!account.is_primary && (
                      <button
                        type="button"
                        onClick={() => void handleAccountAction("primary", account.id)}
                        disabled={Boolean(accountAction)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Star className="h-3.5 w-3.5" />
                        Set Primary
                      </button>
                    )}
                    {!account.is_current_plan && (
                      <button
                        type="button"
                        onClick={() => void handleAccountAction("active", account.id)}
                        disabled={Boolean(accountAction)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 px-3 py-2 text-xs font-bold text-cyan-700 transition-colors hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Power className="h-3.5 w-3.5" />
                        Set Active
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void handleDeleteAccount(account)}
                      disabled={Boolean(accountAction)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {accountAction === `delete-${account.id}` ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <History className="h-5 w-5 text-slate-500" />
          <h2 className="text-[15px] font-bold text-slate-900">
            Payout History
          </h2>
        </div>

        {historyError && (
          <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
            {historyError}
          </p>
        )}

        {historyLoading ? (
          <p className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Loading payout history...
          </p>
        ) : history.length === 0 ? (
          <p className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No payout history found.
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={`${item.invoice_id}-${item.created_at}`}
                className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 p-4"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {item.invoice_id}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.plan_name} - {formatDate(item.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    {formatMoney(item.amount)}
                  </p>
                  <p
                    className={`mt-1 text-xs font-medium ${billingStatusClassName(item.status)}`}
                  >
                    {item.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

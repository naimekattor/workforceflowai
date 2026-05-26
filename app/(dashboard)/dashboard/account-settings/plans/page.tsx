"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Crown } from "lucide-react";
import Link from "next/link";
import { isAxiosError } from "axios";
import { getUserProfile } from "@/lib/api/business";
import { createPlanPurchaseCheckout, getPlans, Plan } from "@/lib/api/plans";
import {
  createStripeConnectAccount,
  createStripeConnectOnboardingLink,
} from "@/lib/api/billing";
import { formatCurrency } from "@/lib/invoices";
import { showError, showInfo } from "@/lib/ui/alerts";

function formatPlanPrice(price: string) {
  const amount = Number.parseFloat(price);
  return formatCurrency(Number.isNaN(amount) ? 0 : amount);
}

function formatPlanLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatLimitValue(value: number | null) {
  return value === null ? "Unlimited" : value.toLocaleString();
}

function isPopularPlan(plan: Plan) {
  return plan.plan_type.toLowerCase() === "professional";
}

function planStorageKeys(plan: Plan) {
  return [String(plan.id), plan.plan_type.toLowerCase(), plan.name.toLowerCase()];
}

const planLimitLabels: Array<{
  key: keyof Plan["limits"];
  label: string;
}> = [
  { key: "customers", label: "Customers" },
  { key: "quotes", label: "Quotes" },
  { key: "team", label: "Team members" },
];

function isFreePlan(plan: Plan) {
  const price = Number.parseFloat(plan.price);
  return (
    (!Number.isNaN(price) && price <= 0) ||
    plan.plan_type.toLowerCase() === "free" ||
    plan.name.toLowerCase() === "free"
  );
}

function getCheckoutErrorMessage(error: unknown) {
  if (isAxiosError<{ detail?: string; error?: string; message?: string }>(error)) {
    const data = error.response?.data;
    return (
      data?.detail ||
      data?.error ||
      data?.message ||
      "Failed to start the subscription flow. Please try again."
    );
  }

  return "Failed to start the subscription flow. Please try again.";
}

async function redirectToStripeOnboarding() {
  await createStripeConnectAccount();
  const onboardingLink = await createStripeConnectOnboardingLink({
    refresh_url: `${window.location.origin}/dashboard`,
  });

  if (!onboardingLink.url) {
    throw new Error("Stripe onboarding response did not include a URL.");
  }

  window.location.assign(onboardingLink.url);
}

async function redirectToSubscriptionCheckout(planId: number) {
  const checkout = await createPlanPurchaseCheckout(planId);
  const checkoutUrl = checkout.checkout_url || checkout.redirect_url;

  if (!checkoutUrl) {
    throw new Error("Checkout response did not include a checkout URL.");
  }

  window.location.assign(checkoutUrl);
}

export default function AccountPlans() {
  const [currentPlanId, setCurrentPlanId] = useState("starter");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutPlanId, setCheckoutPlanId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const savedPlan = localStorage.getItem("currentPlanId");
    if (savedPlan) {
      setCurrentPlanId(savedPlan);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchPlans = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const data = await getPlans();

        if (isMounted) {
          setPlans(data.results);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
        if (isMounted) {
          setErrorMessage("Failed to load plans.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPlans();

    return () => {
      isMounted = false;
    };
  }, []);

  const choosePlan = async (plan: Plan) => {
    if (isFreePlan(plan)) {
      return;
    }

    try {
      setCheckoutPlanId(plan.id);
      setErrorMessage("");
      const profile = await getUserProfile();

      if (!profile.is_stripe_connect_connected) {
        await showInfo(
          "First you need to connect your Stripe account before subscribing.",
          "Connect Stripe first"
        );
        await redirectToStripeOnboarding();
        return;
      }

      await redirectToSubscriptionCheckout(plan.id);
    } catch (error) {
      console.error("Error starting subscription flow:", error);
      const message = getCheckoutErrorMessage(error);
      setErrorMessage(message);
      await showError(message);
    } finally {
      setCheckoutPlanId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/account-settings"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">All Plans</h1>
          <p className="text-slate-500 text-sm">Choose a plan based on the current backend pricing</p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 justify-items-center">
        {loading ? (
          <div className="col-span-full py-12 text-sm font-medium text-slate-500">
            Loading plans...
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-full rounded-xl border border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-500 shadow-sm">
            No plans available
          </div>
        ) : (
          plans.map((plan) => {
            const isCurrent = planStorageKeys(plan).includes(currentPlanId.toLowerCase());
            const popular = isPopularPlan(plan);
            const freePlan = isFreePlan(plan);
            const features =
              plan.features.length > 0 ? plan.features : [plan.description || `${plan.name} Plan`];
            const limits = planLimitLabels.map((limit) => ({
              ...limit,
              value: plan.limits[limit.key],
            }));

            return (
              <div
                key={plan.id}
                className={`w-full max-w-[300px] rounded-2xl border p-6 flex flex-col ${
                  popular
                    ? "bg-gradient-to-b from-cyan-400 to-teal-400 text-white border-transparent shadow-xl"
                    : isCurrent
                    ? "bg-cyan-50 border-cyan-200"
                    : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                {popular && (
                  <span className="inline-flex w-fit mb-3 px-2 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-amber-300 text-amber-900">
                    Most Popular
                  </span>
                )}

                <div className="flex items-center gap-2 mb-1">
                  <Crown className={`w-4 h-4 ${popular ? "text-cyan-100" : "text-cyan-500"}`} />
                  <h2 className={`text-lg font-bold ${popular ? "text-white" : "text-slate-900"}`}>
                    {plan.name}
                  </h2>
                </div>
                <p className={`text-xs mb-4 ${popular ? "text-cyan-100" : "text-slate-500"}`}>
                  {plan.description || plan.plan_type}
                </p>

                <div className={`mb-5 ${popular ? "text-white" : "text-slate-900"}`}>
                  <span className="text-4xl font-extrabold">{formatPlanPrice(plan.price)}</span>
                  <span className={`${popular ? "text-cyan-100" : "text-slate-500"}`}>/month</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {features.map((feature, index) => (
                    <li
                      key={index}
                      className={`flex items-start gap-2 text-xs ${popular ? "text-white" : "text-slate-600"}`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${popular ? "text-cyan-100" : "text-emerald-500"}`} />
                      {formatPlanLabel(feature)}
                    </li>
                  ))}
                </ul>

                <div className={`mb-6 rounded-lg border p-3 ${
                  popular
                    ? "border-white/30 bg-white/10"
                    : "border-slate-200 bg-slate-50"
                }`}>
                  <p className={`mb-2 text-[11px] font-bold uppercase ${
                    popular ? "text-cyan-50" : "text-slate-500"
                  }`}>
                    Limits
                  </p>
                  <div className="space-y-1.5">
                    {limits.map((limit) => (
                      <div
                        key={limit.key}
                        className={`flex items-center justify-between gap-3 text-xs ${
                          popular ? "text-white" : "text-slate-600"
                        }`}
                      >
                        <span>{limit.label}</span>
                        <span className={`font-bold ${
                          popular ? "text-white" : "text-slate-900"
                        }`}>
                          {formatLimitValue(limit.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {isCurrent ? (
                  <button
                    className="mt-auto w-full py-2.5 rounded-lg text-xs font-bold bg-slate-200 text-slate-700 cursor-default"
                    disabled
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => choosePlan(plan)}
                    disabled={freePlan || checkoutPlanId !== null}
                    className={`mt-auto w-full py-2.5 rounded-lg text-xs font-bold transition-colors ${
                      freePlan || checkoutPlanId !== null
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : popular
                        ? "bg-white text-cyan-600 hover:bg-slate-50"
                        : "bg-cyan-500 text-white hover:bg-cyan-600"
                    }`}
                  >
                    {checkoutPlanId === plan.id
                      ? "Starting..."
                      : freePlan
                      ? "Free Plan"
                      : "Subscribe"}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

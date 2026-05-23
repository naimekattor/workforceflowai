"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Crown } from "lucide-react";
import Link from "next/link";
import { createPlanPurchaseCheckout, getPlans, Plan } from "@/lib/api/plans";
import { formatCurrency } from "@/lib/invoices";

function formatPlanPrice(price: string) {
  const amount = Number.parseFloat(price);
  return formatCurrency(Number.isNaN(amount) ? 0 : amount);
}

function isPopularPlan(plan: Plan) {
  return plan.plan_type.toLowerCase() === "professional";
}

function planStorageKeys(plan: Plan) {
  return [String(plan.id), plan.plan_type.toLowerCase(), plan.name.toLowerCase()];
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
    try {
      setCheckoutPlanId(plan.id);
      setErrorMessage("");
      const checkout = await createPlanPurchaseCheckout(plan.id);

      if (!checkout.redirect_url) {
        throw new Error("Checkout response did not include a redirect URL.");
      }

      localStorage.setItem("currentPlanId", String(plan.id));
      setCurrentPlanId(String(plan.id));
      window.location.href = checkout.redirect_url;
    } catch (error) {
      console.error("Error creating plan checkout:", error);
      setErrorMessage("Failed to start checkout. Please try again.");
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
            const features =
              plan.features.length > 0 ? plan.features : [plan.description || `${plan.name} Plan`];

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
                      {feature}
                    </li>
                  ))}
                </ul>

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
                    disabled={!plan.is_active || checkoutPlanId !== null}
                    className={`mt-auto w-full py-2.5 rounded-lg text-xs font-bold transition-colors ${
                      !plan.is_active || checkoutPlanId !== null
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : popular
                        ? "bg-white text-cyan-600 hover:bg-slate-50"
                        : "bg-cyan-500 text-white hover:bg-cyan-600"
                    }`}
                  >
                    {checkoutPlanId === plan.id
                      ? "Opening checkout..."
                      : plan.is_active
                      ? `Upgrade to ${plan.name}`
                      : "Unavailable"}
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

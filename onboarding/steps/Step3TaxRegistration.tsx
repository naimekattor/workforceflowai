"use client";

/**
 * Step 3 – Tax & Registration
 *
 * One shared component for all business types.
 * The sole-trader route (`/onboarding/step-3/sole-trader`) defaults
 * `vatRegistered` to true; the limited-company route defaults to false.
 * Both point here — we read businessType from context to set back-navigation.
 */

import React from "react";
import { useRouter } from "next/navigation";
import OnboardingLayout from "../context/OnboardingLayout";
import {
  OnboardingCard,
  CardBody,
  CardFooter,
  SectionBox,
  ToggleRow,
  SelectField,
  Field,
  InfoBanner,
} from "../components/OnboardingUI";
import { useOnboarding, getStep2Route } from "../context/OnboardingContext";

export default function Step3TaxRegistration() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  return (
    <OnboardingLayout currentStep={3}>
      <OnboardingCard>
        <CardBody
          title="Tax & Registration"
          description="Configure your tax registrations and accounting method."
        >
          <div className="space-y-4 sm:space-y-5">
            {/* VAT ─────────────────────────────────────────────────────────── */}
            <SectionBox title="VAT Registration">
              <ToggleRow
                label="VAT Registered"
                checked={data.vatRegistered}
                onChange={(v) => {
                  update("vatRegistered", v);
                  if (!v) {
                    update("vatNumber", "");
                    update("vatScheme", "standard");
                  }
                }}
              />
              {data.vatRegistered && (
                <>
                  <Field
                    label="VAT Number"
                    placeholder="Enter VAT Number"
                    value={data.vatNumber}
                    onChange={(e) => update("vatNumber", e.target.value)}
                  />
                  <SelectField
                    label="VAT Scheme"
                    value={data.vatScheme}
                    onChange={(e) =>
                      update(
                        "vatScheme",
                        e.target.value as typeof data.vatScheme,
                      )
                    }
                    options={[
                      { value: "standard", label: "Standard VAT" },
                      { value: "flat_rate", label: "Flat Rate Scheme" },
                    ]}
                  />
                </>
              )}
            </SectionBox>

            {/* CIS ─────────────────────────────────────────────────────────── */}
            <SectionBox title="CIS (Construction Industry Scheme)">
              <ToggleRow
                label="CIS Registered"
                checked={data.cisRegistered}
                onChange={(v) => update("cisRegistered", v)}
              />
              {data.cisRegistered && (
                <SelectField
                  label="CIS Role"
                  value={data.cisRole}
                  onChange={(e) =>
                    update("cisRole", e.target.value as typeof data.cisRole)
                  }
                  options={[
                    { value: "contractor", label: "Contractor" },
                    { value: "subcontractor", label: "Subcontractor" },
                    { value: "both", label: "Both" },
                  ]}
                />
              )}
            </SectionBox>

            {/* PAYE ────────────────────────────────────────────────────────── */}
            <SectionBox title="PAYE (Pay As You Earn)">
              <ToggleRow
                label="PAYE Registered"
                checked={data.payeRegistered}
                onChange={(v) => update("payeRegistered", v)}
              />
              {/* {data.payeRegistered && (
                <SelectField
                  label="Accounting Basis"
                  value={data.payeAccountingBasis}
                  onChange={e => update('payeAccountingBasis', e.target.value as typeof data.payeAccountingBasis)}
                  options={[
                    { value: 'cash', label: 'Cash Basis' },
                    { value: 'accrual', label: 'Accrual Basis' },
                  ]}
                />
              )} */}
            </SectionBox>

            {/* Accounting Method ───────────────────────────────────────────── */}
            <SectionBox title="Accounting Method">
              <SelectField
                value={data.accountingMethod}
                onChange={(e) =>
                  update(
                    "accountingMethod",
                    e.target.value as typeof data.accountingMethod,
                  )
                }
                options={[
                  { value: "cash", label: "Cash Basis" },
                  { value: "accrual", label: "Accrual Basis" },
                ]}
              />
            </SectionBox>

            <InfoBanner>
              <strong>Coming soon:</strong> Real-time validation via Companies
              House and HMRC APIs will be available in a future update.
            </InfoBanner>
          </div>
        </CardBody>

        <CardFooter
          step={3}
          onPrev={() => router.push(getStep2Route(data.businessType))}
          onNext={() => router.push("/onboarding/step-4")}
        />
      </OnboardingCard>
    </OnboardingLayout>
  );
}

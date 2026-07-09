import Image from "next/image";
import {
  Briefcase,
  CalendarDays,
  ReceiptText,
  StickyNote,
  User,
} from "lucide-react";
import { getPublicQuote } from "@/lib/api/public-quotes";
import { formatCurrency } from "@/lib/invoices";
import QuoteDecisionButtons from "./QuoteDecisionButtons";
import QuotePaymentStatusModal from "./QuotePaymentStatusModal";
import Link from "next/link";

export const dynamic = "force-dynamic";

type PublicQuotePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string | string[] }>;
};

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-GB");
}

function formatDateTime(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

function parseAmount(value?: string) {
  const amount = Number.parseFloat(value || "0");
  return Number.isNaN(amount) ? 0 : amount;
}

function getSearchParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function DetailRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div>
      <p className="mb-1 text-[13px] text-slate-500">{label}</p>
      <p
        className={`text-[14px] font-medium ${
          muted ? "text-slate-500" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="mb-3 h-4 w-4 text-slate-400" />
      <DetailRow label={label} value={value} />
    </div>
  );
}

function PublicQuoteError({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link href="/">
          <Image
            src="/images/workforceflowailogo2.png"
            alt="WorkforceFlow AI"
            width={210}
            height={80}
            className="h-auto w-52 object-contain"
            priority
          />
        </Link>

        <div className="rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <h1 className="mb-2 text-xl font-bold text-slate-900">
            Quote unavailable
          </h1>
          <p className="text-sm leading-6 text-slate-600">{message}</p>
        </div>
      </div>
    </main>
  );
}

export default async function PublicQuotePage({
  params,
  searchParams,
}: PublicQuotePageProps) {
  const { id } = await params;
  const { status } = await searchParams;
  const result = await getPublicQuote(id);

  console.log("Result:", result);

  if (!result.ok) {
    const message =
      result.status === 401
        ? "This quote link is not available for public viewing yet. Please contact the sender."
        : result.message;

    return <PublicQuoteError message={message} />;
  }

  const { quote } = result;
  console.log("Fetched quote:", quote);
  const customerLabel = quote.customer_name || "Customer";
  const totalAmount = parseAmount(quote.total_price || quote.price);
  const paymentStatus = getSearchParamValue(status);

  let paymentStyleLabel: React.ReactNode = "Not provided";
  if (quote.payment_style === "On_Completion") {
    paymentStyleLabel = "On Completion";
  } else if (quote.payment_style === "Advance") {
    paymentStyleLabel = "Advance";
  } else if (quote.payment_style === "Split") {
    const percentage = quote.split_percentage ? parseFloat(quote.split_percentage.toString()) : 0;
    if (percentage > 0 && percentage < 100) {
      const advanceAmount = totalAmount * (percentage / 100);
      const remainingAmount = totalAmount * ((100 - percentage) / 100);
      paymentStyleLabel = (
        <div>
          <div>Split ({percentage}%)</div>
          <div className="mt-2 space-y-1 text-xs text-slate-500">
            <div>Advance Payment ({percentage}%): <span className="font-bold text-slate-700">{formatCurrency(advanceAmount)}</span></div>
            <div>Remaining Balance ({100 - percentage}%): <span className="font-bold text-slate-700">{formatCurrency(remainingAmount)}</span></div>
          </div>
        </div>
      );
    } else {
      paymentStyleLabel = `Split (${percentage}%)`;
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-6 sm:px-6 lg:py-10">
      <QuotePaymentStatusModal status={paymentStatus} />
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="mb-8 flex">
          <Image
            src="/images/workforceflowailogo2.png"
            alt="WorkforceFlow AI"
            width={220}
            height={85}
            className="h-auto w-52 object-contain"
            priority
          />
        </Link>

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-500">
                Quote for {customerLabel}
              </p>
              <h1 className="mb-3 text-3xl font-bold tracking-normal text-slate-900 sm:text-4xl">
                {quote.invoice_number}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                Please review the quote details below. If everything looks
                correct, you can accept or reject it here.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-[#f8fafc] p-5 lg:min-w-72">
              <p className="mb-1 text-[13px] text-slate-500">Total</p>
              <p className="mb-4 text-3xl font-bold text-slate-900">
                {totalAmount > 0 ? formatCurrency(totalAmount) : "-"}
              </p>
              <QuoteDecisionButtons
                quoteId={quote.id}
                quoteStatus={quote.quote_status}
              />
            </div>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            icon={CalendarDays}
            label="Quote Date"
            value={formatDate(quote.quote_date)}
          />
          <SummaryCard
            icon={CalendarDays}
            label="Valid Until"
            value={formatDate(quote.valid_until)}
          />
          <SummaryCard
            icon={Briefcase}
            label="Job Title"
            value={quote.job_details?.title || quote.job_type || "No job"}
          />
        </section>

        <section className={`mb-6 grid grid-cols-1 gap-6 ${quote.job_details ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-slate-400" />
              <h2 className="text-lg font-bold text-slate-900">
                Quote Information
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <DetailRow label="Quote Number" value={quote.invoice_number} />
              <DetailRow
                label="Created"
                value={formatDateTime(quote.created_at)}
              />
              <DetailRow
                label="Updated"
                value={formatDateTime(quote.updated_at)}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              <h2 className="text-lg font-bold text-slate-900">Customer</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <DetailRow label="Customer" value={customerLabel} />
              <DetailRow
                label="Email"
                value={quote.customer_email || "Not provided"}
                muted={!quote.customer_email}
              />
            </div>
          </div>

          {quote.job_details && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-900">Job Details</h2>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <DetailRow label="Job Title" value={quote.job_details.title || "Not provided"} />
                <DetailRow label="Status" value={quote.job_details.jobstatus || "Not provided"} />
                <div className="sm:col-span-2">
                  <DetailRow label="Site Address" value={quote.job_details.site_address || "Not provided"} />
                </div>
                <div className="sm:col-span-2">
                  <DetailRow label="Job Description" value={quote.job_details.notes || "No description provided."} />
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-900">
              Notes & Payment
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <DetailRow
              label="Payment Terms"
              value={paymentStyleLabel}
            />
            
            <DetailRow
              label="Notes"
              value={quote.notes || "No notes added."}
              muted={!quote.notes}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

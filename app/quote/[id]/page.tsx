import Image from "next/image";
import {
  Briefcase,
  CalendarDays,
  ReceiptText,
  StickyNote,
  User,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPublicCustomer, getPublicQuote } from "@/lib/api/public-quotes";
import { formatCurrency } from "@/lib/invoices";
import QuoteDecisionButtons from "./QuoteDecisionButtons";

export const dynamic = "force-dynamic";

type PublicQuotePageProps = {
  params: Promise<{ id: string }>;
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
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/workforceflowailogo1.png"
            alt="WorkforceFlow AI"
            width={210}
            height={80}
            className="h-auto w-52 object-contain"
            priority
          />
        </div>

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
}: PublicQuotePageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const result = await getPublicQuote(id, session?.accessToken);

  if (!result.ok) {
    const message =
      result.status === 401
        ? "This quote link is not available for public viewing yet. Please contact the sender."
        : result.message;

    return <PublicQuoteError message={message} />;
  }

  const { quote } = result;
  const customerResult = await getPublicCustomer(
    quote.customer,
    session?.accessToken
  );
  const customer = customerResult.ok ? customerResult.customer : null;
  const customerLabel =
    customer?.customer_name || quote.customer_name || "Customer";
  const totalAmount = parseAmount(quote.total_price || quote.price);

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-6 sm:px-6 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex">
          <Image
            src="/images/workforceflowailogo1.png"
            alt="WorkforceFlow AI"
            width={220}
            height={85}
            className="h-auto w-52 object-contain"
            priority
          />
        </header>

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
              <QuoteDecisionButtons quoteId={quote.id} />
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
            label="Job Type"
            value={quote.job_type || "No job"}
          />
        </section>

        <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-slate-400" />
              <h2 className="text-lg font-bold text-slate-900">
                Quote Information
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <DetailRow label="Quote Number" value={quote.invoice_number} />
              <DetailRow label="Job Type" value={quote.job_type || "No job"} />
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
                value={customer?.customer_email || "Not provided"}
                muted={!customer?.customer_email}
              />
              <DetailRow label="Quote Date" value={formatDate(quote.quote_date)} />
              <DetailRow
                label="Valid Until"
                value={formatDate(quote.valid_until)}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-900">
              Notes & Payment
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <DetailRow
              label="Payment Note"
              value={quote.payment_note || "No payment note added."}
              muted={!quote.payment_note}
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

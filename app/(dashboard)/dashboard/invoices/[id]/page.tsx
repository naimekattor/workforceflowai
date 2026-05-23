"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Customer, getCustomer } from "@/lib/api/customers";
import { getRecentInvoices, RecentInvoice } from "@/lib/api/dashboard";
import { formatCurrency } from "@/lib/invoices";

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-GB");
}

function formatDateTime(value?: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

function toAmount(value?: string | number) {
  const amount = Number(value || 0);
  return Number.isNaN(amount) ? 0 : amount;
}

function getStatusClassName(status: string) {
  if (status === "Accepted") return "bg-emerald-100 text-emerald-700";
  if (status === "Sent") return "bg-blue-100 text-blue-700";
  if (status === "Rejected") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
}

export default function InvoiceDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const [invoice, setInvoice] = useState<RecentInvoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!session?.accessToken) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        setCustomer(null);

        const invoices = await getRecentInvoices();
        const matchedInvoice =
          invoices.find((item) => String(item.id) === id) || null;

        if (!isMounted) {
          return;
        }

        setInvoice(matchedInvoice);

        if (matchedInvoice) {
          try {
            const customerData = await getCustomer(matchedInvoice.customer);
            if (isMounted) {
              setCustomer(customerData);
            }
          } catch (customerError) {
            console.error("Error fetching invoice customer:", customerError);
          }
        }
      } catch (error) {
        console.error("Error fetching invoice details:", error);
        if (isMounted) {
          setErrorMessage("Failed to load invoice.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInvoice();

    return () => {
      isMounted = false;
    };
  }, [id, session?.accessToken, status]);

  const handleDownload = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center text-sm font-medium text-slate-500">
        Loading invoice...
      </div>
    );
  }

  if (errorMessage || !invoice) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Invoice not found
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            {errorMessage || "The requested invoice does not exist."}
          </p>
          <Link
            href="/dashboard/invoices"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#22d3ee] hover:text-[#06b6d4]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  const total = toAmount(invoice.total_price);
  const subtotal = total;
  const vatTotal = 0;
  const customerName = customer?.customer_name || `Customer ${invoice.customer}`;
  const customerAddress =
    customer?.billing_address || customer?.site_address || "Address not provided";

  return (
    <div className="max-w-5xl mx-auto">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }

          #invoice-print-area,
          #invoice-print-area * {
            visibility: visible;
          }

          #invoice-print-area {
            position: absolute;
            inset: 0 auto auto 0;
            width: 100%;
            border: 0 !important;
            box-shadow: none !important;
          }

          @page {
            size: A4 portrait;
            margin: 16mm;
          }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/invoices"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {invoice.invoice_number}
            </h1>
            <p className="text-xs text-slate-500">
              Created {formatDateTime(invoice.created_at)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-2 bg-[#22d3ee] hover:bg-[#06b6d4] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      <div
        id="invoice-print-area"
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-8"
      >
        <div className="flex items-start justify-between gap-8 mb-10 border-b border-slate-100 pb-6">
          <div>
            <p className="text-xs font-bold text-slate-500 mb-2">Revboost AI</p>
            <h2 className="text-3xl font-bold text-slate-900">TAX INVOICE</h2>
          </div>

          <div className="text-right">
            <p className="text-xl font-bold text-[#22d3ee]">revboostai</p>
            <span className={`mt-3 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${getStatusClassName(invoice.quote_status)}`}>
              {invoice.quote_status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">
              Bill To
            </p>
            <p className="text-sm font-bold text-slate-900">{customerName}</p>
            {customer?.customer_email && (
              <p className="text-sm text-slate-600">{customer.customer_email}</p>
            )}
            {customer?.phone_number && (
              <p className="text-sm text-slate-600">{customer.phone_number}</p>
            )}
            <p className="text-sm text-slate-600 whitespace-pre-line">
              {customerAddress}
            </p>
          </div>

          <div className="text-sm text-slate-700 space-y-1 md:text-right">
            <p>
              <span className="font-semibold">Invoice Date:</span>{" "}
              {formatDate(invoice.created_at)}
            </p>
            <p>
              <span className="font-semibold">Invoice Number:</span>{" "}
              {invoice.invoice_number}
            </p>
            <p>
              <span className="font-semibold">Reference:</span>{" "}
              {invoice.quote_uuid}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm border border-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-3 py-2 border-b border-slate-200">Description</th>
                <th className="text-right px-3 py-2 border-b border-slate-200">Quantity</th>
                <th className="text-right px-3 py-2 border-b border-slate-200">Unit Price</th>
                <th className="text-right px-3 py-2 border-b border-slate-200">VAT</th>
                <th className="text-right px-3 py-2 border-b border-slate-200">Amount GBP</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 border-b border-slate-200">
                  Invoice generated from accepted quote
                </td>
                <td className="px-3 py-2 text-right border-b border-slate-200">1.00</td>
                <td className="px-3 py-2 text-right border-b border-slate-200">
                  {formatCurrency(subtotal)}
                </td>
                <td className="px-3 py-2 text-right border-b border-slate-200">0%</td>
                <td className="px-3 py-2 text-right border-b border-slate-200">
                  {formatCurrency(subtotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="ml-auto w-full max-w-xs text-sm space-y-2 mb-10">
          <div className="flex justify-between">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">TOTAL VAT</span>
            <span className="font-medium">{formatCurrency(vatTotal)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2">
            <span className="font-bold">TOTAL GBP</span>
            <span className="font-bold">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="text-xs text-slate-600">
          <p>
            <span className="font-semibold">Quote UUID:</span>{" "}
            {invoice.quote_uuid}
          </p>
          <p className="mt-1">
            <span className="font-semibold">Created:</span>{" "}
            {formatDateTime(invoice.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createPublicQuoteCheckout } from "@/lib/api/public-quotes";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { detail: "Invalid request body." },
      { status: 400 }
    );
  }

  const quoteId =
    typeof body === "object" && body !== null && "quote_id" in body
      ? body.quote_id
      : null;

  if (
    (typeof quoteId !== "string" && typeof quoteId !== "number") ||
    String(quoteId).trim().length === 0
  ) {
    return NextResponse.json(
      { detail: "quote_id is required." },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);
  const result = await createPublicQuoteCheckout(
    quoteId,
    session?.accessToken
  );

  if (!result.ok) {
    return NextResponse.json(
      { detail: result.message },
      { status: result.status }
    );
  }

  return NextResponse.json({ checkout_url: result.checkout_url });
}

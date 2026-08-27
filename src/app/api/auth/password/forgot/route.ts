import { NextResponse, type NextRequest } from "next/server";

import { forgotPassword } from "@/features/auth/gateway";
import { forgotPasswordSchema } from "@/features/auth/schemas";

export const dynamic = "force-dynamic";

/**
 * Request a password-reset link. Always answers 202 for any well-formed email,
 * whether or not it has an account — any variation would make this an
 * account-enumeration oracle. A gateway fault is logged server-side but still
 * answered 202 for the same reason.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const parsed = forgotPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 400 });

  try {
    await forgotPassword(parsed.data.email);
  } catch (error) {
    console.error("forgot-password request failed at the gateway", error);
  }
  return new NextResponse(null, { status: 202 });
}

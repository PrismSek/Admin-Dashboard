import { NextResponse, type NextRequest } from "next/server";

import { resetPassword } from "@/features/auth/gateway";
import { resetRequestSchema } from "@/features/auth/schemas";

export const dynamic = "force-dynamic";

/** Maps the gateway's reset outcome onto the HTTP status the client expects. */
const STATUS = { ok: 200, "invalid-token": 401, "weak-password": 422 } as const;

/**
 * Set a password from an emailed link. The token in the body is the credential;
 * a weak password is reported (422) without consuming the link, so one typo
 * does not lock the user out.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const parsed = resetRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 400 });

  let outcome;
  try {
    outcome = await resetPassword(parsed.data.token, parsed.data.password);
  } catch (error) {
    console.error("password reset failed at the gateway", error);
    return new NextResponse(null, { status: 502 });
  }
  return new NextResponse(null, { status: STATUS[outcome] });
}

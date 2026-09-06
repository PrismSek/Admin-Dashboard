import { NextResponse, type NextRequest } from "next/server";

import { acceptInvite } from "@/features/auth/gateway";
import { acceptInviteRequestSchema } from "@/features/auth/schemas";

export const dynamic = "force-dynamic";

/**
 * Redeem an invitation and create the invitee's account. The token in the body
 * is the credential; the gateway returns a single 400 for an invalid, expired,
 * used, or too-short-password request, which we pass straight back so the client
 * shows one "link no longer valid" message rather than probing the difference.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const parsed = acceptInviteRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 400 });

  let outcome;
  try {
    outcome = await acceptInvite(parsed.data.token, parsed.data.name, parsed.data.password);
  } catch (error) {
    console.error("invitation accept failed at the gateway", error);
    return new NextResponse(null, { status: 502 });
  }
  return new NextResponse(null, { status: outcome === "ok" ? 201 : 400 });
}

import { NextResponse, type NextRequest } from "next/server";

import { NONCE_COOKIE } from "@/features/auth/google/constants";
import { constantTimeEqual } from "@/features/auth/google/crypto";
import { sessionPayloadSchema } from "@/features/auth/google/schema";
import { setSessionCookies } from "@/features/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const parsed = sessionPayloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  const { token, refresh, n } = parsed.data;

  const nonce = request.cookies.get(NONCE_COOKIE)?.value;
  if (!nonce || !constantTimeEqual(n, nonce)) {
    return new NextResponse(null, { status: 403 });
  }

  const res = new NextResponse(null, { status: 204 });
  setSessionCookies(res, { token, refreshToken: refresh });
  // Burn the single-use nonce.
  res.cookies.set(NONCE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}

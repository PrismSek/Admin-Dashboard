import { NextResponse, type NextRequest } from "next/server";

import { login } from "@/features/auth/gateway";
import { loginRequestSchema } from "@/features/auth/schemas";
import { setSessionCookies } from "@/features/auth/session";

export const dynamic = "force-dynamic";

/**
 * Email + password sign-in. The browser posts credentials here rather than to
 * the gateway so the access/refresh tokens land in httpOnly cookies the page
 * can never read. A wrong password and an unknown address both return 401 with
 * no body — the uniform failure the gateway is careful to preserve.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const parsed = loginRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 400 });

  let session;
  try {
    session = await login(parsed.data.email, parsed.data.password);
  } catch (error) {
    console.error("login failed at the gateway", error);
    return new NextResponse(null, { status: 502 });
  }
  if (!session) return new NextResponse(null, { status: 401 });

  const res = NextResponse.json({ user: session.user }, { status: 200 });
  setSessionCookies(res, session);
  return res;
}

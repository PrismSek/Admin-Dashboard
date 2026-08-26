const pw = await import(
  "file:///Users/ak/prismsek/Admin-Dashboard/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright/index.js"
);
const chromium = pw.default.chromium;

const BASE = process.env.BASE ?? "http://localhost:3117";
const b64url = (s) => Buffer.from(s).toString("base64url");
const jwt = (exp) => `${b64url("{}")}.${b64url(JSON.stringify({ exp }))}.sig`;

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

// 1. Start: capture the nonce the server sets (block the cross-origin hop to the gateway).
await ctx.route("**/v1/auth/google/start**", (route) => route.abort());
await page.goto(`${BASE}/api/auth/google/start`).catch(() => {});
const nonceCookie = (await ctx.cookies()).find((c) => c.name === "ps_oauth_nonce");
if (!nonceCookie) throw new Error("nonce cookie was not set by /start");
const nonce = nonceCookie.value;

// 2. Drive the callback with a synthetic success fragment.
await page.goto(`${BASE}/sign-in/callback?n=${nonce}#token=${jwt(9_999_999_999)}&refresh=r1`);
await page.waitForURL("**/dashboard", { timeout: 5000 });

// 3. Assert the session cookie landed and the nonce was burned.
const cookies = await ctx.cookies();
const session = cookies.find((c) => c.name === "ps_session");
if (!session) throw new Error("ps_session cookie was not set");
if (!session.httpOnly) throw new Error("ps_session must be HttpOnly");
console.log("E2E OK: landed on /dashboard with HttpOnly ps_session");

await browser.close();

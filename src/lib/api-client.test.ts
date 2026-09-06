import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiErrorStatus, apiFetch, apiFetchWithEtag } from "@/lib/api-client";

const cookiesMock = vi.fn();
vi.mock("next/headers", () => ({ cookies: () => cookiesMock() }));

// redirect() throws NEXT_REDIRECT in real Next; model that so callers unwind.
const redirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});
vi.mock("next/navigation", () => ({ redirect: (url: string) => redirectMock(url) }));

function response(status: number, body?: unknown, headers: Record<string, string> = {}): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
    headers: { get: (name: string) => headers[name.toLowerCase()] ?? null },
  } as unknown as Response;
}

/** A `cookies()` store carrying (or missing) the session cookie. */
function store(token?: string) {
  return { get: (name: string) => (name === "ps_session" && token ? { value: token } : undefined) };
}

const fetchMock = vi.fn();

describe("apiFetch", () => {
  const prev = process.env.GATEWAY_ORIGIN;
  beforeEach(() => {
    process.env.GATEWAY_ORIGIN = "https://gw.example/";
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    cookiesMock.mockReset();
    redirectMock.mockClear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.GATEWAY_ORIGIN = prev;
  });

  it("sends the session cookie as a Bearer token and returns parsed JSON", async () => {
    cookiesMock.mockResolvedValue(store("jwt-123"));
    fetchMock.mockResolvedValue(response(200, { users: [] }));

    const body = await apiFetch("/v1/users");

    expect(body).toEqual({ users: [] });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://gw.example/v1/users");
    expect(init.method).toBe("GET");
    expect(init.headers.authorization).toBe("Bearer jwt-123");
  });

  it("appends defined search params and omits empty ones", async () => {
    cookiesMock.mockResolvedValue(store("jwt-123"));
    fetchMock.mockResolvedValue(response(200, {}));

    await apiFetch("/v1/users", {
      searchParams: { q: "amara", role: undefined, status: "", page: "2" },
    });

    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.searchParams.get("q")).toBe("amara");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.has("role")).toBe(false);
    expect(url.searchParams.has("status")).toBe(false);
  });

  it("redirects to sign-in when there is no session cookie", async () => {
    cookiesMock.mockResolvedValue(store(undefined));

    await expect(apiFetch("/v1/users")).rejects.toThrow("REDIRECT:/sign-in");
    expect(redirectMock).toHaveBeenCalledWith("/sign-in");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("redirects to sign-in when the gateway rejects the token (401)", async () => {
    cookiesMock.mockResolvedValue(store("stale"));
    fetchMock.mockResolvedValue(response(401));

    await expect(apiFetch("/v1/users")).rejects.toThrow("REDIRECT:/sign-in");
    expect(redirectMock).toHaveBeenCalledWith("/sign-in");
  });

  it("throws an ApiError carrying the status on any other non-ok response", async () => {
    cookiesMock.mockResolvedValue(store("jwt-123"));
    fetchMock.mockResolvedValue(response(500));

    await expect(apiFetch("/v1/users")).rejects.toBeInstanceOf(ApiError);
    await expect(apiFetch("/v1/users")).rejects.toMatchObject({ status: 500 });
  });

  it("serializes a JSON body and sets content-type for writes", async () => {
    cookiesMock.mockResolvedValue(store("jwt-123"));
    fetchMock.mockResolvedValue(response(200, { ok: true }));

    await apiFetch("/v1/invites", { method: "POST", body: { email: "a@b.co", role: "analyst" } });

    const init = fetchMock.mock.calls[0][1];
    expect(init.method).toBe("POST");
    expect(init.headers["content-type"]).toBe("application/json");
    expect(JSON.parse(init.body)).toEqual({ email: "a@b.co", role: "analyst" });
  });

  it("merges caller headers (e.g. If-Match) alongside the auth header", async () => {
    cookiesMock.mockResolvedValue(store("jwt-123"));
    fetchMock.mockResolvedValue(response(200, {}));

    await apiFetch("/v1/policies/p1/enforce", { method: "POST", headers: { "if-match": '"v3"' } });

    const init = fetchMock.mock.calls[0][1];
    expect(init.headers.authorization).toBe("Bearer jwt-123");
    expect(init.headers["if-match"]).toBe('"v3"');
  });
});

describe("apiFetchWithEtag", () => {
  const prev = process.env.GATEWAY_ORIGIN;
  beforeEach(() => {
    process.env.GATEWAY_ORIGIN = "https://gw.example/";
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    cookiesMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.GATEWAY_ORIGIN = prev;
  });

  it("returns the parsed body and the ETag response header", async () => {
    cookiesMock.mockResolvedValue(store("jwt-123"));
    fetchMock.mockResolvedValue(response(200, { id: "p1" }, { etag: '"v7"' }));

    const { data, etag } = await apiFetchWithEtag("/v1/policies/p1");

    expect(data).toEqual({ id: "p1" });
    expect(etag).toBe('"v7"');
  });

  it("returns a null etag when the response carries no ETag", async () => {
    cookiesMock.mockResolvedValue(store("jwt-123"));
    fetchMock.mockResolvedValue(response(200, { id: "p1" }));

    const { etag } = await apiFetchWithEtag("/v1/policies/p1");
    expect(etag).toBeNull();
  });
});

describe("apiErrorStatus", () => {
  it("returns the status of an ApiError", () => {
    expect(apiErrorStatus(new ApiError(404, "missing"))).toBe(404);
    expect(apiErrorStatus(new ApiError(409, "conflict"))).toBe(409);
  });

  it("reads structurally, across a foreign ApiError-shaped error", () => {
    // A different class instance with the same shape (e.g. re-imported across a
    // module realm) is still recognised — the check is by shape, not identity.
    const foreign = Object.assign(new Error("x"), { name: "ApiError", status: 403 });
    expect(apiErrorStatus(foreign)).toBe(403);
  });

  it("returns undefined for anything that is not an ApiError", () => {
    expect(apiErrorStatus(new Error("plain"))).toBeUndefined();
    expect(apiErrorStatus({ status: 500 })).toBeUndefined();
    expect(apiErrorStatus(undefined)).toBeUndefined();
    expect(apiErrorStatus("nope")).toBeUndefined();
  });
});

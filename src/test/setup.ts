import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// `serverEnv()` validates the whole contract on every call, so any test that
// exercises a code path touching it needs the required secrets present. Provide
// a baseline the same way a `.env.test` would; individual tests still override.
process.env.USER_COOKIE_SECRET ??= "test-user-cookie-secret-at-least-32-chars";

afterEach(cleanup);

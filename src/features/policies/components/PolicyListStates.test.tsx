// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { PolicyListError } from "@/features/policies/components/PolicyListError";
import { PolicyListSkeleton } from "@/features/policies/components/PolicyListSkeleton";
import { policyListContent } from "@/features/policies/content";

describe("PolicyListSkeleton", () => {
  it("renders a table-shaped loading status with eight placeholder rows", async () => {
    const { container } = render(<PolicyListSkeleton />);

    expect(screen.getByRole("status", { name: policyListContent.loading })).toBeVisible();
    expect(screen.getAllByTestId("policy-skeleton-row")).toHaveLength(8);

    expect((await axe(container)).violations).toEqual([]);
  });
});

describe("PolicyListError", () => {
  it("retries without exposing the thrown message", async () => {
    const retry = vi.fn();
    const { container } = render(<PolicyListError retry={retry} correlationId="POLICY-LOAD" />);

    expect(screen.getByText(policyListContent.error.title)).toBeVisible();
    expect(screen.getByText(policyListContent.error.correlationLabel("POLICY-LOAD"))).toBeVisible();
    expect(screen.queryByText(/stack|gateway/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: policyListContent.error.retry }));
    expect(retry).toHaveBeenCalledOnce();

    expect((await axe(container)).violations).toEqual([]);
  });
});

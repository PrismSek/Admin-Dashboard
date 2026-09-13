// @vitest-environment jsdom
import { zodResolver } from "@hookform/resolvers/zod";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { FormProvider, useForm } from "react-hook-form";

import { defaultPolicyAuthoringValues } from "@/features/policies/authoring-defaults";
import { PolicyConditionFields } from "@/features/policies/components/PolicyConditionFields";
import { policyAuthoringSchema, type PolicyAuthoringValues } from "@/features/policies/schemas";
import type { PolicyCatalogOption } from "@/features/policies/types";

const FINDINGS: readonly PolicyCatalogOption[] = [{ value: "aadhaar-number", label: "Aadhaar number" }];

/**
 * `PolicyConditionFields` is shared by all four channel editors and is only
 * ever mounted inside the full builder form in production, but exercising
 * its findings-required validation through `PolicyBuilder` would need a
 * submit affordance that doesn't exist yet (the Finish step is task 10).
 * This harness reproduces exactly the same `react-hook-form` + `zodResolver`
 * wiring `PolicyBuilder` uses, valid in every field except `content`, so
 * submitting surfaces only the findings-required error under test.
 */
function Harness() {
  const form = useForm<PolicyAuthoringValues>({
    resolver: zodResolver(policyAuthoringSchema),
    defaultValues: { ...defaultPolicyAuthoringValues, content: { mode: "specific", findingIds: [] } },
    mode: "onBlur",
    shouldUnregister: false,
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(() => {})} noValidate>
        <PolicyConditionFields findings={FINDINGS} />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

describe("PolicyConditionFields", () => {
  it("wires the findings-required error to the findings control via aria-describedby", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Submit" }));

    const errorText = await screen.findByText("Add at least one finding, or switch to Any content.");
    const findingsGroup = screen.getByRole("group", { name: "Finding" });
    expect(findingsGroup).toHaveAttribute("aria-describedby", errorText.id);
  });

  it("is axe-clean with the findings-required error showing", async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Submit" }));
    await screen.findByText("Add at least one finding, or switch to Any content.");

    expect((await axe(container)).violations).toEqual([]);
  });
});

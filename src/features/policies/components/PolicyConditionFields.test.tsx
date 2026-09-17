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

const FINDINGS: readonly PolicyCatalogOption[] = [
  { value: "aadhaar-number", label: "Aadhaar number" },
  { value: "customer-record", label: "Customer record" },
];
const CONFIDENCES: readonly PolicyCatalogOption[] = [
  { value: "High", label: "High confidence" },
  { value: "Medium", label: "Medium or better" },
  { value: "Low", label: "Any confidence" },
];

/**
 * `PolicyConditionFields` is shared by all four channel editors. This harness
 * reproduces the same `react-hook-form` + `zodResolver` wiring `PolicyBuilder`
 * uses and renders only the CONTENT block, so the findings-required error is
 * the only one with a control on screen to attach to (a blank `channel` would
 * suppress that rule entirely — it only applies once a channel is selected —
 * so the baseline pins `channel: "clipboard"`).
 */
function Harness() {
  const form = useForm<PolicyAuthoringValues>({
    resolver: zodResolver(policyAuthoringSchema),
    defaultValues: {
      ...defaultPolicyAuthoringValues,
      // The real default already carries one empty finding row in `allOf`;
      // pinning a channel makes the conditions-required rule apply here.
      channel: "clipboard",
    },
    mode: "onBlur",
    shouldUnregister: false,
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(() => {})} noValidate>
        <PolicyConditionFields findings={FINDINGS} confidences={CONFIDENCES} />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

describe("PolicyConditionFields", () => {
  it("wires the conditions-required error to the conditions control via aria-describedby", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Submit" }));

    const errorText = await screen.findByText("Add at least one condition, or switch to Any content.");
    const conditionsGroup = screen.getByRole("group", { name: "Content conditions" });
    expect(conditionsGroup).toHaveAttribute("aria-describedby", errorText.id);
  });

  it("picks a finding from the row's detector dropdown", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    // A fresh group shows one empty finding row: the detector is picked from a
    // dropdown (its accessible name is the "Select finding" placeholder, since
    // the "Finding" label sits separately as the pill's leading segment).
    const finding = screen.getByRole("combobox", { name: "Select finding" });
    await user.click(finding);
    await user.click(screen.getByRole("option", { name: "Aadhaar number" }));
    expect(finding).toHaveTextContent("Aadhaar number");
  });

  it("is axe-clean with the conditions-required error showing", async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Submit" }));
    await screen.findByText("Add at least one condition, or switch to Any content.");

    expect((await axe(container)).violations).toEqual([]);
  });
});

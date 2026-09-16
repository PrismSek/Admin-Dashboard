// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { PolicyStepRail } from "@/features/policies/components/PolicyStepRail";
import { defaultPolicyAuthoringValues } from "@/features/policies/authoring-defaults";
import { policyBuilderSteps } from "@/features/policies/content";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";

/** Provides the form context the rail reads, plus a stub section per stage so
 * the rail's scroll-to-section navigation has real targets. */
function Harness({ overrides }: { overrides?: Partial<PolicyAuthoringValues> }) {
  const form = useForm<PolicyAuthoringValues>({
    defaultValues: { ...defaultPolicyAuthoringValues, ...overrides },
  });
  return (
    <FormProvider {...form}>
      <PolicyStepRail />
      {policyBuilderSteps.map((step) => (
        <section key={step.id} id={`policy-${step.id}`}>
          {step.title}
        </section>
      ))}
    </FormProvider>
  );
}

/** The `<li>` for a stage, found via its rail link's accessible name. */
function stageItem(title: string): HTMLElement {
  const link = screen.getByRole("link", { name: new RegExp(`^${title}`) });
  const li = link.closest("li");
  if (!li) throw new Error(`no <li> for stage ${title}`);
  return li;
}

describe("PolicyStepRail", () => {
  it("greys every stage with unfilled required fields on a blank policy", () => {
    render(<Harness />);

    expect(stageItem("Start")).toHaveAttribute("data-complete", "false");
    expect(stageItem("Who")).toHaveAttribute("data-complete", "false");
    expect(stageItem("Where")).toHaveAttribute("data-complete", "false");
    expect(stageItem("Data")).toHaveAttribute("data-complete", "false");
    expect(stageItem("Enforcement")).toHaveAttribute("data-complete", "false");
    // Notification and Finish require nothing, so they read done from the start.
    expect(stageItem("End user Notification")).toHaveAttribute("data-complete", "true");
    expect(stageItem("Finish")).toHaveAttribute("data-complete", "true");
  });

  it("colours a stage once its required fields are filled", () => {
    render(<Harness overrides={{ name: "Block Aadhaar", appliesTo: "finance-all-stuff" }} />);

    expect(stageItem("Start")).toHaveAttribute("data-complete", "true");
    expect(stageItem("Who")).toHaveAttribute("data-complete", "true");
    // Still nothing chosen downstream.
    expect(stageItem("Where")).toHaveAttribute("data-complete", "false");
  });

  it("scrolls a stage's section to the top of the view when its rail item is clicked", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const section = document.getElementById("policy-where");
    if (!section) throw new Error("missing section");
    const scrollIntoView = vi.fn();
    section.scrollIntoView = scrollIntoView;

    await user.click(screen.getByRole("link", { name: /^Where/ }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });
});

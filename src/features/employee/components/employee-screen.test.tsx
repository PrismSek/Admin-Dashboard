// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { expect, it } from "vitest";

import { EmployeeScreen, SummaryRow } from "@/features/employee/components/employee-screen";

it("renders the eyebrow, title, intro, body and footer", async () => {
  const { container } = render(
    <EmployeeScreen
      eyebrow="Invitation from Northwind"
      title="Install PrismSek"
      intro="It takes about three minutes."
      footer="Step 1 of 3"
    >
      <SummaryRow label="Device" value="WKS-ATL-0142" />
    </EmployeeScreen>,
  );

  expect(screen.getByRole("heading", { level: 1, name: "Install PrismSek" })).toBeVisible();
  expect(screen.getByText("Invitation from Northwind")).toBeVisible();
  expect(screen.getByText("It takes about three minutes.")).toBeVisible();
  expect(screen.getByText("Device")).toBeVisible();
  expect(screen.getByText("WKS-ATL-0142")).toBeVisible();
  expect(screen.getByText("Step 1 of 3")).toBeVisible();
  expect((await axe(container)).violations).toEqual([]);
});

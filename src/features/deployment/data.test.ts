import { expect, it } from "vitest";

import { getAgentRelease, getCampaigns, getDeployStats, getUnprotected, stateLabel } from "@/features/deployment/data";

it("returns the campaigns, stats and agent release", async () => {
  expect(await getCampaigns()).toHaveLength(8);
  expect(await getDeployStats()).toHaveLength(5);
  expect((await getAgentRelease()).version).toBe("Agent 7.4.2");
});

it("returns the unprotected people with readable state labels", async () => {
  const people = await getUnprotected();
  expect(people).toHaveLength(6);
  expect(stateLabel[people[0].state]).toBe("Needs IT approval");
  expect(stateLabel.blocked).toBe("Blocked");
});

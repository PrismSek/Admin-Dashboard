import { expect, it } from "vitest";

import { getIncident, getIncidents, getIncidentStats, getTotalIncidents } from "@/features/issues/data";

it("lists the incidents with the flagship first", async () => {
  const rows = await getIncidents();
  expect(rows).toHaveLength(10);
  expect(rows[0].id).toBe("INC-2026-4471");
  expect(await getTotalIncidents()).toBe(248);
});

it("exposes the four exfiltration stats", async () => {
  const stats = await getIncidentStats();
  expect(stats.map((stat) => stat.label)).toEqual([
    "Open incidents",
    "Unclaimed",
    "Data left device",
    "Critical & high",
  ]);
  expect(stats[0]).toMatchObject({ value: "84", suffix: "/ 248" });
});

it("builds the flagship case verbatim", async () => {
  const detail = await getIncident("INC-2026-4471");
  expect(detail).not.toBeNull();
  expect(detail?.severity).toBe("high");
  expect(detail?.statusTone).toBe("green");
  expect(detail?.caseRecord[0]).toMatchObject({ label: "Who", value: "Aisha Sharma" });
  expect(detail?.evidence).toHaveLength(5);
  expect(detail?.evidence.at(-1)).toMatchObject({ tone: "green", badge: "Blocked" });
});

it("derives a working case for a non-flagship row", async () => {
  const detail = await getIncident("INC-2026-4470");
  expect(detail?.person).toBe("Rahul Okonjo");
  expect(detail?.caseRecord).toHaveLength(4);
  expect(detail?.containActions).toHaveLength(3);
});

it("returns null for an unknown case", async () => {
  expect(await getIncident("INC-does-not-exist")).toBeNull();
});

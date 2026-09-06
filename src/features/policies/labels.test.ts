import { describe, expect, it } from "vitest";

import { channelLabel } from "@/features/policies/labels";

describe("channelLabel", () => {
  it("splits camelCase channel codes into spaced words", () => {
    expect(channelLabel("BrowserUpload")).toBe("Browser Upload");
    expect(channelLabel("CloudSync")).toBe("Cloud Sync");
    expect(channelLabel("ThickApps")).toBe("Thick Apps");
    expect(channelLabel("CodeGit")).toBe("Code Git");
    expect(channelLabel("NetworkShare")).toBe("Network Share");
  });

  it("leaves single-word and all-caps codes intact", () => {
    expect(channelLabel("Clipboard")).toBe("Clipboard");
    expect(channelLabel("Printing")).toBe("Printing");
    expect(channelLabel("USB")).toBe("USB");
  });

  it("keeps a leading acronym separate from the word that follows it", () => {
    expect(channelLabel("AIAgent")).toBe("AI Agent");
  });
});

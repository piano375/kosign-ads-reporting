import { describe, expect, it } from "vitest";
import { resolveMetaToken } from "../../src/lib/meta/token";

describe("resolveMetaToken", () => {
  it("uses a deployment environment token without reading a local token file", async () => {
    await expect(resolveMetaToken({ META_SYSTEM_TOKEN: "deployment-token", META_SYSTEM_TOKEN_FILE: "/missing" })).resolves.toBe("deployment-token");
  });

  it("rejects blank deployment environment tokens", async () => {
    await expect(resolveMetaToken({ META_SYSTEM_TOKEN: "   ", META_SYSTEM_TOKEN_FILE: "/missing" })).rejects.toThrow("temporarily unavailable");
  });
});

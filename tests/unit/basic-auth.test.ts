import { describe, expect, it } from "vitest";
import { isAuthorized } from "../../src/lib/auth/basic";

describe("isAuthorized", () => {
  it("permits the exact Basic credential", () => {
    expect(isAuthorized("Basic a29zaWduOnNlY3JldA==", "kosign", "secret")).toBe(true);
  });

  it("rejects missing or incorrect Basic credentials", () => {
    expect(isAuthorized(null, "kosign", "secret")).toBe(false);
    expect(isAuthorized("Basic a29zaWduOndyb25n", "kosign", "secret")).toBe(false);
  });
});

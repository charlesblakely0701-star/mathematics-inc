import { describe, expect, it } from "vitest";

import { getInitials } from "@/lib/users";

describe("getInitials", () => {
  it("returns up to two initials from a full name", () => {
    expect(getInitials("Emmy Noether")).toBe("EN");
  });

  it("takes the first two characters for a single-word name", () => {
    // Single-word names show first 2 chars (e.g. a username like "Pythagoras")
    expect(getInitials("Pythagoras")).toBe("PY");
  });

  it("returns uppercase initials", () => {
    expect(getInitials("alan turing")).toBe("AT");
  });

  it("takes first and last initial for multi-part names", () => {
    expect(getInitials("Carl Friedrich Gauss")).toBe("CG");
  });

  it("returns a fallback placeholder for an empty name", () => {
    // The implementation returns "?" so an avatar always has a character.
    expect(getInitials("")).toBe("?");
  });

  it("trims whitespace gracefully", () => {
    expect(getInitials("  Ada  Lovelace  ")).toBe("AL");
  });
});

import { describe, expect, it } from "vitest";

import { getAvatarStyle } from "@/lib/avatar";

describe("getAvatarStyle", () => {
  it("returns an object with backgroundColor and color", () => {
    const style = getAvatarStyle("Emmy Noether");
    expect(style).toHaveProperty("backgroundColor");
    expect(style).toHaveProperty("color");
  });

  it("returns HSL strings", () => {
    const { backgroundColor, color } = getAvatarStyle("Emmy Noether") as {
      backgroundColor: string;
      color: string;
    };
    expect(backgroundColor).toMatch(/^hsl\(/);
    expect(color).toMatch(/^hsl\(/);
  });

  it("is deterministic — same name always gets the same style", () => {
    const a = getAvatarStyle("Carl Gauss");
    const b = getAvatarStyle("Carl Gauss");
    expect(a).toEqual(b);
  });

  it("produces different styles for names that hash to different buckets", () => {
    // "Emmy Noether" hashes to bucket 5 (hue 260), "Sophie Germain" to 1 (280).
    const en = getAvatarStyle("Emmy Noether");
    const sg = getAvatarStyle("Sophie Germain");
    expect(en.backgroundColor).not.toEqual(sg.backgroundColor);
  });

  it("handles a single-character name without throwing", () => {
    expect(() => getAvatarStyle("X")).not.toThrow();
  });

  it("handles an empty string without throwing", () => {
    expect(() => getAvatarStyle("")).not.toThrow();
  });
});

import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "@/lib/validation/auth";
import { updateProfileSchema } from "@/lib/validation/profile";

// ---------------------------------------------------------------------------
// registerSchema
// ---------------------------------------------------------------------------
describe("registerSchema", () => {
  const valid = {
    email: "emmy@math-inc.example",
    password: "theorem1234",
    confirmPassword: "theorem1234",
    name: "Emmy Noether",
    title: "",
    department: "",
  };

  it("accepts a valid payload", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("email");
    }
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("password");
    }
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      ...valid,
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("confirmPassword");
    }
  });

  it("rejects an empty name", () => {
    const result = registerSchema.safeParse({ ...valid, name: "   " });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// loginSchema
// ---------------------------------------------------------------------------
describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    expect(
      loginSchema.safeParse({ email: "gauss@math.inc", password: "anypass" })
        .success,
    ).toBe(true);
  });

  it("rejects missing password", () => {
    const result = loginSchema.safeParse({ email: "gauss@math.inc", password: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "gauss", password: "pass" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateProfileSchema
// ---------------------------------------------------------------------------
describe("updateProfileSchema", () => {
  const valid = {
    name: "Maryam Mirzakhani",
    title: "Senior Researcher",
    department: "Geometry",
    bio: "Exploring moduli spaces.",
    researchInterests: "Riemann surfaces, Teichmüller theory",
    websiteUrl: "https://math.stanford.edu",
    favoriteTheorem: "",
  };

  it("accepts a valid payload", () => {
    expect(updateProfileSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts an empty optional websiteUrl", () => {
    expect(
      updateProfileSchema.safeParse({ ...valid, websiteUrl: "" }).success,
    ).toBe(true);
  });

  it("rejects a non-http websiteUrl", () => {
    const result = updateProfileSchema.safeParse({
      ...valid,
      websiteUrl: "ftp://notallowed.com",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("websiteUrl");
    }
  });

  it("rejects a bio over 1000 characters", () => {
    const result = updateProfileSchema.safeParse({
      ...valid,
      bio: "a".repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

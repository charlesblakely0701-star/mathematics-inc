/** Shared demo credentials for seeded mathematicians (see README / prisma/seed.ts). */
export const DEMO_PASSWORD = "theorem1234";

export const PRIMARY_DEMO_ACCOUNT = {
  email: "carl.gauss@math-inc.example",
  name: "Carl Friedrich Gauss",
} as const;

export const DEMO_ACCOUNTS = [
  PRIMARY_DEMO_ACCOUNT,
  {
    email: "emmy.noether@math-inc.example",
    name: "Emmy Noether",
  },
] as const;

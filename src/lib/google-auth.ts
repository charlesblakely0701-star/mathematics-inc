import crypto from "crypto";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";

export function isGoogleAuthConfigured(): boolean {
  const id = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
  const secret =
    process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;
  return Boolean(id?.trim() && secret?.trim());
}

/** Creates or updates a user after Google OAuth (email treated as verified). */
export async function ensureGoogleUser(params: {
  email: string;
  name?: string | null;
}): Promise<void> {
  const email = params.email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10);

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: params.name?.trim() || email.split("@")[0],
      passwordHash,
      emailVerified: new Date(),
    },
    update: {
      emailVerified: new Date(),
      ...(params.name?.trim() ? { name: params.name.trim() } : {}),
    },
  });
}

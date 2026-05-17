import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/db";

export class UnauthorizedError extends Error {
  constructor(message = "Not signed in") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

const nextAuth = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.trim().toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
          },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
});

export const { auth, handlers, signIn, signOut } = nextAuth;

/**
 * Returns the current session or throws `UnauthorizedError`. Use this at the
 * top of every server action / server component that requires a signed-in
 * user — proxy gating is best-effort, not a security boundary.
 */
export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  return session as typeof session & {
    user: { id: string; email?: string | null; name?: string | null };
  };
}

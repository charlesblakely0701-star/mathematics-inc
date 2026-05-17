import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/db";
import { ensureGoogleUser, isGoogleAuthConfigured } from "@/lib/google-auth";

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

function googleProvider() {
  if (!isGoogleAuthConfigured()) return null;
  const clientId =
    process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? "";
  const clientSecret =
    process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "";
  return Google({
    clientId,
    clientSecret,
    allowDangerousEmailAccountLinking: true,
  });
}

const providers: Provider[] = [
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
          emailVerified: true,
        },
      });
      if (!user) return null;

      const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
      if (!ok) return null;

      if (!user.emailVerified) {
        return null;
      }

      return { id: user.id, email: user.email, name: user.name };
    },
  }),
];

const google = googleProvider();
if (google) {
  providers.unshift(google as Provider);
}

const nextAuth = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    authorized: authConfig.callbacks.authorized,
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      const email = user.email?.trim().toLowerCase();
      if (!email) return false;

      const googleProfile = profile as { email_verified?: boolean } | undefined;
      if (googleProfile?.email_verified === false) {
        return false;
      }

      await ensureGoogleUser({ email, name: user.name });
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        const email = (
          user?.email ??
          (typeof token.email === "string" ? token.email : null)
        )?.toLowerCase();
        if (email) {
          const dbUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
          });
          if (dbUser) token.id = dbUser.id;
        }
      } else if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

export const { auth, handlers, signIn, signOut } = nextAuth;

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  return session as typeof session & {
    user: { id: string; email?: string | null; name?: string | null };
  };
}

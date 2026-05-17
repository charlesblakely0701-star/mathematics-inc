// Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`.
// Per the Next 16 docs, proxy may not run for every Server Function
// invocation, so we ALSO enforce session checks inside server actions /
// server components (see `requireSession` in `@/lib/auth`).

import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};

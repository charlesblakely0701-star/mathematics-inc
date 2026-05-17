import type { NextAuthConfig } from "next-auth";

// Edge-safe Auth.js config. Imported by middleware (Edge runtime) and by the
// full Node config in ./auth.ts. Never import Prisma or bcrypt here.

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
] as const;
const ROOT_ROUTE = "/" as const;

function isPublicPath(pathname: string) {
  return (
    pathname === ROOT_ROUTE ||
    PUBLIC_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  );
}

export const authConfig = {
  // Required when using a non-default port (e.g. 3001) or behind a proxy.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      if (isPublicPath(pathname)) {
        // Logged-in users visiting /login or /register → send to the app.
        if (isLoggedIn && pathname !== ROOT_ROUTE) {
          return Response.redirect(new URL("/directory", nextUrl));
        }
        // Logged-in users visiting / → send to the app.
        if (isLoggedIn && pathname === ROOT_ROUTE) {
          return Response.redirect(new URL("/directory", nextUrl));
        }
        // Logged-out users visiting / → send to login.
        if (!isLoggedIn && pathname === ROOT_ROUTE) {
          return Response.redirect(new URL("/login", nextUrl));
        }
        return true;
      }

      return isLoggedIn;
    },
    async jwt({ token, user }) {
      if (user?.id) {
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
} satisfies NextAuthConfig;

import Link from "next/link";

import { NavLink } from "@/components/nav-link";
import { UserMenu } from "@/components/user-menu";
import { requireSession } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense in depth: the proxy gates this segment, but Next 16 docs warn
  // proxy may be skipped for Server Functions, so we require a session here
  // too. requireSession throws if there isn't one (caught by Next's error
  // boundary, then surfaced as a redirect via proxy on the next nav).
  const session = await requireSession();

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-foreground/10 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-6">
          <Link
            href="/directory"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-foreground/15 font-serif text-base">
              &Sigma;
            </span>
            Mathematics, Inc.
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink href="/directory">Directory</NavLink>
            <UserMenu
              name={session.user.name ?? "User"}
              email={session.user.email ?? null}
            />
          </nav>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8">
        {children}
      </div>
    </div>
  );
}

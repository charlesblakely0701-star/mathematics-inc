import Link from "next/link";
import type { Metadata } from "next";

import { requireSession } from "@/lib/auth";
import { getInitials, getProfile } from "@/lib/users";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "My profile · Mathematics, Inc.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireSession();
  const user = await getProfile(session.user.id);

  if (!user) {
    // Shouldn't happen (account deleted mid-session), but handle gracefully.
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-foreground/70">
          Your profile could not be found.{" "}
          <Link href="/login" className="underline">
            Sign out and try again.
          </Link>
        </p>
      </div>
    );
  }

  const initials = getInitials(user.name);

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      {/* Profile header */}
      <header className="flex items-center gap-4">
        <span
          aria-hidden
          className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-foreground/10 bg-foreground/[0.06] font-serif text-2xl text-foreground/80"
        >
          {initials}
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
          {user.title && (
            <p className="text-sm text-foreground/70">{user.title}</p>
          )}
          {user.department && (
            <span className="mt-1 inline-flex items-center rounded-full border border-foreground/10 bg-foreground/[0.04] px-2.5 py-0.5 text-xs font-medium text-foreground/80">
              {user.department}
            </span>
          )}
        </div>
      </header>

      <div className="rounded-xl border border-foreground/10 bg-background p-6">
        <h2 className="mb-5 text-base font-semibold">Edit profile</h2>
        <ProfileForm user={user} />
      </div>
    </section>
  );
}

import type { Metadata } from "next";

import { UserCard } from "@/components/directory/user-card";
import { getDirectory } from "@/lib/users";

export const metadata: Metadata = {
  title: "Directory · Mathematics, Inc.",
};

// Always fetch fresh data — this is a directory, staleness would be confusing.
export const dynamic = "force-dynamic";

export default async function DirectoryPage() {
  const users = await getDirectory();

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Directory</h1>
        <p className="text-sm text-foreground/60">
          {users.length === 1
            ? "1 mathematician"
            : `${users.length} mathematicians`}{" "}
          at Mathematics, Inc.
        </p>
      </header>

      {users.length === 0 ? (
        <EmptyState />
      ) : (
        <ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Employees"
        >
          {users.map((user) => (
            <li key={user.id} className="contents">
              <UserCard user={user} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-foreground/15 px-6 py-12 text-center">
      <p className="text-sm text-foreground/70">
        No one&rsquo;s registered yet. You&rsquo;re the first.
      </p>
    </div>
  );
}

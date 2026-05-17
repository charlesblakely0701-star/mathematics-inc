import type { Metadata } from "next";

import { DirectorySearch } from "@/components/directory/directory-search";
import { getDirectory } from "@/lib/users";

export const metadata: Metadata = {
  title: "Directory · Mathematics, Inc.",
};

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
      <DirectorySearch users={users} />
    </section>
  );
}

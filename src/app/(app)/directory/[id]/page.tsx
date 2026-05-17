import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getAvatarStyle } from "@/lib/avatar";
import { getInitials, getProfile } from "@/lib/users";
import { LatexBlock } from "@/components/latex-block";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const user = await getProfile(id);
  if (!user) return { title: "Not found · Mathematics, Inc." };
  return { title: `${user.name} · Mathematics, Inc.` };
}

export default async function ProfileDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await getProfile(id);
  if (!user) notFound();

  const initials = getInitials(user.name);
  const avatarStyle = getAvatarStyle(user.name);

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Back link */}
      <Link
        href="/directory"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden
        >
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Directory
      </Link>

      {/* Header */}
      <header className="flex items-start gap-5">
        <span
          aria-hidden
          style={avatarStyle}
          className="inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-full font-serif text-3xl font-medium"
        >
          {initials}
        </span>
        <div className="flex flex-col gap-1 pt-1">
          <h1 className="text-3xl font-semibold tracking-tight">{user.name}</h1>
          {user.title && (
            <p className="text-base text-foreground/70">{user.title}</p>
          )}
          {user.department && (
            <span className="mt-1 inline-flex w-fit items-center rounded-full border border-foreground/10 bg-foreground/[0.04] px-3 py-1 text-sm font-medium text-foreground/80">
              {user.department}
            </span>
          )}
        </div>
      </header>

      <div className="mt-10 flex flex-col gap-8">
        {/* Bio */}
        {user.bio && (
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-foreground/40">
              About
            </h2>
            <p className="text-base leading-relaxed text-foreground/80">
              {user.bio}
            </p>
          </section>
        )}

        {/* Research interests */}
        {user.researchInterests.length > 0 && (
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground/40">
              Research interests
            </h2>
            <ul className="flex flex-wrap gap-2">
              {user.researchInterests.map((tag) => (
                <li
                  key={tag}
                  className="rounded-md border border-foreground/10 bg-foreground/[0.04] px-3 py-1 text-sm text-foreground/80"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Favorite theorem */}
        {user.favoriteTheorem && (
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground/40">
              Favorite theorem
            </h2>
            <div className="rounded-lg border border-foreground/10 bg-foreground/[0.02] px-4 py-3 text-sm">
              <LatexBlock>{user.favoriteTheorem}</LatexBlock>
            </div>
          </section>
        )}

        {/* Links */}
        {user.websiteUrl && (
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-foreground/40">
              Links
            </h2>
            <a
              href={user.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
            >
              {user.websiteUrl.replace(/^https?:\/\//, "")}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
                aria-hidden
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </section>
        )}

        {/* Member since */}
        <p className="text-xs text-foreground/40">
          Member since{" "}
          {new Intl.DateTimeFormat("en-US", {
            month: "long",
            year: "numeric",
          }).format(new Date(user.createdAt))}
        </p>
      </div>
    </div>
  );
}

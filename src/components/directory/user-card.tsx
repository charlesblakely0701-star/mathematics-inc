import { type DirectoryUser, getInitials } from "@/lib/users";

const MAX_INTERESTS = 3;

export function UserCard({ user }: { user: DirectoryUser }) {
  const initials = getInitials(user.name);
  const interests = user.researchInterests.slice(0, MAX_INTERESTS);
  const overflow = user.researchInterests.length - interests.length;

  return (
    <article className="flex h-full flex-col gap-3 rounded-xl border border-foreground/10 bg-background p-5 transition-colors hover:border-foreground/20">
      <header className="flex items-start gap-3">
        <span
          aria-hidden
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06] font-serif text-base text-foreground/80"
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold tracking-tight">
            {user.name}
          </h3>
          {user.title && (
            <p className="truncate text-sm text-foreground/70">{user.title}</p>
          )}
        </div>
      </header>

      {user.department && (
        <span className="inline-flex w-fit items-center rounded-full border border-foreground/10 bg-foreground/[0.04] px-2.5 py-0.5 text-xs font-medium text-foreground/80">
          {user.department}
        </span>
      )}

      {user.bio && (
        <p className="line-clamp-3 text-sm text-foreground/70">{user.bio}</p>
      )}

      {interests.length > 0 && (
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {interests.map((tag) => (
            <li
              key={tag}
              className="rounded-md bg-foreground/[0.05] px-2 py-0.5 text-xs text-foreground/70"
            >
              {tag}
            </li>
          ))}
          {overflow > 0 && (
            <li className="rounded-md px-2 py-0.5 text-xs text-foreground/50">
              +{overflow} more
            </li>
          )}
        </ul>
      )}
    </article>
  );
}

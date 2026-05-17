"use client";

import { useCallback, useMemo, useState } from "react";

import { type DirectoryUser } from "@/lib/users";
import { UserCard } from "./user-card";

function normalize(s: string) {
  return s.toLowerCase().trim();
}

function matchesQuery(user: DirectoryUser, query: string): boolean {
  if (!query) return true;
  const q = normalize(query);
  return (
    normalize(user.name).includes(q) ||
    (user.title ? normalize(user.title).includes(q) : false) ||
    (user.department ? normalize(user.department).includes(q) : false) ||
    (user.bio ? normalize(user.bio).includes(q) : false) ||
    user.researchInterests.some((t) => normalize(t).includes(q))
  );
}

export function DirectorySearch({ users }: { users: DirectoryUser[] }) {
  const [query, setQuery] = useState("");
  const [activeDept, setActiveDept] = useState<string | null>(null);

  // Sorted unique non-null departments
  const departments = useMemo(() => {
    const depts = new Set<string>();
    for (const u of users) {
      if (u.department) depts.add(u.department);
    }
    return Array.from(depts).sort();
  }, [users]);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          matchesQuery(u, query) &&
          (activeDept === null || u.department === activeDept),
      ),
    [users, query, activeDept],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
    [],
  );

  const toggleDept = useCallback((dept: string) => {
    setActiveDept((prev) => (prev === dept ? null : dept));
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {/* Search input */}
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
        <input
          type="search"
          aria-label="Search employees"
          placeholder="Search by name, title, department, or interests…"
          value={query}
          onChange={handleChange}
          className="h-10 w-full rounded-lg border border-foreground/15 bg-background pl-9 pr-4 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-foreground/20"
        />
      </div>

      {/* Department filter chips */}
      {departments.length > 0 && (
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by department"
        >
          {departments.map((dept) => {
            const isActive = activeDept === dept;
            return (
              <button
                key={dept}
                type="button"
                onClick={() => toggleDept(dept)}
                aria-pressed={isActive}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "border-foreground/40 bg-foreground text-background"
                    : "border-foreground/15 bg-background text-foreground/70 hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {dept}
              </button>
            );
          })}
          {activeDept && (
            <button
              type="button"
              onClick={() => setActiveDept(null)}
              className="rounded-full border border-transparent px-2 py-1 text-xs text-foreground/50 hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-foreground/15 px-6 py-12 text-center">
          <p className="text-sm text-foreground/70">
            {query || activeDept
              ? "No mathematicians match the current filters."
              : "No one has registered yet. You're the first."}
          </p>
        </div>
      ) : (
        <>
          {(query || activeDept) && (
            <p className="text-xs text-foreground/50" aria-live="polite">
              {filtered.length === 1
                ? "1 result"
                : `${filtered.length} results`}
            </p>
          )}
          <ul
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Employees"
          >
            {filtered.map((user) => (
              <li key={user.id} className="contents">
                <UserCard user={user} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { signOutAction } from "@/app/actions/auth";
import { getAvatarStyle } from "@/lib/avatar";
import { getInitials } from "@/lib/users";

type Props = {
  name: string;
  email: string | null;
};

export function UserMenu({ name, email }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const initials = getInitials(name);
  const avatarStyle = getAvatarStyle(name);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-foreground/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
      >
        <span
          aria-hidden
          style={avatarStyle}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-serif text-sm font-medium"
        >
          {initials}
        </span>
        <span className="hidden max-w-[140px] truncate font-medium sm:inline">
          {name}
        </span>
        <ChevronIcon
          className={`h-4 w-4 text-foreground/50 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-lg border border-foreground/10 bg-background py-1 shadow-lg"
        >
          <div className="border-b border-foreground/10 px-3 py-2">
            <p className="truncate text-sm font-medium">{name}</p>
            {email && (
              <p className="truncate text-xs text-foreground/60">{email}</p>
            )}
          </div>
          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm hover:bg-foreground/[0.04]"
          >
            My profile
          </Link>
          <form action={signOutAction} role="none">
            <button
              type="submit"
              role="menuitem"
              className="w-full px-3 py-2 text-left text-sm hover:bg-foreground/[0.04]"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

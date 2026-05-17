import { prisma } from "@/lib/db";

// Explicit allow-list for any query that crosses a network/render boundary.
// passwordHash is NEVER selected here; the only place it's read is the
// Credentials provider's authorize callback in @/lib/auth.
const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  title: true,
  department: true,
  bio: true,
  researchInterests: true,
  websiteUrl: true,
  favoriteTheorem: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type DirectoryUser = {
  id: string;
  email: string;
  name: string;
  title: string | null;
  department: string | null;
  bio: string | null;
  researchInterests: string[];
  websiteUrl: string | null;
  favoriteTheorem: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function getDirectory(): Promise<DirectoryUser[]> {
  return prisma.user.findMany({
    select: PUBLIC_USER_SELECT,
    orderBy: [{ name: "asc" }],
  });
}

export async function getProfile(userId: string): Promise<DirectoryUser | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: PUBLIC_USER_SELECT,
  });
}

export function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validation/profile";

export type ProfileFieldErrors = Partial<
  Record<
    | "name"
    | "title"
    | "department"
    | "bio"
    | "researchInterests"
    | "websiteUrl",
    string
  >
>;

export type ProfileState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; formError?: string; fieldErrors?: ProfileFieldErrors };

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  // Always derive userId from the session — never accept it from the client.
  const session = await requireSession();
  const userId = session.user.id;

  const raw = {
    name: String(formData.get("name") ?? ""),
    title: String(formData.get("title") ?? ""),
    department: String(formData.get("department") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    researchInterests: String(formData.get("researchInterests") ?? ""),
    websiteUrl: String(formData.get("websiteUrl") ?? ""),
  };

  const parsed = updateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: ProfileFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (
        typeof key === "string" &&
        (key === "name" ||
          key === "title" ||
          key === "department" ||
          key === "bio" ||
          key === "researchInterests" ||
          key === "websiteUrl") &&
        !fieldErrors[key]
      ) {
        fieldErrors[key] = issue.message;
      }
    }
    return { status: "error", fieldErrors };
  }

  const interests = parsed.data.researchInterests
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: parsed.data.name,
        title: parsed.data.title || null,
        department: parsed.data.department || null,
        bio: parsed.data.bio || null,
        researchInterests: interests,
        websiteUrl: parsed.data.websiteUrl || null,
      },
      select: { id: true },
    });
  } catch (err) {
    console.error("updateProfileAction: failed", err);
    return {
      status: "error",
      formError: "Something went wrong saving your profile. Please try again.",
    };
  }

  revalidatePath("/directory");
  revalidatePath("/profile");

  return { status: "success" };
}

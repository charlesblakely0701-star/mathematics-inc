import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter your name.")
    .max(120, "Name is too long."),
  title: z.string().trim().max(120, "Title is too long.").or(z.literal("")),
  department: z
    .string()
    .trim()
    .max(120, "Department is too long.")
    .or(z.literal("")),
  bio: z.string().trim().max(1000, "Bio must be 1,000 characters or fewer.").or(z.literal("")),
  researchInterests: z.string().trim().max(500),
  websiteUrl: z
    .string()
    .trim()
    .max(300, "URL is too long.")
    .refine(
      (v) => v === "" || v.startsWith("http://") || v.startsWith("https://"),
      "Please enter a valid URL (starting with http:// or https://).",
    ),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

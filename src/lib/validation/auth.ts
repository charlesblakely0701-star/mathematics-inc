import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.email("Please enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(200, "Password is too long."),
    confirmPassword: z.string(),
    name: z
      .string()
      .trim()
      .min(1, "Please enter your name.")
      .max(120, "Name is too long."),
    title: z
      .string()
      .trim()
      .max(120, "Title is too long.")
      .optional()
      .or(z.literal("")),
    department: z
      .string()
      .trim()
      .max(120, "Department is too long.")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
});

export type LoginInput = z.infer<typeof loginSchema>;

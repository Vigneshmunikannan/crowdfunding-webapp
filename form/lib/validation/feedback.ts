import { z } from "zod";

/** Server-side source of truth — never trust the client */
export const feedbackBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(200, "Name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(320, "Email is too long"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(10_000, "Message is too long"),
});

export type FeedbackInput = z.infer<typeof feedbackBodySchema>;

export const adminLoginSchema = z.object({
  username: z.string().min(1).max(128),
  password: z.string().min(1).max(512),
});

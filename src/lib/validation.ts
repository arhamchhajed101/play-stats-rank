import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address")
  .max(255, "Email is too long");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long");

export const usernameSchema = z
  .string()
  .trim()
  .min(2, "Username must be at least 2 characters")
  .max(30, "Username is too long")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, hyphens, and underscores"
  );

export const riotIdSchema = z
  .string()
  .trim()
  .min(3, "Riot ID is too short")
  .max(50, "Riot ID is too long")
  .regex(/^[^#]+#[^#]+$/, "Invalid format. Use Name#Tag (e.g. TenZ#0505)");

export const ingameIdSchema = z
  .string()
  .trim()
  .min(1, "In-game ID is required")
  .max(100, "In-game ID is too long");

export function getValidationError(schema: z.ZodSchema, value: unknown): string | null {
  const result = schema.safeParse(value);
  if (result.success) return null;
  return result.error.issues[0]?.message || "Invalid input";
}

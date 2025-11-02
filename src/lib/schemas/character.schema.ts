import { z } from "astro/zod";

export const createCharacterSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  role: z.string().optional(),
  description: z.string().optional(),
  traits: z.array(z.string()).optional(),
  motivations: z.array(z.string()).optional(),
  avatar_url: z.string().url({ message: "Invalid URL format" }).optional(),
  is_owner: z.boolean(),
});

export const updateCharacterSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).optional(),
  role: z.string().optional(),
  description: z.string().optional(),
  traits: z.array(z.string()).optional(),
  motivations: z.array(z.string()).optional(),
  avatar_url: z.string().url({ message: "Invalid URL format" }).optional(),
  is_owner: z.boolean().optional(),
});

export const ListCharactersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["name", "last_interacted_at"]).default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

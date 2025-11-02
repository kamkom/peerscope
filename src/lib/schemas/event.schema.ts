import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  event_date: z.string().datetime({ message: "Invalid ISO 8601 date format" }),
  description: z.string().min(1, "Description is required"),
  participant_ids: z
    .array(z.string().uuid("Invalid UUID format for participant ID"))
    .min(2, "At least two participants are required"),
});

export const updateEventSchema = createEventSchema.partial();

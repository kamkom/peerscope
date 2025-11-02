import type { APIRoute } from "astro";
import { z } from "zod";
import { EventService, ServiceError } from "../../lib/services/event.service";
import { createEventSchema } from "../../lib/schemas/event.schema";

export const prerender = false;

const getQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["event_date", "title", "created_at"]).default("event_date"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const GET: APIRoute = async ({ request, locals }) => {
  const session = locals.session;
  if (!session?.user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams.entries());

  const validation = getQuerySchema.safeParse(queryParams);

  if (!validation.success) {
    return new Response(JSON.stringify({ message: "Bad Request", errors: validation.error.flatten() }), {
      status: 400,
    });
  }

  const { page, pageSize, sortBy, order } = validation.data;

  try {
    const result = await EventService.getEvents(locals.supabase, session.user.id, { page, pageSize, sortBy, order });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return new Response(JSON.stringify({ message: error.message }), { status: error.status });
    }
    console.error("Unhandled error in GET /api/events:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const session = locals.session;
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "User is not authenticated" }), { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const validation = createEventSchema.safeParse(body);

  if (!validation.success) {
    return new Response(JSON.stringify({ error: "Validation failed", details: validation.error.flatten() }), {
      status: 400,
    });
  }

  try {
    const newEvent = await EventService.createEvent(locals.supabase, validation.data, session.user.id);
    return new Response(JSON.stringify(newEvent), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return new Response(JSON.stringify({ error: error.message }), { status: error.status });
    }
    console.error("Unhandled error in POST /api/events:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), { status: 500 });
  }
};

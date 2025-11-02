import type { APIContext } from "astro";
import { z, ZodError } from "zod";

import { updateEventSchema } from "../../../lib/schemas/event.schema";
import { EventService, ServiceError } from "../../../lib/services/event.service";

export const prerender = false;

// GET /api/events/[id] - Fetches a single event by its ID
export const GET = async ({ params, locals }: APIContext): Promise<Response> => {
  const { user, supabase } = locals;

  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ message: "Event ID is required" }), { status: 400 });
  }

  try {
    const event = await EventService.getEventById(supabase, id, user.id);
    return new Response(JSON.stringify(event), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`Error in GET /api/events/[id]:`, error);
    if (error instanceof ServiceError) {
      return new Response(JSON.stringify({ message: error.message }), { status: error.status });
    }
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};

// PUT /api/events/[id] - Updates an existing event
export const PUT = async ({ params, request, locals }: APIContext): Promise<Response> => {
  const { user, supabase } = locals;

  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ message: "Event ID is required" }), { status: 400 });
  }

  try {
    const body = await request.json();
    const validatedData = updateEventSchema.parse(body);

    const updatedEvent = await EventService.updateEvent(supabase, id, validatedData, user.id);

    return new Response(JSON.stringify(updatedEvent), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(JSON.stringify({ message: "Validation failed", errors: error.flatten() }), {
        status: 400,
      });
    }

    if (error instanceof ServiceError) {
      return new Response(JSON.stringify({ message: error.message }), { status: error.status });
    }

    console.error(`Error in PUT /api/events/[id]:`, error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};

// DELETE /api/events/[id] - Deletes an event by its ID
export const DELETE = async ({ params, locals }: APIContext): Promise<Response> => {
  const { user, supabase } = locals;

  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const { id } = params;

  try {
    const eventId = z.string().uuid().parse(id);

    await EventService.deleteEvent(supabase, eventId, user.id);

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(JSON.stringify({ message: "Invalid event ID format", errors: error.flatten() }), {
        status: 400,
      });
    }

    if (error instanceof ServiceError) {
      return new Response(JSON.stringify({ message: error.message }), { status: error.status });
    }

    console.error(`Error in DELETE /api/events/[id]:`, error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};

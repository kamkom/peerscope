import type { APIRoute } from "astro";
import { z } from "zod";
import { EventService, ServiceError } from "../../../../lib/services/event.service";

export const prerender = false;

const pathParamsSchema = z.object({
  id: z.string().uuid({ message: "Invalid event ID format." }),
});

export const GET: APIRoute = async ({ params, locals }) => {
  const { user, supabase } = locals;

  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const parsedParams = pathParamsSchema.safeParse(params);
  if (!parsedParams.success) {
    return new Response(JSON.stringify({ message: "Bad Request", errors: parsedParams.error.format() }), {
      status: 400,
    });
  }

  const { id: eventId } = parsedParams.data;

  try {
    const analyses = await EventService.getEventAnalyses(supabase, eventId, user.id);
    return new Response(JSON.stringify(analyses), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return new Response(JSON.stringify({ message: error.message }), { status: error.status });
    }

    console.error("Internal Server Error:", error);
    return new Response(JSON.stringify({ message: "An unexpected error occurred." }), { status: 500 });
  }
};

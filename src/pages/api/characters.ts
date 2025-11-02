import type { APIRoute } from "astro";
import { ZodError } from "zod";

import { CharacterService } from "../../lib/services/character.service";
import { createCharacterSchema, ListCharactersQuerySchema } from "../../lib/schemas/character.schema";

export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) => {
  const { user, supabase, session } = locals;

  if (!user || !session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const queryParams = Object.fromEntries(url.searchParams.entries());
  const validationResult = ListCharactersQuerySchema.safeParse(queryParams);

  if (!validationResult.success) {
    return new Response(JSON.stringify({ errors: validationResult.error.flatten() }), {
      status: 400,
    });
  }

  const { page, pageSize, sortBy, order } = validationResult.data;

  try {
    const paginatedCharacters = await CharacterService.getCharacters({
      supabase,
      userId: user.id,
      page,
      pageSize,
      sortBy,
      order,
    });

    return new Response(JSON.stringify(paginatedCharacters), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching characters:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const { user } = locals;
  const supabase = locals.supabase;

  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = createCharacterSchema.parse(body);

    const newCharacter = await CharacterService.createCharacter(supabase, validatedData, user.id);

    return new Response(JSON.stringify(newCharacter), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(JSON.stringify({ message: "Validation failed", errors: error.flatten() }), {
        status: 400,
      });
    }

    // TODO: Add logging for the error
    console.error("Error in POST /api/characters:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};

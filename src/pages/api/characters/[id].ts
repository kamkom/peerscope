import type { APIContext } from "astro";
import { z, ZodError } from "zod";

import { updateCharacterSchema } from "../../../lib/schemas/character.schema";
import { CharacterService } from "../../../lib/services/character.service";

export const prerender = false;

export const GET = async ({ params, locals }: APIContext): Promise<Response> => {
  const { user, supabase } = locals;

  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ message: "Character ID is required" }), { status: 400 });
  }

  try {
    const character = await CharacterService.getCharacterById(supabase, id, user.id);

    return new Response(JSON.stringify(character), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching character:", error);

    if (error instanceof Error && error.message === "Character not found.") {
      return new Response(JSON.stringify({ message: "Character not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
};

export const PUT = async ({ params, request, locals }: APIContext): Promise<Response> => {
  const { user, supabase } = locals;

  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ message: "Character ID is required" }), { status: 400 });
  }

  try {
    const body = await request.json();
    const validatedData = updateCharacterSchema.parse(body);

    const updatedCharacter = await CharacterService.updateCharacter(supabase, id, validatedData, user.id);

    return new Response(JSON.stringify(updatedCharacter), {
      status: 200,
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

    if (error instanceof Error && error.message === "Character not found.") {
      return new Response(JSON.stringify({ message: "Character not found" }), { status: 404 });
    }

    console.error("Error in PUT /api/characters/[id]:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};

const idSchema = z.string().uuid({ message: "Invalid character ID format." });

export const DELETE = async ({ params, locals }: APIContext): Promise<Response> => {
  const { user, supabase } = locals;

  if (!user) {
    return new Response(JSON.stringify({ message: "User is not authenticated." }), { status: 401 });
  }

  const { id } = params;
  const validationResult = idSchema.safeParse(id);

  if (!validationResult.success) {
    return new Response(JSON.stringify({ message: validationResult.error.errors[0].message }), { status: 400 });
  }

  const validatedId = validationResult.data;

  try {
    const result = await CharacterService.deleteCharacter(supabase, validatedId, user.id);

    if (!result.success && result.error) {
      return new Response(JSON.stringify({ message: result.error.message }), { status: result.error.status });
    }

    if (!result.success) {
      return new Response(JSON.stringify({ message: "An unexpected error occurred." }), { status: 500 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error in DELETE /api/characters/[id]:", error);
    return new Response(JSON.stringify({ message: "An unexpected server error occurred." }), { status: 500 });
  }
};

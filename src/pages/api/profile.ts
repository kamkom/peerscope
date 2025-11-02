import type { APIRoute } from "astro";
import { CharacterService } from "../../lib/services/character.service";
import { createCharacterSchema } from "../../lib/schemas/character.schema";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const { user, supabase } = locals;

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const profile = await CharacterService.getProfileByUserId(supabase, user.id);

    if (!profile) {
      return new Response(JSON.stringify(null), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(profile), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response("Error fetching profile", { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const { user, supabase } = locals;

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const formData = await request.json();
    const validatedData = createCharacterSchema.parse(formData);

    const updatedProfile = await CharacterService.upsertProfile(supabase, user.id, validatedData);

    // Update user metadata in Supabase Auth
    const { error: userError } = await supabase.auth.updateUser({
      data: {
        full_name: validatedData.name,
        avatar_url: validatedData.avatar_url,
      },
    });

    if (userError) {
      console.error("Error updating user metadata:", userError);
      // Decide if you want to throw an error or just log it
    }

    return new Response(JSON.stringify(updatedProfile), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response("Error updating profile", { status: 500 });
  }
};

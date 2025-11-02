import { defineMiddleware } from "astro:middleware";

import { createSupabaseServerClient } from "@/db/server";
import type { SupabaseClient } from "@/db/supabase.client";
import { CharacterService } from "@/lib/services/character.service";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient;
      user: import("@supabase/supabase-js").User | null;
      session: import("@supabase/supabase-js").Session | null;
      profileComplete?: boolean;
    }
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerClient(context.cookies);
  context.locals.supabase = supabase;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  context.locals.session = session;
  context.locals.user = user;

  // Compute profile completion flag (owner character with non-empty name)
  let profileComplete = false;
  if (user) {
    try {
      const owner = await CharacterService.getProfileByUserId(supabase as unknown as any, user.id);
      profileComplete = !!owner && typeof owner.name === "string" && owner.name.trim().length > 0;
    } catch {
      profileComplete = false;
    }
  }
  context.locals.profileComplete = profileComplete;

  // Handle protected routes
  if (context.url.pathname.startsWith("/dashboard")) {
    if (!context.locals.user) {
      return context.redirect("/", 302);
    }
    if (!profileComplete && !context.url.pathname.startsWith("/dashboard/profile")) {
      return context.redirect("/dashboard/profile", 302);
    }
  }

  return next();
});

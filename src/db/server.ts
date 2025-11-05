import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { AstroCookies } from "astro";
import { SUPABASE_KEY, SUPABASE_URL } from "astro:env/server";

import type { Database } from "./database.types";

export const createSupabaseServerClient = (cookies: AstroCookies) => {
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      get(key: string) {
        return cookies.get(key)?.value;
      },
      set(key: string, value: string, options: CookieOptions) {
        cookies.set(key, value, options);
      },
      remove(key: string, options: CookieOptions) {
        cookies.delete(key, options);
      },
    },
  });
};

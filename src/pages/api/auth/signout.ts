import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ redirect, locals }) => {
  const supabase = locals.supabase;
  const { error } = await supabase.auth.signOut();

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return redirect("/");
};

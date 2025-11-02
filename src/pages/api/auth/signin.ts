// With `output: 'static'` configured:
// export const prerender = false;
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, redirect, locals }) => {
  const supabase = locals.supabase;
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return new Response("Email and password are required", { status: 400 });
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return redirect("/dashboard");
};

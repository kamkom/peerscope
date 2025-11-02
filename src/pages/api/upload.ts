import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const { user, supabase } = locals;

  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ message: "No file provided" }), { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ message: "Invalid file type. Only PNG and JPEG are allowed." }), {
        status: 400,
      });
    }

    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ message: "File too large. Maximum size is 2MB." }), {
        status: 400,
      });
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage.from("uploads").upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Failed to upload file");
    }

    const { data } = supabase.storage.from("uploads").getPublicUrl(filePath);

    return new Response(
      JSON.stringify({
        url: data.publicUrl,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in POST /api/upload:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};

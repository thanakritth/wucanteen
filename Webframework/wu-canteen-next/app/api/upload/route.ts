import { NextRequest, NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/session";
import { createAdminClient } from "@/lib/supabaseAdmin";
export async function POST(request: NextRequest) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  const fileExt = file.name.split(".").pop();
  const filePath = `${crypto.randomUUID()}.${fileExt}`;
  const supabase = createAdminClient();
  const { error: uploadError } = await supabase.storage
    .from("dish-images")
    .upload(filePath, file);
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }
  const { data } = supabase.storage.from("dish-images").getPublicUrl(filePath);
  return NextResponse.json({ url: data.publicUrl });
}

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabaseAdmin";
import { createSession } from "@/lib/session";
export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 },
    );
  }
  const supabase = createAdminClient();
  const { data: staff, error } = await supabase
    .from("staff")
    .select("id, password_hash, full_name, role")
    .eq("username", username)
    .single();
  if (error || !staff) {
    return NextResponse.json(
      { error: "Incorrect username or password." },
      { status: 401 },
    );
  }
  const passwordMatches = bcrypt.compareSync(password, staff.password_hash);
  if (!passwordMatches) {
    return NextResponse.json(
      { error: "Incorrect username or password." },
      { status: 401 },
    );
  }
  await createSession(staff.id);
  return NextResponse.json({
    staff: { full_name: staff.full_name, role: staff.role },
  });
}

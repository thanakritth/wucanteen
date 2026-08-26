import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabaseAdmin";
const COOKIE_NAME = "session_token";
const SESSION_LENGTH_DAYS = 7;
export type SessionStaff = {
  id: string;
  full_name: string;
  username: string;
  role: "admin" | "staff";
};
function generateToken() {
  return randomBytes(32).toString("hex");
}
export async function createSession(staffId: string) {
  const token = generateToken();
  const expiresAt = new Date(
    Date.now() + SESSION_LENGTH_DAYS * 24 * 60 * 60 * 1000,
  );
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("sessions")   
    .insert({ token, staff_id: staffId, expires_at: expiresAt.toISOString() });
  if (error) throw error;  
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true, // never readable from client-side JavaScript — blocks XSS token theft
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}
export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    const supabase = createAdminClient();
    await supabase.from("sessions").delete().eq("token", token);
  }
  cookieStore.delete(COOKIE_NAME);
}
export async function getCurrentStaff(): Promise<SessionStaff | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("expires_at, staff ( id, full_name, username, role )")
    .eq("token", token)
    .single();
  if (error || !data) return null;
  if (new Date(data.expires_at) < new Date()) return null;
  return data.staff as unknown as SessionStaff;
}


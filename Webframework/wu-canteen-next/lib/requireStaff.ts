import { redirect } from "next/navigation";
import { getCurrentStaff, type SessionStaff } from "@/lib/session";
export async function requireStaff(): Promise<SessionStaff> {
  const staff = await getCurrentStaff();
  if (!staff) redirect("/");
  return staff;
}
export async function requireAdmin(): Promise<SessionStaff> {
  const staff = await requireStaff();
  if (staff.role !== "admin") redirect("/staff");
  return staff;
}

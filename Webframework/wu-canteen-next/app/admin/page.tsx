import { redirect } from "next/navigation";

export default function AdminPage() {
  // ให้ Redirect ไปที่หน้า Dashboard (/staff) โดยอัตโนมัติ
  redirect("/staff");
}
import { requireAdmin } from "@/lib/requireStaff";
export default async function AdminPage() {
  const staff = await requireAdmin();
  return (
    <div className="flex items-center gap-4">
      Admin Page - Welcome, {staff.full_name} ({staff.role})
    </div>
  );
}

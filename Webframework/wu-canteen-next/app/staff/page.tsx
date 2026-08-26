import { requireStaff } from "@/lib/requireStaff";
import { supabase } from "@/lib/supabase";
import StaffDashboard from "@/components/StaffDashboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserTie,
  faUserPlus,
  faUtensils,
  faTags,
} from "@fortawesome/free-solid-svg-icons";
const ROLE_STYLE = {
  admin: {
    badge: "bg-purple-100 text-purple-700",
    avatar: "bg-purple-600",
    icon: faUserTie,
    label: "Admin",
  },
  staff: {
    badge: "bg-blue-100 text-blue-700",
    avatar: "bg-blue-600",
    icon: faUserPlus,
    label: "Staff",
  },
} as const;
function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}
function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Bangkok",
    }).format(new Date()),
  );
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
export default async function StaffPage() {
  const staff = await requireStaff();
  const role = ROLE_STYLE[staff.role];
  const [{ count: dishCount }, { count: categoryCount }] = await Promise.all([
    supabase.from("dishes").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
  ]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white

${role.avatar}`}
          >
            {initials(staff.full_name)}
          </div>
          <div>
            <p className="text-sm text-gray-500">{greeting()},</p>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">
                {staff.full_name}
              </h1>
              <span
                className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold

${role.badge}`}
              >
                <FontAwesomeIcon icon={role.icon} className="h-3 w-3" />
                {role.label}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <FontAwesomeIcon icon={faUtensils} className="h-4 w-4" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{dishCount ?? 0}</p>
            <p className="text-sm text-gray-500">Dishes on the menu</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <FontAwesomeIcon icon={faTags} className="h-4 w-4" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {categoryCount ?? 0}
            </p>
            <p className="text-sm text-gray-500">Categories</p>
          </div>
        </div>
      </div>
      <StaffDashboard />
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useStaffProfile } from "@/lib/useStaffProfile";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserLock } from "@fortawesome/free-solid-svg-icons";
import DishDetailModal from "@/components/DishDetailModal";
import DishDialog from "@/components/DishDialog";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
export type DishRow = {
  id: string;
  name: string;
  price: number;
  categories: { name: string } | null;
  image_url: string | null;
  spice_level: number | null;
  sugar_level: number | null;
  dish_ingredients: { ingredient: string }[] | null;
  dish_allergens: { allergen: string }[] | null;
  chefs: { name: string } | null;
  calories: number | null;
  is_active: boolean;
};
export default function DishTable({ refreshKey }: { refreshKey?: number }) {
  const { isAdmin } = useStaffProfile();
  const [dishes, setDishes] = useState<DishRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDish, setSelectedDish] = useState<DishRow | null>(null);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [removingDish, setRemovingDish] = useState<DishRow | null>(null);
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);
  const [internalRefresh, setInternalRefresh] = useState(0);
  useEffect(() => {
    let cancelled = false;
    async function loadDishes() {
      setLoading(true);
      const res = await fetch("/api/dishes");
      const data = await res.json();
      if (cancelled) return;
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      setDishes(data.dishes ?? []);
      setLoading(false);
    }
    loadDishes();
    return () => {
      cancelled = true;
    };
  }, [refreshKey, internalRefresh]);
  async function handleConfirmRemove() {
    if (!removingDish) return;
    const res = await fetch(`/api/dishes/${removingDish.id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setRemovingDish(null);
      return;
    }
    setRemovingDish(null);
    setInternalRefresh((k) => k + 1);
  }
  async function handleReactivate(dish: DishRow) {
    setReactivatingId(dish.id);
    const res = await fetch(`/api/dishes/${dish.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: true }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setReactivatingId(null);
      return;
    }
    setReactivatingId(null);
    setInternalRefresh((k) => k + 1);
  }
  if (loading) return <p className="text-gray-500">Loading dishes...</p>;
  if (error)
    return <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>;
  return (
    <>
      <table className="w-full overflow-hidden rounded-lg bg-white shadow sm:rounded-lg">
        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3" />
            <th className="px-4 py-3">Dish</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Spice / Sugar</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
          {dishes.map((dish) => (
            <tr
              key={dish.id}
              onClick={() => setSelectedDish(dish)}
              className={`cursor-pointer border-t border-gray-100 hover:bg-gray-50 ${
                !dish.is_active ? "opacity-50" : ""
              }`}
            >
              <td className="px-4 py-3">
                {dish.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={dish.image_url}
                    alt={dish.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded bg-gray-100" />
                )}
              </td>
              <td className="px-4 py-3">
                {dish.name}
                {!dish.is_active && (
                  <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                    Inactive
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {dish.categories?.name}
              </td>
              <td className="px-4 py-3">฿{dish.price}</td>
              <td className="px-4 py-3 text-gray-500">
                {!!dish.spice_level && "🌶️".repeat(dish.spice_level)}
                {!!dish.sugar_level && "🍮".repeat(dish.sugar_level)}
                {!dish.spice_level && !dish.sugar_level && "—"}
              </td>
              <td className="px-4 py-3 text-center">
                {isAdmin ? (
                  <div className="flex items-center justify-center gap-3">
                    {/* ✏️ ปุ่ม Edit (ดินสอสีม่วง) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingDishId(dish.id);
                      }}
                      className="p-1 text-purple-600 hover:text-purple-800 hover:scale-110 transition cursor-pointer"
                      title="Edit dish"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </button>

                    {/* 🗑️ ปุ่ม Remove (ถังขยะสีแดง) / Reactivate */}
                    {dish.is_active ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRemovingDish(dish);
                        }}
                        className="p-1 text-red-500 hover:text-red-700 hover:scale-110 transition cursor-pointer"
                        title="Remove dish"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" x2="10" y1="11" y2="17" />
                          <line x1="14" x2="14" y1="11" y2="17" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReactivate(dish);
                        }}
                        disabled={reactivatingId === dish.id}
                        className="p-1 text-green-600 hover:text-green-800 hover:scale-110 transition cursor-pointer"
                        title="Restore dish"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                        </svg>
                      </button>
                    )}
                  </div>
                ) : (
                  <span
                    className="text-gray-400 text-xs"
                    title="Staff view only"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mx-auto h-4 w-4"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedDish && (
        <DishDetailModal
          dish={selectedDish}
          onClose={() => setSelectedDish(null)}
        />
      )}
      {editingDishId && (
        <DishDialog
          dishId={editingDishId}
          onClose={() => setEditingDishId(null)}
          onSaved={() => setInternalRefresh((k) => k + 1)}
        />
      )}
      {removingDish && (
        <DeleteConfirmDialog
          dishName={removingDish.name}
          onClose={() => setRemovingDish(null)}
          onConfirm={handleConfirmRemove}
        />
      )}
    </>
  );
}

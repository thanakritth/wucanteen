"use client";
import Modal from "@/components/Modal";
import type { DishRow } from "@/components/DishTable";
export default function DishDetailModal({
  dish, onClose,
}: {
  dish: DishRow; onClose: () => void;
}) {
  return (
    <Modal title={dish.name} onClose={onClose} maxWidth="max-w-lg">
      {!dish.is_active && (
        <div className="mb-4 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600">
          This dish is currently hidden from the public menu.
        </div>
      )}
      {dish.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dish.image_url}  alt={dish.name} className="mb-4 h-56 w-full rounded-lg object-cover"
        />
      ) : (
        <div
          className="mb-4 flex h-56 w-full items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400"
        >
          No photo
        </div>
      )}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-lg font-semibold text-gray-900">
          ฿{dish.price}
        </span>
        <span className="text-sm text-gray-500">{dish.categories?.name}</span>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {!!dish.spice_level && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            {"🌶️ ".repeat(dish.spice_level)}
          </span>
        )}
        {!!dish.sugar_level && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            {"🍯 ".repeat(dish.sugar_level)}
          </span>
        )}
        {dish.calories != null && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {dish.calories} kcal
          </span>
        )}
        {dish.chefs?.name && (
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
            Chef {dish.chefs.name}
          </span>
        )}
      </div>
      <div className="mb-4">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Ingredients
        </h3>
        {dish.dish_ingredients && dish.dish_ingredients.length > 0 ? (
          <ul className="list-inside list-disc text-sm text-gray-700">
            {dish.dish_ingredients.map((ing, i) => (
              <li key={i}>{ing.ingredient}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">None listed</p>
        )}
      </div>
      <div>
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Allergens
        </h3>
        {dish.dish_allergens && dish.dish_allergens.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {dish.dish_allergens.map((a, i) => (
              <span
                key={i}
                className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800"
              >
                {a.allergen}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">None listed</p>
        )}
      </div>
    </Modal>
  );
}

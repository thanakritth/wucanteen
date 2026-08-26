"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { supabase } from "@/lib/supabase";
const ALLERGEN_OPTIONS = ["Egg", "Eggs", "Milk", "Milk (coconut)", "Peanuts", "Shellfish", "Coconut", "Chrysanthemum"];
type Category = { id: string; name: string };
type Chef = { id: string; name: string };
export default function DishDialog({
dishId,
onClose,
onSaved,
}: {
dishId?: string; // present = editing that dish, absent = creating a new one
onClose: () => void;
onSaved: () => void;
}) {
const isEditing = !!dishId; // true if editing an existing dish, false if creating a new one
const [categories, setCategories] = useState<Category[]>([]);
const [chefs, setChefs] = useState<Chef[]>([]);
const [categoryId, setCategoryId] = useState("");
const [chefId, setChefId] = useState("");
const [name, setName] = useState("");
const [price, setPrice] = useState("");
const [description, setDescription] = useState("");
const [calories, setCalories] = useState("");
const [spiceLevel, setSpiceLevel] = useState("");
const [sugarLevel, setSugarLevel] = useState("");
const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
const [photoFile, setPhotoFile] = useState<File | null>(null);
const [ingredients, setIngredients] = useState<string[]>([""]);
const [allergens, setAllergens] = useState<string[]>([]);
const [loadingDish, setLoadingDish] = useState(isEditing);
const [saving, setSaving] = useState(false);
const [error, setError] = useState<string | null>(null);
// Dropdown options — always needed, editing or not.
useEffect(() => {
let cancelled = false;
async function loadOptions() {
const catRes = await fetch("/api/categories");
const catData = await catRes.json();
const { data: chefRows } = await supabase.from("chefs").select("id, name").order("name");
if (!cancelled) {
setCategories(catData.categories ?? []);
setChefs(chefRows ?? []);
}
}
loadOptions();
return () => { cancelled = true; };
}, []);

// Only fires in edit mode — fetches the one dish being edited and fills every field from it.
  useEffect(() => {
    if (!dishId) return;
    let cancelled = false;

    async function loadDish() {
      const res = await fetch(`/api/dishes/${dishId}`);
      const data = await res.json();

      if (cancelled) return;
      if (!res.ok) {
        setError(data.error ?? "Couldn't load this dish.");
        setLoadingDish(false);
        return;
      }

      const dish = data.dish;
      setCategoryId(dish.category_id ?? "");
      setChefId(dish.chef_id ?? "");
      setName(dish.name ?? "");
      setPrice(String(dish.price ?? ""));
      setDescription(dish.description ?? "");
      setCalories(dish.calories?.toString() ?? "");
      setSpiceLevel(dish.spice_level?.toString() ?? "");
      setSugarLevel(dish.sugar_level?.toString() ?? "");
      setExistingImageUrl(dish.image_url ?? null);

      setIngredients(
        dish.dish_ingredients && dish.dish_ingredients.length > 0
          ? [...dish.dish_ingredients]
              .sort(
                (a: { sort_order: number }, b: { sort_order: number }) =>
                  a.sort_order - b.sort_order
              )
              .map((i: { ingredient: string }) => i.ingredient)
          : [""]
      );

      setAllergens(
        (dish.dish_allergens ?? []).map(
          (a: { allergen: string }) => a.allergen
        )
      );
      setLoadingDish(false);
    }

    loadDish();
    return () => {
      cancelled = true;
    };
  }, [dishId]);
function updateIngredient(index: number, value: string) {
setIngredients((prev) => prev.map((ing, i) => (i === index ? value : ing)));
}
function addIngredientRow() { setIngredients((prev) => [...prev, ""]); }
function removeIngredientRow(index: number) { setIngredients((prev) => prev.filter((_, i) => i !== index)); }
function toggleAllergen(allergen: string) {
setAllergens((prev) => (prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]));
}
async function handleSubmit(e: React.FormEvent) {
e.preventDefault();
setSaving(true);
setError(null);
try {
let imageUrl = existingImageUrl;
if (photoFile) {
const uploadBody = new FormData();
uploadBody.append("file", photoFile);
const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadBody });
const uploadData = await uploadRes.json();
if (!uploadRes.ok) throw new Error(uploadData.error ?? "Photo upload failed.");
imageUrl = uploadData.url;
}
const payload = {
category_id: categoryId,
chef_id: chefId || null,
name,
price: Number(price),
description: description || null,
calories: calories ? Number(calories) : null,
spice_level: spiceLevel === "" ? null : Number(spiceLevel),
sugar_level: sugarLevel === "" ? null : Number(sugarLevel),
image_url: imageUrl,
ingredients: ingredients.map((i) => i.trim()).filter(Boolean),
allergens,
};
const res = isEditing
? await fetch(`/api/dishes/${dishId}`, {
method: "PUT",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload),
})
: await fetch("/api/dishes", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload),
});
const data = await res.json();
if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
setSaving(false);
onSaved();
onClose();
} catch (err) {
setError(err instanceof Error ? err.message : "Something went wrong.");
setSaving(false);
}
}
return (
<Modal title={isEditing ? "Edit dish" : "Add a dish"} onClose={onClose} maxWidth="max-w-2xl">
{loadingDish ? (
<p className="text-gray-500">Loading dish...</p>
) : (
<form onSubmit={handleSubmit} className="space-y-5">
<div className="grid grid-cols-2 gap-4">
<div>
<label className="mb-1 block text-sm text-gray-600">Name</label>
<input required value={name} onChange={(e) => setName(e.target.value)}
className="w-full rounded border border-gray-300 px-3 py-2" />
</div>
<div>
<label className="mb-1 block text-sm text-gray-600">Price (฿)</label>
<input required type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
className="w-full rounded border border-gray-300 px-3 py-2" />
</div>
</div>
<div className="grid grid-cols-2 gap-4">
<div>
<label className="mb-1 block text-sm text-gray-600">Category</label>
<select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
className="w-full rounded border border-gray-300 px-3 py-2">
<option value="">Select...</option>
{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
</select>
</div>
<div>
<label className="mb-1 block text-sm text-gray-600">Recommended by</label>
<select value={chefId} onChange={(e) => setChefId(e.target.value)}
className="w-full rounded border border-gray-300 px-3 py-2">
<option value="">No chef</option>
{chefs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
</select>
</div>
</div>
<div>
<label className="mb-1 block text-sm text-gray-600">Description</label>
<textarea value={description} onChange={(e) => setDescription(e.target.value)}
className="w-full rounded border border-gray-300 px-3 py-2" rows={2} />
</div>
<div className="grid grid-cols-3 gap-4">
<div>
<label className="mb-1 block text-sm text-gray-600">Calories</label>
<input type="number" value={calories} onChange={(e) => setCalories(e.target.value)}
className="w-full rounded border border-gray-300 px-3 py-2" />
</div>
<div>
<label className="mb-1 block text-sm text-gray-600">Spice (0–2)</label>
<input type="number" min={0} max={2} value={spiceLevel} onChange={(e) => setSpiceLevel(e.target.value)}
className="w-full rounded border border-gray-300 px-3 py-2" />
</div>
<div>
<label className="mb-1 block text-sm text-gray-600">Sugar (0–2)</label>
<input type="number" min={0} max={2} value={sugarLevel} onChange={(e) => setSugarLevel(e.target.value)}
className="w-full rounded border border-gray-300 px-3 py-2" />
</div>
</div>
<div>
<label className="mb-1 block text-sm text-gray-600">Photo</label>
{existingImageUrl && !photoFile && (
// eslint-disable-next-line @next/next/no-img-element
<img src={existingImageUrl} alt="Current dish photo" className="mb-2 h-20 w-20 rounded object-cover" />
)}
<input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}

className="text-sm" />
</div>
<div>
<label className="mb-1 block text-sm text-gray-600">Ingredients</label>
{ingredients.map((ingredient, index) => (
<div key={index} className="mb-2 flex gap-2">
<input value={ingredient} onChange={(e) => updateIngredient(index, e.target.value)}
className="w-full rounded border border-gray-300 px-3 py-2" />
<button type="button" onClick={() => removeIngredientRow(index)} className="px-2 text-gray-400

hover:text-red-600">✕</button>

</div>
))}

<button type="button" onClick={addIngredientRow} className="text-sm text-purple-600 hover:text-purple-
700">+ Add ingredient</button>

</div>
<div>
<label className="mb-1 block text-sm text-gray-600">Allergens</label>
<div className="flex flex-wrap gap-3">
{ALLERGEN_OPTIONS.map((allergen) => (
<label key={allergen} className="flex items-center gap-1.5 text-sm">
<input type="checkbox" checked={allergens.includes(allergen)} onChange={() =>

toggleAllergen(allergen)} />
{allergen}
</label>
))}
</div>
</div>
{error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
<button type="submit" disabled={saving}
className="rounded bg-purple-600 px-5 py-2 font-medium text-white hover:bg-purple-700 disabled:opacity-50">
{saving ? "Saving..." : isEditing ? "Save changes" : "Add dish"}
</button>
</form>
)}
</Modal>
);
}
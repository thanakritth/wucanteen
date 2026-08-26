import { NextRequest, NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/session";
import { createAdminClient } from "@/lib/supabaseAdmin";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("dishes")
    .select(
      `id, name, price, calories, image_url, spice_level, sugar_level, is_active, categories (name), chefs (name), dish_ingredients (ingredient, sort_order), dish_allergens (allergen)`)
    .order("name", { referencedTable: "categories", ascending: false, })
    .order("sort_order", { referencedTable: "dish_ingredients", ascending: true, })
    .order("name", { referencedTable: "chefs", ascending: true, })
    .order("allergen", { referencedTable: "dish_allergens", ascending: true, });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ dishes: data });
}

export async function POST(request: NextRequest) {
  const staff = await getCurrentStaff();

  if (!staff) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const body = await request.json();
  const admin = createAdminClient();

  const { data: dish, error: dishError } = await admin
    .from("dishes")
    .insert({
      category_id: body.category_id,
      chef_id: body.chef_id ?? null,
      name: body.name,
      price: body.price,
      description: body.description ?? null,
      image_url: body.image_url ?? null,
      calories: body.calories ?? null,
      spice_level: body.spice_level ?? null,
      sugar_level: body.sugar_level ?? null,
    })
    .select("id")
    .single();

  if (dishError) {
    return NextResponse.json({ error: dishError.message }, { status: 500 });
  }

  const ingredients: string[] = (body.ingredients ?? []).filter(Boolean);
  if (ingredients.length > 0) {
    const { error } = await admin.from("dish_ingredients").insert(
      ingredients.map((ingredient: string, index: number) => ({
        dish_id: dish.id,
        ingredient,
        sort_order: index + 1,
      })),
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const allergens: string[] = body.allergens ?? [];
  if (allergens.length > 0) {
    const { error } = await admin.from("dish_allergens").insert(allergens.map((allergen: string) => ({ dish_id: dish.id, allergen })));
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: dish.id }, { status: 201 });
}
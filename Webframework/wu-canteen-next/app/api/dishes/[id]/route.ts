import { NextRequest, NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/session";
import { createAdminClient } from "@/lib/supabaseAdmin";
import { supabase } from "@/lib/supabase";
// GET - fetches a single dish by ID - No login check
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { data, error } = await supabase
    .from("dishes")
    .select(
      `id, category_id, chef_id, name, price, description, calories, spice_level, sugar_level, image_url, is_active,
dish_ingredients ( ingredient, sort_order ), dish_allergens ( allergen )`,
    )
    .eq("id", id)
    .single();
  if (error || !data) {
    return NextResponse.json({ error: "Dish not found." }, { status: 404 });
  }
  return NextResponse.json({ dish: data });
}
// PUT - updates all fields of a dish, including ingredients and allergens
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }
  if (staff.role !== "admin") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  const body = await request.json();
  const admin = createAdminClient();
  const { error: dishError } = await admin
    .from("dishes")
    .update({
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
    .eq("id", id);
  if (dishError) {
    return NextResponse.json({ error: dishError.message }, { status: 500 });
  }
  await admin.from("dish_ingredients").delete().eq("dish_id", id);
  await admin.from("dish_allergens").delete().eq("dish_id", id);
  const ingredients: string[] = (body.ingredients ?? []).filter(Boolean);
  if (ingredients.length > 0) {
    const { error } = await admin.from("dish_ingredients").insert(
      ingredients.map((ingredient: string, index: number) => ({
        dish_id: id,
        ingredient,
        sort_order: index + 1,
      })),
    );
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const allergens: string[] = body.allergens ?? [];
  if (allergens.length > 0) {
    const { error } = await admin
      .from("dish_allergens")
      .insert(allergens.map((allergen: string) => ({ dish_id: id, allergen })));
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
// PATCH, not PUT — this only ever changes one field.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }
  if (staff.role !== "admin") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  const { is_active } = await request.json();
  if (typeof is_active !== "boolean") {
    return NextResponse.json(
      { error: "is_active must be true or false." },
      { status: 400 },
    );
  }
  const admin = createAdminClient();
  const { error } = await admin
    .from("dishes")
    .update({ is_active })
    .eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

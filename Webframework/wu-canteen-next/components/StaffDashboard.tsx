"use client";

import { useState } from "react";
import DishTable from "@/components/DishTable";
import CategoryDialog from "@/components/CategoryDialog";
import DishDialog from "@/components/DishDialog";

export default function StaffDashboard() {
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showDishDialog, setShowDishDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleCreated() {
    setRefreshKey((k) => k + 1);
  } 
 
  return (
    <div>
      <div className="mb-4 flex justify-end gap-4">
        <button onClick={() => setShowCategoryDialog(true)} className="text-sm font-medium text-purple-600 hover:text-purple-700">+ New category</button>
        <button onClick={() => setShowDishDialog(true)} className="text-sm font-medium text-purple-600 hover:text-purple-700">+ New dish</button>
      </div>

      <DishTable refreshKey={refreshKey} />

      {showCategoryDialog && <CategoryDialog onClose={() => setShowCategoryDialog(false)} onCreated={handleCreated} />}
      {showDishDialog && <DishDialog onClose={() => setShowDishDialog(false)} onSaved={handleCreated} />}
    </div>
  );
}
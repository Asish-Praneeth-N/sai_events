"use client";

import { useState, useTransition } from "react";
import { Category, Subcategory, ServiceItem } from "@/lib/types";
import { deleteCategory, deleteSubcategory } from "@/app/admin/catalog/actions";
import CategoryForm from "./CategoryForm";
import SubcategoryForm from "./SubcategoryForm";
import ServiceItemForm from "./ServiceItemForm";
import CatalogCard from "./CatalogCard";

interface CatalogListProps {
  categories: Category[];
  subcategories: Subcategory[];
  items: (ServiceItem & { media?: string[] })[];
}

export default function CatalogList({
  categories,
  subcategories,
  items,
}: CatalogListProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    categories[0]?.id || ""
  );

  const [isPending, startTransition] = useTransition();

  // Modal State Controls
  const [activeCategoryModal, setActiveCategoryModal] = useState<Category | null | "new">(null);
  const [activeSubcategoryModal, setActiveSubcategoryModal] = useState<Subcategory | null | "new">(null);
  const [activeItemModal, setActiveItemModal] = useState<(ServiceItem & { media?: string[] }) | null | "new">(null);

  const activeCategory = categories.find((cat) => cat.id === activeCategoryId);
  
  const filteredSubcategories = subcategories.filter(
    (sub) => sub.category_id === activeCategoryId
  );

  const handleDeleteCategory = (cat: Category) => {
    if (
      confirm(
        `Are you sure you want to delete Category "${cat.name}"? This soft-deletes the category but keeps database references.`
      )
    ) {
      startTransition(async () => {
        try {
          await deleteCategory(cat.id);
          if (activeCategoryId === cat.id) {
            setActiveCategoryId(categories.filter((c) => c.id !== cat.id)[0]?.id || "");
          }
        } catch (err: any) {
          alert(err.message || "Failed to delete category.");
        }
      });
    }
  };

  const handleDeleteSubcategory = (sub: Subcategory) => {
    if (confirm(`Are you sure you want to delete Subcategory "${sub.name}"?`)) {
      startTransition(async () => {
        try {
          await deleteSubcategory(sub.id);
        } catch (err: any) {
          alert(err.message || "Failed to delete subcategory.");
        }
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[60vh] text-sm text-foreground">
      {/* 1. Left Sidebar Panel (Categories List) */}
      <div className="md:col-span-1 p-4 bg-surface border border-border/50 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <h3 className="font-heading font-bold text-foreground text-base">Categories</h3>
            <button
              onClick={() => setActiveCategoryModal("new")}
              className="text-xs px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl transition shadow-md shadow-purple-500/10 font-semibold cursor-pointer"
            >
              Add New
            </button>
          </div>

          <div className="space-y-1">
            {categories.map((cat) => {
              const isActive = cat.id === activeCategoryId;
              return (
                <div
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`w-full px-3.5 py-2.5 rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 group ${
                    isActive
                      ? "bg-purple-50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30 text-purple-600 dark:text-purple-400 font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
                  }`}
                >
                  <span>{cat.name}</span>
                  
                  {/* Inline Controls */}
                  <div className="opacity-0 group-hover:opacity-100 flex gap-2.5 transition duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCategoryModal(cat);
                      }}
                      className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(cat);
                      }}
                      disabled={isPending}
                      className="text-xs font-bold text-red-500 hover:text-red-400"
                    >
                      Del
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Right Workspace Panel (Subcategories & Items Grid) */}
      <div className="md:col-span-3 p-5 bg-surface border border-border/50 rounded-2xl shadow-sm space-y-6 hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="space-y-0.5">
            <h2 className="font-heading font-extrabold text-lg text-foreground">
              {activeCategory?.name || "No Category Selected"}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {activeCategory?.description || "Configure subcategories and packages"}
            </p>
          </div>

          {activeCategoryId && (
            <div className="flex gap-2">
              <button
                onClick={() => setActiveSubcategoryModal("new")}
                className="px-3.5 py-2 bg-surface hover:bg-surface-raised border border-border hover:border-zinc-300 dark:hover:border-zinc-700 text-foreground rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Add Subcategory
              </button>
              <button
                onClick={() => setActiveItemModal("new")}
                className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-md shadow-purple-500/10"
              >
                Add Service Item
              </button>
            </div>
          )}
        </div>

        {/* Catalog List Hierarchy */}
        {activeCategoryId && (
          <div className="space-y-8 animate-fade-in">
            {filteredSubcategories.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/10">
                No subcategories created yet. Add a subcategory to organize your service items.
              </div>
            ) : (
              filteredSubcategories.map((sub) => {
                const subcategoryItems = items.filter(
                  (item) => item.subcategory_id === sub.id
                );

                return (
                  <div key={sub.id} className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-bold text-foreground text-sm">
                          {sub.name}
                        </h3>
                        <span className="text-[10px] text-muted-foreground font-bold bg-muted px-2 py-0.5 rounded-md">
                          {subcategoryItems.length} {subcategoryItems.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setActiveSubcategoryModal(sub)}
                          className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSubcategory(sub)}
                          disabled={isPending}
                          className="text-xs font-bold text-red-500 hover:text-red-400 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {subcategoryItems.length === 0 ? (
                      <div className="text-xs text-muted-foreground py-6 italic bg-muted/5 border border-dashed border-border/30 rounded-xl px-4">
                        No service items added under this subcategory.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {subcategoryItems.map((item) => (
                          <CatalogCard
                            key={item.id}
                            item={item}
                            onEdit={setActiveItemModal}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 3. Modal Forms Overlays */}
      {activeCategoryModal && (
        <CategoryForm
          category={activeCategoryModal === "new" ? null : activeCategoryModal}
          onClose={() => setActiveCategoryModal(null)}
        />
      )}

      {activeSubcategoryModal && (
        <SubcategoryForm
          subcategory={activeSubcategoryModal === "new" ? null : activeSubcategoryModal}
          categories={categories}
          defaultCategoryId={activeCategoryId}
          onClose={() => setActiveSubcategoryModal(null)}
        />
      )}

      {activeItemModal && (
        <ServiceItemForm
          item={activeItemModal === "new" ? null : activeItemModal}
          subcategories={filteredSubcategories}
          onClose={() => setActiveItemModal(null)}
        />
      )}
    </div>
  );
}

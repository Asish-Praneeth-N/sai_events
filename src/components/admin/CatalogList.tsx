"use client";

import { useState, useTransition } from "react";
import { MainCategory, Category, Subcategory, ServiceItem } from "@/lib/types";
import { deleteMainCategory, deleteCategory, deleteSubcategory } from "@/app/admin/catalog/actions";
import MainCategoryForm from "./MainCategoryForm";
import CategoryForm from "./CategoryForm";
import SubcategoryForm from "./SubcategoryForm";
import ServiceItemForm from "./ServiceItemForm";
import CatalogCard from "./CatalogCard";
import { Layers, BookOpen, FolderOpen, Tag, Plus, Edit3, Trash } from "lucide-react";

interface CatalogListProps {
  mainCategories: MainCategory[];
  categories: Category[];
  subcategories: Subcategory[];
  items: (ServiceItem & { media?: string[] })[];
}

export default function CatalogList({
  mainCategories,
  categories,
  subcategories,
  items,
}: CatalogListProps) {
  const [activeMainCategoryId, setActiveMainCategoryId] = useState<string>(mainCategories[0]?.id || "");
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [activeMainCategoryModal, setActiveMainCategoryModal] = useState<MainCategory | null | "new">(null);
  const [activeCategoryModal, setActiveCategoryModal] = useState<Category | null | "new">(null);
  const [activeSubcategoryModal, setActiveSubcategoryModal] = useState<Subcategory | null | "new">(null);
  const [activeItemModal, setActiveItemModal] = useState<(ServiceItem & { media?: string[] }) | null | "new">(null);

  // Filters
  const filteredCategories = activeMainCategoryId
    ? categories.filter((cat) => cat.main_category_id === activeMainCategoryId)
    : categories;

  const activeCatId = activeCategoryId || filteredCategories[0]?.id || "";

  const filteredSubcategories = activeCatId
    ? subcategories.filter((sub) => sub.category_id === activeCatId)
    : [];

  const activeSubcategory = subcategories.find((sub) => sub.id === activeSubcategoryId) || filteredSubcategories[0];
  const activeSubId = activeSubcategory?.id || "";

  const filteredItems = activeSubId
    ? items.filter((item) => item.subcategory_id === activeSubId)
    : [];

  const handleDeleteMainCategory = (mc: MainCategory) => {
    if (confirm(`Delete Main Category "${mc.name}"?`)) {
      startTransition(async () => {
        try {
          await deleteMainCategory(mc.id);
          if (activeMainCategoryId === mc.id) {
            setActiveMainCategoryId(mainCategories.filter((m) => m.id !== mc.id)[0]?.id || "");
          }
        } catch (err: any) {
          alert("Failed to delete main category.");
        }
      });
    }
  };

  const handleDeleteCategory = (cat: Category) => {
    if (confirm(`Delete Category "${cat.name}"?`)) {
      startTransition(async () => {
        try {
          await deleteCategory(cat.id);
          if (activeCategoryId === cat.id) {
            setActiveCategoryId("");
          }
        } catch (err: any) {
          alert("Failed to delete category.");
        }
      });
    }
  };

  const handleDeleteSubcategory = (sub: Subcategory) => {
    if (confirm(`Delete Subcategory "${sub.name}"?`)) {
      startTransition(async () => {
        try {
          await deleteSubcategory(sub.id);
          if (activeSubcategoryId === sub.id) {
            setActiveSubcategoryId("");
          }
        } catch (err: any) {
          alert("Failed to delete subcategory.");
        }
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[65vh] text-sm text-foreground select-none">
      
      {/* Level 1: Main Category Tree */}
      <div className="lg:col-span-1 p-4 bg-surface border border-border rounded-2xl flex flex-col justify-between hover:shadow transition duration-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <h3 className="font-heading font-bold text-foreground text-xs flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-accent-gold" />
              <span>Main Categories</span>
            </h3>
            <button
              onClick={() => setActiveMainCategoryModal("new")}
              className="text-[10px] px-2 py-0.5 bg-accent-gold text-black font-bold rounded hover:scale-105 transition cursor-pointer"
            >
              + New
            </button>
          </div>

          <div className="space-y-1 max-h-[50vh] overflow-y-auto scrollbar-none">
            {mainCategories.map((mc) => {
              const active = mc.id === activeMainCategoryId;
              return (
                <div
                  key={mc.id}
                  onClick={() => {
                    setActiveMainCategoryId(mc.id);
                    setActiveCategoryId("");
                    setActiveSubcategoryId("");
                  }}
                  className={`w-full px-3 py-2 rounded-xl cursor-pointer flex items-center justify-between transition group text-xs ${
                    active
                      ? "bg-accent-gold/10 border border-accent-gold/40 text-accent-gold font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-raised border border-transparent"
                  }`}
                >
                  <span className="truncate">{mc.name}</span>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1.5 shrink-0 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveMainCategoryModal(mc); }}
                      className="text-muted-foreground hover:text-accent-gold"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteMainCategory(mc); }}
                      className="text-muted-foreground hover:text-red-400"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Level 2: Category Tree */}
      <div className="lg:col-span-1 p-4 bg-surface border border-border rounded-2xl flex flex-col justify-between hover:shadow transition duration-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <h3 className="font-heading font-bold text-foreground text-xs flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-accent-gold" />
              <span>Categories</span>
            </h3>
            <button
              onClick={() => setActiveCategoryModal("new")}
              className="text-[10px] px-2 py-0.5 bg-accent-gold text-black font-bold rounded hover:scale-105 transition cursor-pointer"
            >
              + New
            </button>
          </div>

          <div className="space-y-1 max-h-[50vh] overflow-y-auto scrollbar-none">
            {filteredCategories.map((cat) => {
              const active = cat.id === activeCatId;
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setActiveCategoryId(cat.id);
                    setActiveSubcategoryId("");
                  }}
                  className={`w-full px-3 py-2 rounded-xl cursor-pointer flex items-center justify-between transition group text-xs ${
                    active
                      ? "bg-accent-gold/10 border border-accent-gold/40 text-accent-gold font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-raised border border-transparent"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1.5 shrink-0 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveCategoryModal(cat); }}
                      className="text-muted-foreground hover:text-accent-gold"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }}
                      className="text-muted-foreground hover:text-red-400"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Level 3: Subcategories Tree */}
      <div className="lg:col-span-1 p-4 bg-surface border border-border rounded-2xl flex flex-col justify-between hover:shadow transition duration-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <h3 className="font-heading font-bold text-foreground text-xs flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-accent-gold" />
              <span>Subcategories</span>
            </h3>
            {activeCatId && (
              <button
                onClick={() => setActiveSubcategoryModal("new")}
                className="text-[10px] px-2 py-0.5 bg-accent-gold text-black font-bold rounded hover:scale-105 transition cursor-pointer"
              >
                + New
              </button>
            )}
          </div>

          <div className="space-y-1 max-h-[50vh] overflow-y-auto scrollbar-none">
            {filteredSubcategories.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic text-center py-6">No subcategories</p>
            ) : (
              filteredSubcategories.map((sub) => {
                const active = sub.id === activeSubId;
                return (
                  <div
                    key={sub.id}
                    onClick={() => setActiveSubcategoryId(sub.id)}
                    className={`w-full px-3 py-2 rounded-xl cursor-pointer flex items-center justify-between transition group text-xs ${
                      active
                        ? "bg-accent-gold/10 border border-accent-gold/40 text-accent-gold font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-raised border border-transparent"
                    }`}
                  >
                    <span className="truncate">{sub.name}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1.5 shrink-0 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveSubcategoryModal(sub); }}
                        className="text-muted-foreground hover:text-accent-gold"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteSubcategory(sub); }}
                        className="text-muted-foreground hover:text-red-400"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Level 4: Service Items Grid */}
      <div className="lg:col-span-2 p-5 bg-surface border border-border rounded-2xl flex flex-col justify-between hover:shadow transition duration-200">
        <div className="space-y-6 flex-1">
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <div>
              <h4 className="font-heading font-extrabold text-sm text-foreground flex items-center gap-2">
                <Tag className="w-4 h-4 text-accent-gold" />
                <span>{activeSubcategory?.name || "Level 4: Service Items"}</span>
              </h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {activeSubcategory?.description || "Select subcategory to view package items"}
              </p>
            </div>
            {activeSubId && (
              <button
                onClick={() => setActiveItemModal("new")}
                className="px-3 py-1.5 bg-accent-gold text-black font-bold rounded-xl text-xs hover:scale-102 transition cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            )}
          </div>

          {activeSubId && (
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  No service items found. Click &quot;Add Item&quot; to build catalog nodes.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredItems.map((item) => (
                    <CatalogCard
                      key={item.id}
                      item={item}
                      onEdit={setActiveItemModal}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Overlays Forms Modals */}
      {activeMainCategoryModal && (
        <MainCategoryForm
          mainCategory={activeMainCategoryModal === "new" ? null : activeMainCategoryModal}
          onClose={() => setActiveMainCategoryModal(null)}
        />
      )}

      {activeCategoryModal && (
        <CategoryForm
          category={activeCategoryModal === "new" ? null : activeCategoryModal}
          onClose={() => setActiveCategoryModal(null)}
        />
      )}

      {activeSubcategoryModal && (
        <SubcategoryForm
          subcategory={activeSubcategoryModal === "new" ? null : activeSubcategoryModal}
          categories={filteredCategories}
          defaultCategoryId={activeCatId}
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

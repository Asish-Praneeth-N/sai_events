"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  MainCategory,
  Category,
  Subcategory,
  ServiceItem,
} from "@/lib/types";

import {
  deleteMainCategory,
  deleteCategory,
  deleteSubcategory,
} from "@/app/admin/catalog/actions";

import MainCategoryForm from "./MainCategoryForm";
import CategoryForm from "./CategoryForm";
import SubcategoryForm from "./SubcategoryForm";
import ServiceItemForm from "./ServiceItemForm";
import CatalogCard from "./CatalogCard";

import {
  Layers3,
  BookOpen,
  FolderOpen,
  PackageSearch,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  Boxes,
  CircleDot,
} from "lucide-react";

interface CatalogListProps {
  mainCategories: MainCategory[];
  categories: Category[];
  subcategories: Subcategory[];
  items: (ServiceItem & {
    media?: string[];
  })[];
}

export default function CatalogList({
  mainCategories,
  categories,
  subcategories,
  items,
}: CatalogListProps) {
  const [
    activeMainCategoryId,
    setActiveMainCategoryId,
  ] = useState<string>(
    mainCategories[0]?.id || ""
  );

  const [
    activeCategoryId,
    setActiveCategoryId,
  ] = useState<string>("");

  const [
    activeSubcategoryId,
    setActiveSubcategoryId,
  ] = useState<string>("");

  const [isPending, startTransition] =
    useTransition();

  // Modals state
  const [
    activeMainCategoryModal,
    setActiveMainCategoryModal,
  ] = useState<
    MainCategory | null | "new"
  >(null);

  const [
    activeCategoryModal,
    setActiveCategoryModal,
  ] = useState<
    Category | null | "new"
  >(null);

  const [
    activeSubcategoryModal,
    setActiveSubcategoryModal,
  ] = useState<
    Subcategory | null | "new"
  >(null);

  const [
    activeItemModal,
    setActiveItemModal,
  ] = useState<
    | (ServiceItem & {
      media?: string[];
    })
    | null
    | "new"
  >(null);

  /* ==========================================================================
     FILTERS
  ========================================================================== */

  const filteredCategories =
    activeMainCategoryId
      ? categories.filter(
        (cat) =>
          cat.main_category_id ===
          activeMainCategoryId
      )
      : categories;

  const activeCatId =
    activeCategoryId ||
    filteredCategories[0]?.id ||
    "";

  const filteredSubcategories =
    activeCatId
      ? subcategories.filter(
        (sub) =>
          sub.category_id ===
          activeCatId
      )
      : [];

  const activeSubcategory =
    subcategories.find(
      (sub) =>
        sub.id ===
        activeSubcategoryId
    ) || filteredSubcategories[0];

  const activeSubId =
    activeSubcategory?.id || "";

  const filteredItems =
    activeSubId
      ? items.filter(
        (item) =>
          item.subcategory_id ===
          activeSubId
      )
      : [];

  const activeMainCategory =
    mainCategories.find(
      (mc) =>
        mc.id ===
        activeMainCategoryId
    );

  const activeCategory =
    categories.find(
      (cat) =>
        cat.id === activeCatId
    );

  /* ==========================================================================
     DELETE OPERATIONS
  ========================================================================== */

  const handleDeleteMainCategory = (
    mc: MainCategory
  ) => {
    if (
      confirm(
        `Delete Main Category "${mc.name}"?`
      )
    ) {
      startTransition(async () => {
        try {
          await deleteMainCategory(mc.id);

          if (
            activeMainCategoryId === mc.id
          ) {
            setActiveMainCategoryId(
              mainCategories.filter(
                (m) => m.id !== mc.id
              )[0]?.id || ""
            );
          }
        } catch (err: any) {
          alert(
            "Failed to delete main category."
          );
        }
      });
    }
  };

  const handleDeleteCategory = (
    cat: Category
  ) => {
    if (
      confirm(
        `Delete Category "${cat.name}"?`
      )
    ) {
      startTransition(async () => {
        try {
          await deleteCategory(cat.id);

          if (
            activeCategoryId === cat.id
          ) {
            setActiveCategoryId("");
          }
        } catch (err: any) {
          alert(
            "Failed to delete category."
          );
        }
      });
    }
  };

  const handleDeleteSubcategory = (
    sub: Subcategory
  ) => {
    if (
      confirm(
        `Delete Subcategory "${sub.name}"?`
      )
    ) {
      startTransition(async () => {
        try {
          await deleteSubcategory(
            sub.id
          );

          if (
            activeSubcategoryId ===
            sub.id
          ) {
            setActiveSubcategoryId("");
          }
        } catch (err: any) {
          alert(
            "Failed to delete subcategory."
          );
        }
      });
    }
  };

  return (
    <div className="space-y-4 text-sm text-foreground">
      {/* ================================================================
          CURRENT PATH
      ================================================================ */}

      <section className="flex flex-col gap-3 border border-border bg-surface/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
          <span className="shrink-0 text-[6px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
            Current Path
          </span>

          <span className="h-3 w-px shrink-0 bg-border" />

          <PathNode
            value={
              activeMainCategory?.name ||
              "Main Category"
            }
          />

          <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/30" />

          <PathNode
            value={
              activeCategory?.name ||
              "Category"
            }
          />

          <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/30" />

          <PathNode
            value={
              activeSubcategory?.name ||
              "Subcategory"
            }
            active
          />
        </div>

        {isPending && (
          <span className="flex shrink-0 items-center gap-2 text-[6px] font-bold uppercase tracking-[0.16em] text-accent-gold">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-gold opacity-30" />

              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-gold" />
            </span>

            Updating Catalog
          </span>
        )}
      </section>

      {/* ================================================================
          MAIN WORKSPACE
      ================================================================ */}

      <div className="grid min-h-[65vh] grid-cols-1 border border-border bg-surface/20 xl:grid-cols-[220px_220px_220px_minmax(0,1fr)]">
        {/* ==============================================================
            LEVEL 1
        ============================================================== */}

        <HierarchyColumn
          number="01"
          title="Main Categories"
          subtitle={`${mainCategories.length} nodes`}
          icon={<Layers3 />}
          onAdd={() =>
            setActiveMainCategoryModal(
              "new"
            )
          }
        >
          {mainCategories.map((mc) => {
            const active =
              mc.id ===
              activeMainCategoryId;

            return (
              <HierarchyItem
                key={mc.id}
                label={mc.name}
                active={active}
                onClick={() => {
                  setActiveMainCategoryId(
                    mc.id
                  );

                  setActiveCategoryId("");
                  setActiveSubcategoryId("");
                }}
                onEdit={(e) => {
                  e.stopPropagation();

                  setActiveMainCategoryModal(
                    mc
                  );
                }}
                onDelete={(e) => {
                  e.stopPropagation();

                  handleDeleteMainCategory(
                    mc
                  );
                }}
              />
            );
          })}
        </HierarchyColumn>

        {/* ==============================================================
            LEVEL 2
        ============================================================== */}

        <HierarchyColumn
          number="02"
          title="Categories"
          subtitle={`${filteredCategories.length} nodes`}
          icon={<BookOpen />}
          onAdd={() =>
            setActiveCategoryModal("new")
          }
        >
          {filteredCategories.length ===
            0 ? (
            <EmptyHierarchy
              message="No categories"
            />
          ) : (
            filteredCategories.map(
              (cat) => {
                const active =
                  cat.id === activeCatId;

                return (
                  <HierarchyItem
                    key={cat.id}
                    label={cat.name}
                    active={active}
                    onClick={() => {
                      setActiveCategoryId(
                        cat.id
                      );

                      setActiveSubcategoryId(
                        ""
                      );
                    }}
                    onEdit={(e) => {
                      e.stopPropagation();

                      setActiveCategoryModal(
                        cat
                      );
                    }}
                    onDelete={(e) => {
                      e.stopPropagation();

                      handleDeleteCategory(
                        cat
                      );
                    }}
                  />
                );
              }
            )
          )}
        </HierarchyColumn>

        {/* ==============================================================
            LEVEL 3
        ============================================================== */}

        <HierarchyColumn
          number="03"
          title="Subcategories"
          subtitle={`${filteredSubcategories.length} nodes`}
          icon={<FolderOpen />}
          onAdd={
            activeCatId
              ? () =>
                setActiveSubcategoryModal(
                  "new"
                )
              : undefined
          }
        >
          {filteredSubcategories.length ===
            0 ? (
            <EmptyHierarchy
              message="No subcategories"
            />
          ) : (
            filteredSubcategories.map(
              (sub) => {
                const active =
                  sub.id === activeSubId;

                return (
                  <HierarchyItem
                    key={sub.id}
                    label={sub.name}
                    active={active}
                    onClick={() =>
                      setActiveSubcategoryId(
                        sub.id
                      )
                    }
                    onEdit={(e) => {
                      e.stopPropagation();

                      setActiveSubcategoryModal(
                        sub
                      );
                    }}
                    onDelete={(e) => {
                      e.stopPropagation();

                      handleDeleteSubcategory(
                        sub
                      );
                    }}
                  />
                );
              }
            )
          )}
        </HierarchyColumn>

        {/* ==============================================================
            LEVEL 4
        ============================================================== */}

        <section className="flex min-h-[520px] min-w-0 flex-col">
          <header className="flex min-h-[74px] items-center justify-between gap-4 border-b border-border bg-background/15 px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-accent-gold/20 bg-accent-gold/[0.04] text-accent-gold">
                <PackageSearch className="h-3.5 w-3.5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[6px] font-bold text-muted-foreground/40">
                    04
                  </span>

                  <span className="text-[6px] font-bold uppercase tracking-[0.2em] text-accent-gold">
                    Service Items
                  </span>
                </div>

                <h3 className="mt-1 truncate text-[10px] font-semibold text-foreground">
                  {activeSubcategory?.name ||
                    "Select Subcategory"}
                </h3>
              </div>
            </div>

            {activeSubId && (
              <button
                type="button"
                onClick={() =>
                  setActiveItemModal("new")
                }
                className="
                  inline-flex h-8
                  shrink-0 items-center
                  gap-1.5
                  bg-accent-gold
                  px-3
                  text-[7px] font-bold
                  uppercase tracking-[0.12em]
                  text-black

                  transition-all

                  hover:brightness-110
                "
              >
                <Plus className="h-3 w-3" />
                Add Item
              </button>
            )}
          </header>

          {/* SUBCATEGORY CONTEXT */}

          {activeSubcategory && (
            <div className="border-b border-border/60 px-5 py-3">
              <p className="text-[7px] leading-4 text-muted-foreground">
                {activeSubcategory.description ||
                  "Service items associated with this subcategory."}
              </p>
            </div>
          )}

          {/* SERVICE ITEMS */}

          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            {!activeSubId ? (
              <CatalogEmptyState
                title="Choose a subcategory"
                description="Select a node from the hierarchy to inspect its service items."
              />
            ) : filteredItems.length ===
              0 ? (
              <CatalogEmptyState
                title="No service items"
                description='This catalog branch is empty. Use "Add Item" to create its first service.'
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 2xl:grid-cols-2">
                {filteredItems.map(
                  (item) => (
                    <CatalogCard
                      key={item.id}
                      item={item}
                      onEdit={
                        setActiveItemModal
                      }
                    />
                  )
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ================================================================
          MODALS
      ================================================================ */}

      {activeMainCategoryModal && (
        <MainCategoryForm
          mainCategory={
            activeMainCategoryModal ===
              "new"
              ? null
              : activeMainCategoryModal
          }
          onClose={() =>
            setActiveMainCategoryModal(
              null
            )
          }
        />
      )}

      {activeCategoryModal && (
        <CategoryForm
          category={
            activeCategoryModal === "new"
              ? null
              : activeCategoryModal
          }
          mainCategoryId={
            activeMainCategoryId
          }
          onClose={() =>
            setActiveCategoryModal(null)
          }
        />
      )}

      {activeSubcategoryModal && (
        <SubcategoryForm
          subcategory={
            activeSubcategoryModal ===
              "new"
              ? null
              : activeSubcategoryModal
          }
          categories={
            filteredCategories
          }
          defaultCategoryId={
            activeCatId
          }
          onClose={() =>
            setActiveSubcategoryModal(
              null
            )
          }
        />
      )}

      {activeItemModal && (
        <ServiceItemForm
          item={
            activeItemModal === "new"
              ? null
              : activeItemModal
          }
          subcategories={
            filteredSubcategories
          }
          onClose={() =>
            setActiveItemModal(null)
          }
        />
      )}
    </div>
  );
}

/* ============================================================================
   HIERARCHY COLUMN
============================================================================ */

function HierarchyColumn({
  number,
  title,
  subtitle,
  icon,
  onAdd,
  children,
}: {
  number: string;
  title: string;
  subtitle: string;
  icon: React.ReactElement;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-[220px] flex-col border-b border-border xl:min-h-[520px] xl:border-b-0 xl:border-r">
      <header className="flex min-h-[74px] items-center justify-between gap-3 border-b border-border bg-background/15 px-3.5 py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="
              shrink-0 text-accent-gold

              [&>svg]:h-3.5
              [&>svg]:w-3.5
            "
          >
            {icon}
          </span>

          <div className="min-w-0">
            <span className="block font-mono text-[6px] text-muted-foreground/40">
              LEVEL {number}
            </span>

            <h3 className="mt-0.5 truncate text-[8px] font-bold uppercase tracking-[0.13em] text-foreground">
              {title}
            </h3>

            <span className="mt-0.5 block text-[6px] text-muted-foreground/50">
              {subtitle}
            </span>
          </div>
        </div>

        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="
              flex h-7 w-7
              shrink-0 items-center
              justify-center

              border border-accent-gold/20
              bg-accent-gold/[0.04]
              text-accent-gold

              transition-colors

              hover:bg-accent-gold
              hover:text-black
            "
            title={`Add ${title}`}
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
      </header>

      <div className="flex-1 space-y-1 overflow-y-auto p-2 scrollbar-none">
        {children}
      </div>
    </section>
  );
}

/* ============================================================================
   HIERARCHY ITEM
============================================================================ */

function HierarchyItem({
  label,
  active,
  onClick,
  onEdit,
  onDelete,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  onEdit: (
    e: React.MouseEvent
  ) => void;
  onDelete: (
    e: React.MouseEvent
  ) => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        group relative flex
        min-h-[38px]
        cursor-pointer
        items-center justify-between
        gap-2
        border
        px-3 py-2

        transition-all

        ${active
          ? `
              border-accent-gold/20
              bg-accent-gold/[0.045]
              text-accent-gold
            `
          : `
              border-transparent
              text-muted-foreground

              hover:border-border
              hover:bg-background/30
              hover:text-foreground
            `
        }
      `}
    >
      {active && (
        <span className="absolute bottom-0 left-0 top-0 w-[2px] bg-accent-gold" />
      )}

      <div className="flex min-w-0 items-center gap-2">
        <CircleDot
          className={`
            h-2.5 w-2.5 shrink-0

            ${active
              ? "text-accent-gold"
              : "text-muted-foreground/30"
            }
          `}
        />

        <span className="truncate text-[8px] font-semibold">
          {label}
        </span>
      </div>

      <div
        className={`
          flex shrink-0
          items-center
          border border-border
          bg-surface
          transition-opacity

          ${active
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100"
          }
        `}
      >
        <button
          type="button"
          onClick={onEdit}
          className="flex h-6 w-6 items-center justify-center text-muted-foreground hover:bg-accent-gold/[0.05] hover:text-accent-gold"
          title="Edit"
        >
          <Pencil className="h-2.5 w-2.5" />
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="flex h-6 w-6 items-center justify-center border-l border-border text-muted-foreground hover:bg-red-500/[0.05] hover:text-red-500"
          title="Delete"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   SMALL HELPERS
============================================================================ */

function PathNode({
  value,
  active = false,
}: {
  value: string;
  active?: boolean;
}) {
  return (
    <span
      className={`
        max-w-[160px] shrink-0 truncate
        text-[7px] font-semibold

        ${active
          ? "text-accent-gold"
          : "text-foreground"
        }
      `}
    >
      {value}
    </span>
  );
}

function EmptyHierarchy({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex min-h-[100px] flex-col items-center justify-center text-center">
      <Boxes className="h-3.5 w-3.5 text-muted-foreground/25" />

      <span className="mt-2 text-[7px] text-muted-foreground/50">
        {message}
      </span>
    </div>
  );
}

function CatalogEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center border border-dashed border-border/70 px-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center border border-border bg-background/30 text-muted-foreground">
        <PackageSearch className="h-4 w-4" />
      </div>

      <h3
        className="mt-4 text-base font-normal text-foreground"
        style={{
          fontFamily:
            '"Playfair Display", serif',
        }}
      >
        {title}
      </h3>

      <p className="mt-1 max-w-[260px] text-[7px] leading-4 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
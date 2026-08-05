"use client";

import {
  useState,
  useTransition,
} from "react";

import { saveCategory } from "@/app/admin/catalog/actions";
import { Category } from "@/lib/types";

import {
  X,
  FolderPlus,
  FolderPen,
  Type,
  AlignLeft,
  ListOrdered,
  ToggleRight,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";

interface CategoryFormProps {
  category?: Category | null;

  // Currently selected main category
  mainCategoryId?: string;

  onClose: () => void;
}

export default function CategoryForm({
  category,
  mainCategoryId,
  onClose,
}: CategoryFormProps) {
  const [isPending, startTransition] =
    useTransition();

  const [name, setName] = useState(
    category?.name || ""
  );

  const [
    description,
    setDescription,
  ] = useState(
    category?.description || ""
  );

  const [imageUrl, setImageUrl] =
    useState(
      category?.image_url || ""
    );

  const [isActive, setIsActive] =
    useState(
      category?.is_active ?? true
    );

  const [sortOrder, setSortOrder] =
    useState(
      category?.sort_order || 0
    );

  const [error, setError] =
    useState<string | null>(null);

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError(null);

    startTransition(async () => {
      try {
        await saveCategory({
          id: category?.id,

          // When editing keep existing link;
          // when creating use active main category.
          main_category_id:
            category?.main_category_id ??
            mainCategoryId ??
            undefined,

          name,
          description,
          image_url: imageUrl,
          is_active: isActive,
          sort_order: sortOrder,
        });

        onClose();
      } catch (err: any) {
        setError(
          err.message ||
            "Failed to save category."
        );
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-[3px] animate-fade-in">
      <div className="w-full max-w-[500px] overflow-hidden border border-border bg-surface shadow-2xl animate-scale-in">
        {/* ================================================================
            MODAL HEADER
        ================================================================ */}

        <header className="relative border-b border-border">
          <span className="absolute bottom-0 left-0 top-0 w-[2px] bg-accent-gold" />

          <div className="flex items-start justify-between gap-4 px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-accent-gold/20 bg-accent-gold/[0.04] text-accent-gold">
                {category ? (
                  <FolderPen className="h-4 w-4" />
                ) : (
                  <FolderPlus className="h-4 w-4" />
                )}
              </div>

              <div>
                <span className="block text-[6px] font-bold uppercase tracking-[0.22em] text-accent-gold">
                  Catalog / Level 02
                </span>

                <h3
                  className="mt-1 text-lg font-normal text-foreground"
                  style={{
                    fontFamily:
                      '"Playfair Display", serif',
                  }}
                >
                  {category
                    ? "Edit Category"
                    : "Create Category"}
                </h3>

                <p className="mt-1 text-[7px] leading-4 text-muted-foreground">
                  Configure this catalog
                  category and its operational
                  availability.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                flex h-8 w-8
                shrink-0 items-center
                justify-center

                border border-border

                text-muted-foreground

                transition-colors

                hover:border-red-500/20
                hover:bg-red-500/[0.04]
                hover:text-red-500
              "
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        {/* ================================================================
            ERROR
        ================================================================ */}

        {error && (
          <div className="mx-5 mt-5 flex items-start gap-2.5 border border-red-500/20 bg-red-500/[0.04] px-3.5 py-3 text-red-500 sm:mx-6">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />

            <span className="text-[8px] leading-4">
              {error}
            </span>
          </div>
        )}

        {/* ================================================================
            FORM
        ================================================================ */}

        <form
          onSubmit={handleSubmit}
          className="px-5 py-5 sm:px-6"
        >
          <div className="space-y-5">
            {/* NAME */}

            <FormField
              icon={<Type />}
              label="Category Name"
              required
            >
              <input
                type="text"
                required
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                placeholder="e.g. Photography, Food"
                className={inputClass}
              />
            </FormField>

            {/* DESCRIPTION */}

            <FormField
              icon={<AlignLeft />}
              label="Description"
            >
              <textarea
                rows={4}
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Brief description of the services in this category"
                className={`${inputClass} resize-none leading-5`}
              />
            </FormField>

            {/* SORT / STATUS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                icon={<ListOrdered />}
                label="Sort Order"
              >
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(
                      parseInt(
                        e.target.value
                      ) || 0
                    )
                  }
                  className={inputClass}
                />
              </FormField>

              <div>
                <div className="mb-2 flex items-center gap-1.5">
                  <ToggleRight className="h-3 w-3 text-accent-gold" />

                  <label className="text-[6px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Operational State
                  </label>
                </div>

                <label
                  className={`
                    flex h-[42px]
                    cursor-pointer
                    items-center
                    justify-between
                    border px-3.5

                    transition-colors

                    ${
                      isActive
                        ? `
                          border-emerald-500/20
                          bg-emerald-500/[0.035]
                        `
                        : `
                          border-border
                          bg-background/40
                        `
                    }
                  `}
                >
                  <div>
                    <span className="block text-[8px] font-semibold text-foreground">
                      Active Category
                    </span>

                    <span className="mt-0.5 block text-[6px] text-muted-foreground">
                      {isActive
                        ? "Currently enabled"
                        : "Currently disabled"}
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) =>
                        setIsActive(
                          e.target.checked
                        )
                      }
                      className="peer sr-only"
                    />

                    <div className="h-5 w-9 border border-border bg-muted transition-colors peer-checked:border-accent-gold/40 peer-checked:bg-accent-gold/15" />

                    <div className="absolute left-1 top-1 h-3 w-3 bg-muted-foreground transition-all peer-checked:translate-x-4 peer-checked:bg-accent-gold" />
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ==============================================================
              FOOTER
          ============================================================== */}

          <footer className="-mx-5 -mb-5 mt-6 flex items-center justify-between gap-3 border-t border-border bg-background/15 px-5 py-4 sm:-mx-6 sm:-mb-5 sm:px-6">
            <span className="hidden text-[6px] font-medium uppercase tracking-[0.14em] text-muted-foreground/40 sm:block">
              {category
                ? "Updating existing catalog node"
                : "Creating new catalog node"}
            </span>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="
                  h-9 border
                  border-border
                  px-4

                  text-[7px] font-bold
                  uppercase tracking-[0.12em]
                  text-muted-foreground

                  transition-colors

                  hover:bg-surface-raised
                  hover:text-foreground
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isPending}
                className="
                  inline-flex h-9
                  min-w-[125px]
                  items-center
                  justify-center
                  gap-2

                  bg-accent-gold
                  px-4

                  text-[7px] font-bold
                  uppercase tracking-[0.12em]
                  text-black

                  transition-all

                  hover:brightness-110

                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3" />
                    Save Category
                  </>
                )}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}

/* ============================================================================
   FORM FIELD
============================================================================ */

const inputClass = `
  h-[42px] w-full
  border border-border
  bg-background/40
  px-3.5

  text-[9px]
  text-foreground

  outline-none

  transition-all

  placeholder:text-muted-foreground/40

  hover:border-border/90

  focus:border-accent-gold/50
  focus:ring-1
  focus:ring-accent-gold/10
`;

function FormField({
  icon,
  label,
  required = false,
  children,
}: {
  icon: React.ReactElement;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <span
          className="
            text-accent-gold

            [&>svg]:h-3
            [&>svg]:w-3
          "
        >
          {icon}
        </span>

        <label className="text-[6px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </label>

        {required && (
          <span className="text-[7px] text-red-500">
            *
          </span>
        )}
      </div>

      {children}
    </div>
  );
}
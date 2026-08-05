import { createClient } from "@/lib/supabase/server";
import CatalogList from "@/components/admin/CatalogList";
import {
  Layers3,
  FolderTree,
  Boxes,
  PackageSearch,
  ChevronRight,
  Database,
} from "lucide-react";

export default async function AdminCatalogPage() {
  const supabase = await createClient();

  // 1. Fetch Main Categories (Level 1)
  const { data: mainCategoriesData } = await supabase
    .from("main_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  // 2. Fetch Categories (Level 2)
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  // 3. Fetch Subcategories (Level 3)
  const { data: subcategoriesData } = await supabase
    .from("subcategories")
    .select("*")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  // 4. Fetch Service Items (Level 4)
  const { data: itemsData } = await supabase
    .from("service_items")
    .select(`
      *,
      service_item_media (
        media_url
      )
    `)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  const mainCategories = mainCategoriesData || [];
  const categories = categoriesData || [];
  const subcategories = subcategoriesData || [];

  const items =
    itemsData?.map((item: any) => ({
      ...item,
      media:
        item.service_item_media?.map(
          (m: any) => m.media_url
        ) || [],
    })) || [];

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* ================================================================
          PAGE HEADER
      ================================================================ */}

      <header className="border-b border-border pb-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Database className="h-3 w-3 text-accent-gold" />

              <span className="text-[7px] font-bold uppercase tracking-[0.24em] text-accent-gold">
                Master Data / Service Architecture
              </span>
            </div>

            <h1
              className="text-3xl font-normal tracking-tight text-foreground sm:text-[34px]"
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Service Catalog
            </h1>

            <p className="mt-1.5 max-w-2xl text-[9px] leading-5 text-muted-foreground">
              Structure and maintain the complete SAI Events service
              hierarchy from primary business divisions down to individual
              bookable service items.
            </p>
          </div>

          {/* HIERARCHY PATH */}

          <div className="flex flex-wrap items-center gap-1.5 text-[6px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
            <HierarchyNode
              number="01"
              label="Main"
              active
            />

            <ChevronRight className="h-3 w-3 opacity-30" />

            <HierarchyNode
              number="02"
              label="Category"
            />

            <ChevronRight className="h-3 w-3 opacity-30" />

            <HierarchyNode
              number="03"
              label="Subcategory"
            />

            <ChevronRight className="h-3 w-3 opacity-30" />

            <HierarchyNode
              number="04"
              label="Service"
            />
          </div>
        </div>
      </header>

      {/* ================================================================
          CATALOG OVERVIEW STRIP
      ================================================================ */}

      <section className="grid grid-cols-2 overflow-hidden border border-border bg-surface/40 lg:grid-cols-4">
        <CatalogMetric
          icon={<Layers3 />}
          number="01"
          label="Main Categories"
          value={mainCategories.length}
        />

        <CatalogMetric
          icon={<FolderTree />}
          number="02"
          label="Categories"
          value={categories.length}
        />

        <CatalogMetric
          icon={<Boxes />}
          number="03"
          label="Subcategories"
          value={subcategories.length}
        />

        <CatalogMetric
          icon={<PackageSearch />}
          number="04"
          label="Service Items"
          value={items.length}
          last
        />
      </section>

      {/* ================================================================
          CATALOG WORKSPACE
      ================================================================ */}

      <CatalogList
        mainCategories={mainCategories}
        categories={categories}
        subcategories={subcategories}
        items={items}
      />
    </div>
  );
}

function HierarchyNode({
  number,
  label,
  active = false,
}: {
  number: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`
        flex items-center gap-1.5
        border px-2 py-1.5

        ${active
          ? "border-accent-gold/20 bg-accent-gold/[0.04] text-accent-gold"
          : "border-border bg-surface/30"
        }
      `}
    >
      <span className="font-mono opacity-50">
        {number}
      </span>

      {label}
    </div>
  );
}

function CatalogMetric({
  icon,
  number,
  label,
  value,
  last = false,
}: {
  icon: React.ReactElement;
  number: string;
  label: string;
  value: number;
  last?: boolean;
}) {
  return (
    <div
      className={`
        relative flex min-h-[92px]
        items-center gap-3 p-4

        border-b border-r border-border

        even:border-r-0
        lg:border-b-0
        lg:even:border-r

        ${last ? "lg:border-r-0" : ""}
      `}
    >
      <span className="absolute right-3 top-2 font-mono text-[6px] text-muted-foreground/25">
        L{number}
      </span>

      <div
        className="
          flex h-8 w-8 shrink-0
          items-center justify-center

          border border-accent-gold/15
          bg-accent-gold/[0.03]
          text-accent-gold

          [&>svg]:h-3.5
          [&>svg]:w-3.5
        "
      >
        {icon}
      </div>

      <div>
        <div
          className="text-xl font-normal text-foreground"
          style={{
            fontFamily: '"Playfair Display", serif',
          }}
        >
          {value}
        </div>

        <span className="text-[6px] font-bold uppercase tracking-[0.17em] text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}
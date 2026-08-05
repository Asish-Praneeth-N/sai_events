"use client";

import { useTransition } from "react";
import { ServiceItem } from "@/lib/types";
import { deleteServiceItem } from "@/app/admin/catalog/actions";
import {
  Pencil,
  Trash2,
  ImageIcon,
  Video,
  IndianRupee,
  CheckCircle2,
  CircleOff,
  Loader2,
} from "lucide-react";

interface CatalogCardProps {
  item: ServiceItem & {
    media?: string[];
  };

  onEdit: (
    item: ServiceItem & {
      media?: string[];
    }
  ) => void;
}

export default function CatalogCard({
  item,
  onEdit,
}: CatalogCardProps) {
  const [isPending, startTransition] =
    useTransition();

  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete ${item.name}?`
      )
    ) {
      startTransition(async () => {
        try {
          await deleteServiceItem(
            item.id
          );
        } catch (err: any) {
          alert(
            err.message ||
              "Failed to delete item."
          );
        }
      });
    }
  };

  const firstImage =
    item.media &&
    item.media.length > 0
      ? item.media[0]
      : null;

  const isVideo =
    firstImage
      ?.toLowerCase()
      .endsWith(".mp4") || false;

  const formattedPrice =
    item.price.toLocaleString(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    );

  return (
    <article
      className="
        group relative overflow-hidden
        border border-border
        bg-background/40

        transition-all duration-200

        hover:-translate-y-[1px]
        hover:border-accent-gold/25
        hover:shadow-md
      "
    >
      {/* ACTIVE RAIL */}

      <span className="absolute bottom-0 left-0 top-0 z-10 w-[2px] origin-top scale-y-0 bg-accent-gold transition-transform duration-200 group-hover:scale-y-100" />

      {/* ================================================================
          MEDIA
      ================================================================ */}

      <div className="relative h-[118px] overflow-hidden border-b border-border bg-muted/20">
        {firstImage ? (
          isVideo ? (
            <video
              src={firstImage}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              muted
            />
          ) : (
            <img
              src={firstImage}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          )
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <ImageIcon className="h-4 w-4 text-muted-foreground/25" />

            <span className="mt-2 text-[6px] font-bold uppercase tracking-[0.16em] text-muted-foreground/40">
              No Media
            </span>
          </div>
        )}

        {/* MEDIA TYPE */}

        {firstImage && (
          <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center border border-white/10 bg-black/55 text-white backdrop-blur-md">
            {isVideo ? (
              <Video className="h-2.5 w-2.5" />
            ) : (
              <ImageIcon className="h-2.5 w-2.5" />
            )}
          </div>
        )}

        {/* AVAILABILITY */}

        <div className="absolute right-2 top-2">
          <span
            className={`
              inline-flex items-center gap-1
              border px-2 py-1
              text-[5px] font-bold
              uppercase tracking-[0.13em]
              backdrop-blur-md

              ${
                item.is_available
                  ? `
                    border-emerald-500/20
                    bg-emerald-950/70
                    text-emerald-400
                  `
                  : `
                    border-white/10
                    bg-black/60
                    text-white/60
                  `
              }
            `}
          >
            {item.is_available ? (
              <CheckCircle2 className="h-2 w-2" />
            ) : (
              <CircleOff className="h-2 w-2" />
            )}

            {item.is_available
              ? "Available"
              : "Unavailable"}
          </span>
        </div>
      </div>

      {/* ================================================================
          INFORMATION
      ================================================================ */}

      <div className="p-4">
        <div>
          <span className="block text-[5px] font-bold uppercase tracking-[0.19em] text-accent-gold">
            Service Item
          </span>

          <h4 className="mt-1.5 truncate text-[10px] font-semibold text-foreground">
            {item.name}
          </h4>

          <p className="mt-2 line-clamp-2 min-h-[32px] text-[7px] leading-4 text-muted-foreground">
            {item.description}
          </p>
        </div>

        {/* PRICE */}

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-border/60 pt-3">
          <div>
            <span className="block text-[5px] font-bold uppercase tracking-[0.17em] text-muted-foreground/45">
              Pricing
            </span>

            <div className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-accent-gold">
              <span>
                {formattedPrice}
              </span>

              {item.pricing_type ===
                "per_plate" && (
                <span className="ml-1 text-[6px] font-medium text-muted-foreground">
                  / Plate
                </span>
              )}
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex items-center border border-border bg-surface opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            <button
              type="button"
              onClick={() =>
                onEdit(item)
              }
              className="
                flex h-7 w-7
                items-center
                justify-center

                text-muted-foreground

                transition-colors

                hover:bg-accent-gold/[0.06]
                hover:text-accent-gold
              "
              title="Edit Service"
            >
              <Pencil className="h-3 w-3" />
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="
                flex h-7 w-7
                items-center
                justify-center

                border-l border-border

                text-muted-foreground

                transition-colors

                hover:bg-red-500/[0.05]
                hover:text-red-500

                disabled:cursor-not-allowed
                disabled:opacity-40
              "
              title="Delete Service"
            >
              {isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
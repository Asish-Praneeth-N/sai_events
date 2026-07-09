"use client";

import { useState, useTransition } from "react";
import { Bell, Check, Trash2, Eye, MailOpen, Clock, AlertCircle } from "lucide-react";
import { markNotificationsRead } from "@/app/operations/actions";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  message: string;
  created_at: string;
  status: string;
}

interface NotificationCenterProps {
  initialNotifications: Notification[];
}

export default function NotificationCenter({ initialNotifications }: NotificationCenterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = initialNotifications.filter((n) => n.status === "Delivered").length;

  const displayedNotifications = initialNotifications.filter((n) => {
    if (filter === "unread") return n.status === "Delivered";
    return true;
  });

  const handleMarkAllRead = () => {
    const unreadIds = initialNotifications
      .filter((n) => n.status === "Delivered")
      .map((n) => n.id);

    if (unreadIds.length === 0) return;

    startTransition(async () => {
      try {
        await markNotificationsRead(unreadIds);
        router.refresh();
      } catch (err) {
        console.error("Failed to mark all read:", err);
      }
    });
  };

  const handleMarkOneRead = (id: string) => {
    startTransition(async () => {
      try {
        await markNotificationsRead([id]);
        router.refresh();
      } catch (err) {
        console.error("Failed to mark notification read:", err);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-light font-heading text-foreground">Alerts & Notifications</h1>
          <p className="text-xs text-muted-foreground font-light">
            Stay updated with execution logs, admin delegations, and escalations.
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent-gold/10 border border-accent-gold/25 hover:bg-accent-gold/20 text-accent-gold text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" /> Mark All as Read
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
            filter === "all"
              ? "bg-accent-gold/15 border-accent-gold/35 text-accent-gold"
              : "bg-surface border-border/60 text-muted-foreground hover:border-border"
          }`}
        >
          All Alerts ({initialNotifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
            filter === "unread"
              ? "bg-accent-gold/15 border-accent-gold/35 text-accent-gold"
              : "bg-surface border-border/60 text-muted-foreground hover:border-border"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {displayedNotifications.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border/60 rounded-3xl bg-surface/30 space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-border flex items-center justify-center mx-auto text-muted-foreground">
            <Bell className="w-5 h-5" />
          </div>
          <p className="text-xs text-muted-foreground font-light">
            {filter === "unread" ? "You have no unread notifications." : "Your inbox is empty."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedNotifications.map((notif) => {
            const isUnread = notif.status === "Delivered";
            return (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                  isUnread
                    ? "bg-accent-gold/5 border-accent-gold/25 shadow-sm shadow-accent-gold/5"
                    : "bg-surface border-border/60 hover:border-border/80"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isUnread
                    ? "bg-accent-gold/10 text-accent-gold border border-accent-gold/25"
                    : "bg-background text-muted-foreground border border-border/40"
                }`}>
                  <Bell className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <p className={`text-xs leading-relaxed font-light ${isUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-2 text-[9.5px] text-muted-foreground font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(notif.created_at)}</span>
                  </div>
                </div>

                {isUnread && (
                  <button
                    onClick={() => handleMarkOneRead(notif.id)}
                    disabled={isPending}
                    title="Mark as read"
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-accent-gold hover:bg-surface-raised cursor-pointer shrink-0 transition"
                  >
                    <MailOpen className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

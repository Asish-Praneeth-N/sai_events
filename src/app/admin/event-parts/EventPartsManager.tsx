"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EventPart } from "@/lib/types";
import { saveEventPart, deleteEventPart } from "./actions";

interface Props {
  parts: EventPart[];
}

const EVENT_TYPES = [
  "Wedding",
  "Birthday",
  "Corporate",
  "Sreemantham / Baby Shower",
  "Anniversary",
  "Housewarming",
  "Other Celebration",
];

export default function EventPartsManager({ parts }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedEventType, setSelectedEventType] = useState<string>("Wedding");
  
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState<EventPart | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredParts = parts.filter((p) => p.event_type === selectedEventType);

  const openAddModal = () => {
    setEditingPart(null);
    setName("");
    setDescription("");
    setSortOrder(filteredParts.length + 1);
    setIsActive(true);
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (part: EventPart) => {
    setEditingPart(part);
    setName(part.name);
    setDescription(part.description || "");
    setSortOrder(part.sort_order);
    setIsActive(part.is_active);
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    startTransition(async () => {
      try {
        await saveEventPart({
          id: editingPart?.id,
          eventType: selectedEventType,
          name: name.trim(),
          description: description.trim(),
          sortOrder,
          isActive,
        });
        setShowModal(false);
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Failed to save event part");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this event part?")) return;
    startTransition(async () => {
      try {
        await deleteEventPart(id);
        router.refresh();
      } catch (err: any) {
        alert(err.message || "Failed to delete");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-heading text-foreground">Event Parts Master</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Define sub-events for each main event type (e.g. Wedding → Haldi, Mehendi, Reception).
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-accent-gold hover:brightness-110 text-black font-bold rounded-xl transition text-xs shadow-md shadow-accent-gold/15 uppercase tracking-wider self-start sm:self-auto cursor-pointer"
        >
          + Add Event Part
        </button>
      </div>

      {/* Event Type Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {EVENT_TYPES.map((type) => {
          const count = parts.filter((p) => p.event_type === type).length;
          const isSelected = selectedEventType === type;
          return (
            <button
              key={type}
              onClick={() => setSelectedEventType(type)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? "bg-accent-gold text-black shadow-md shadow-accent-gold/20 font-bold"
                  : "bg-surface hover:bg-surface-raised border border-border text-muted-foreground"
              }`}
            >
              <span>{type}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${isSelected ? "bg-black/20 text-black" : "bg-background text-foreground"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Parts Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border/50 bg-background/50 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Sub-events for {selectedEventType} ({filteredParts.length})
          </span>
        </div>

        {filteredParts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            No sub-events configured for {selectedEventType}. Click "+ Add Event Part" to create one.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredParts
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((part) => (
                <div key={part.id} className="p-4 flex items-center justify-between hover:bg-background/40 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-accent-gold bg-accent-gold/10 px-2 py-0.5 rounded-md">
                        #{part.sort_order}
                      </span>
                      <h4 className="font-semibold text-foreground text-sm">{part.name}</h4>
                      {!part.is_active && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-semibold border border-red-500/20">
                          Inactive
                        </span>
                      )}
                    </div>
                    {part.description && <p className="text-xs text-muted-foreground">{part.description}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(part)}
                      className="px-3 py-1.5 bg-surface hover:bg-surface-raised border border-border text-foreground text-xs rounded-lg transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(part.id)}
                      disabled={isPending}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs rounded-lg transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-scale-in">
            <h3 className="text-lg font-bold text-foreground">
              {editingPart ? "Edit Sub-Event Part" : `Add Sub-Event for ${selectedEventType}`}
            </h3>

            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-muted-foreground uppercase">Sub-Event Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Haldi, Mehendi, Sangeet"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-muted-foreground uppercase">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this event part"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-muted-foreground uppercase">Display Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent-gold/30 text-foreground"
                  />
                </div>

                <div className="space-y-1.5 flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer py-2.5 select-none font-semibold text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-border text-accent-gold focus:ring-accent-gold bg-background h-4.5 w-4.5 cursor-pointer"
                    />
                    <span>Is Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-surface hover:bg-surface-raised border border-border text-foreground rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-accent-gold hover:brightness-110 text-black font-bold rounded-xl cursor-pointer shadow-md shadow-accent-gold/15"
                >
                  {isPending ? "Saving..." : "Save Sub-Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

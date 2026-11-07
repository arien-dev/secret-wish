"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Share2,
  Calendar,
  Sparkles,
  Lock,
  Trash2,
  Settings,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ItemCard } from "@/components/wishlist/ItemCard";
import { ItemFormModal } from "@/components/wishlist/ItemFormModal";
import { ShareModal } from "@/components/wishlist/ShareModal";
import { useToast } from "@/components/ui/toast";
import { formatDate, getOccasionLabel } from "@/lib/utils";

export interface WishlistDetailProps {
  initialWishlist: any;
  currentUserId: string;
}

export function WishlistDetailClient({ initialWishlist, currentUserId }: WishlistDetailProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [wishlist, setWishlist] = useState(initialWishlist);
  const [items, setItems] = useState<any[]>(initialWishlist.items || []);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareToken, setShareToken] = useState<string>(initialWishlist.shareToken || "");

  // Filters
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const refreshWishlist = async () => {
    try {
      const res = await fetch(`/api/wishlists/${wishlist.id}`);
      const data = await res.json();
      if (res.ok && data.wishlist) {
        setWishlist(data.wishlist);
        setItems(data.wishlist.items || []);
      }
    } catch {}
  };

  const handleAddItem = async (data: any) => {
    const res = await fetch(`/api/wishlists/${wishlist.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error);

    success("Wunsch erfolgreich hinzugefügt!");
    await refreshWishlist();
  };

  const handleEditItem = async (data: any) => {
    if (!editingItem) return;
    const res = await fetch(`/api/items/${editingItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error);

    success("Wunsch aktualisiert!");
    await refreshWishlist();
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Diesen Wunsch wirklich von der Liste entfernen?")) return;
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Fehler beim Löschen.");
      success("Wunsch gelöscht.");
      await refreshWishlist();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const handleDuplicateItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/items/${itemId}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error("Fehler beim Duplizieren.");
      success("Wunsch dupliziert.");
      await refreshWishlist();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const handleMarkReceived = async (itemId: string, isReceived: boolean) => {
    try {
      const res = await fetch(`/api/items/${itemId}/received`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isReceived }),
      });
      if (!res.ok) throw new Error("Fehler beim Aktualisieren.");
      success(isReceived ? "Als erhalten markiert! 🎁" : "Status zurückgesetzt.");
      await refreshWishlist();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const handleDeleteWishlist = async () => {
    if (!confirm("Möchtest du diese Wunschliste wirklich in den Papierkorb verschieben?")) return;
    try {
      const res = await fetch(`/api/wishlists/${wishlist.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Fehler beim Löschen.");
      success("Wunschliste in den Papierkorb verschoben.");
      router.push("/dashboard");
    } catch (err: any) {
      toastError(err.message);
    }
  };

  // Filter items
  const filteredItems = items.filter((it) => {
    if (filterPriority !== "ALL" && it.priority !== filterPriority) return false;
    if (filterStatus === "OPEN" && (it.reservationStatus?.isReserved || it.isReceived)) return false;
    if (filterStatus === "RESERVED" && !it.reservationStatus?.isReserved) return false;
    if (filterStatus === "RECEIVED" && !it.isReceived) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Zurück zu meinen Listen
        </Link>
      </div>

      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default" className="text-xs font-bold uppercase tracking-wider">
              {getOccasionLabel(wishlist.occasion)}
            </Badge>

            {wishlist.childMember?.childName && (
              <Badge variant="warning" className="text-xs flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Für {wishlist.childMember.childName}
              </Badge>
            )}

            {wishlist.eventDate && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{formatDate(wishlist.eventDate)}</span>
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {wishlist.title}
          </h1>

          {wishlist.description && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {wishlist.description}
            </p>
          )}

          <div className="pt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Lock className="h-3.5 w-3.5 text-emerald-500" />
            <span>Zero-Knowledge: Du siehst niemals, wer etwas reserviert hat.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="md"
            onClick={() => {
              setEditingItem(null);
              setIsItemModalOpen(true);
            }}
            className="shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Wunsch hinzufügen
          </Button>

          <Button
            size="md"
            variant="secondary"
            onClick={() => setIsShareModalOpen(true)}
          >
            <Share2 className="h-4 w-4 mr-1.5" />
            Teilen
          </Button>

          <Link href={`/wishlists/${wishlist.id}/edit`}>
            <Button size="md" variant="outline" title="Einstellungen">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>

          <Button
            size="md"
            variant="outline"
            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
            onClick={handleDeleteWishlist}
            title="In den Papierkorb"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter and count bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Filter className="h-3.5 w-3.5 text-violet-500" />
          <span>{filteredItems.length} {filteredItems.length === 1 ? "Wunsch" : "Wünsche"}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="h-8 px-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">Alle Prioritäten</option>
            <option value="MUST_HAVE">Highlights ★</option>
            <option value="HIGH">Hohe Priorität</option>
            <option value="MEDIUM">Mittlere Priorität</option>
            <option value="LOW">Niedrig</option>
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-8 px-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">Alle Status</option>
            <option value="OPEN">Nur noch offene</option>
            <option value="RESERVED">Reservierte</option>
            <option value="RECEIVED">Bereits erhaltene</option>
          </select>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
            <Plus className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {items.length === 0 ? "Noch keine Wünsche auf dieser Liste" : "Keine Wünsche für diesen Filter"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {items.length === 0
                ? "Füge deinen ersten Wunsch hinzu – mit Titel, Link, Preis und Bild."
                : "Passe die Filtereinstellungen an, um deine Wünsche zu sehen."}
            </p>
          </div>
          {items.length === 0 && (
            <Button
              size="md"
              onClick={() => {
                setEditingItem(null);
                setIsItemModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Ersten Wunsch anlegen
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              isOwner={true}
              onEdit={(it) => {
                setEditingItem(it);
                setIsItemModalOpen(true);
              }}
              onDelete={handleDeleteItem}
              onDuplicate={handleDuplicateItem}
              onMarkReceived={handleMarkReceived}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Item Modal */}
      <ItemFormModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={editingItem ? handleEditItem : handleAddItem}
        initialData={editingItem}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        wishlistId={wishlist.id}
        shareToken={shareToken || wishlist.id}
        wishlistTitle={wishlist.title}
        onTokenRegenerated={(newToken) => setShareToken(newToken)}
      />
    </div>
  );
}

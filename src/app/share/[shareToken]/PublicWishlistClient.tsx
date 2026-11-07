"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Gift,
  Calendar,
  ShieldCheck,
  CheckCircle,
  Users,
  Sparkles,
  BookmarkCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ItemCard } from "@/components/wishlist/ItemCard";
import { ClaimModal } from "@/components/reservation/ClaimModal";
import { ContributeModal } from "@/components/reservation/ContributeModal";
import { MyClaimsDrawer } from "@/components/reservation/MyClaimsDrawer";
import { useToast } from "@/components/ui/toast";
import { formatDate, getOccasionLabel } from "@/lib/utils";

export interface PublicWishlistClientProps {
  initialWishlist: any;
  shareToken: string;
}

export function PublicWishlistClient({
  initialWishlist,
  shareToken,
}: PublicWishlistClientProps) {
  const { success, error: toastError } = useToast();
  const [wishlist, setWishlist] = useState(initialWishlist);
  const [items, setItems] = useState<any[]>(initialWishlist.items || []);

  const [guestToken, setGuestToken] = useState<string>("");
  const [guestName, setGuestName] = useState<string>("");

  // Modals
  const [claimingItem, setClaimingItem] = useState<any | null>(null);
  const [contributingItem, setContributingItem] = useState<any | null>(null);
  const [isClaimsDrawerOpen, setIsClaimsDrawerOpen] = useState(false);
  const [myClaims, setMyClaims] = useState<any[]>([]);

  // Initialize guest identity from localStorage/cookie
  useEffect(() => {
    let token = localStorage.getItem("secretwish_guest_token");
    const name = localStorage.getItem("secretwish_guest_name") || "";
    if (name) setGuestName(name);

    if (!token) {
      // Generate a client token
      token = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("secretwish_guest_token", token);
    }
    setGuestToken(token);

    // Register guest session
    fetch(`/api/public/wishlists/${shareToken}/guest-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-guest-token": token,
      },
      body: JSON.stringify({ displayName: name || null }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.guestToken) {
          setGuestToken(data.guestToken);
          localStorage.setItem("secretwish_guest_token", data.guestToken);
        }
      })
      .catch(() => {});
  }, [shareToken]);

  const refreshList = async () => {
    if (!guestToken) return;
    try {
      const res = await fetch(`/api/public/wishlists/${shareToken}`, {
        headers: { "x-guest-token": guestToken },
      });
      const data = await res.json();
      if (res.ok && data.wishlist) {
        setWishlist(data.wishlist);
        setItems(data.wishlist.items || []);
      }

      // Fetch my reservations
      const claimsRes = await fetch(`/api/public/wishlists/${shareToken}/my-reservations`, {
        headers: { "x-guest-token": guestToken },
      });
      const claimsData = await claimsRes.json();
      if (claimsRes.ok && claimsData.reservations) {
        setMyClaims(claimsData.reservations);
      }
    } catch {}
  };

  useEffect(() => {
    if (guestToken) {
      refreshList();
    }
  }, [guestToken]);

  const handleSaveGuestName = (name: string) => {
    setGuestName(name);
    localStorage.setItem("secretwish_guest_name", name);
    if (guestToken) {
      fetch(`/api/public/wishlists/${shareToken}/guest-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-guest-token": guestToken,
        },
        body: JSON.stringify({ displayName: name }),
      }).catch(() => {});
    }
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#7c3aed", "#f59e0b", "#10b981", "#ec4899"],
    });
  };

  const handleReserve = async (quantity: number) => {
    if (!claimingItem || !guestToken) return;
    const res = await fetch(
      `/api/public/wishlists/${shareToken}/items/${claimingItem.id}/reserve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-guest-token": guestToken,
        },
        body: JSON.stringify({ quantity }),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    fireConfetti();
    success(`Wunsch "${claimingItem.title}" für dich reserviert! 🎁`);
    await refreshList();
  };

  const handleContribute = async (amount: number) => {
    if (!contributingItem || !guestToken) return;
    const res = await fetch(
      `/api/public/wishlists/${shareToken}/items/${contributingItem.id}/contribute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-guest-token": guestToken,
        },
        body: JSON.stringify({ amount }),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    fireConfetti();
    success(`Vielen Dank! Dein Beitrag wurde erfolgreich verbucht. 🎉`);
    await refreshList();
  };

  const handleCancelReservation = async (itemId: string) => {
    if (!confirm("Möchtest du diese Reservierung wirklich freigeben?")) return;
    try {
      const res = await fetch(
        `/api/public/wishlists/${shareToken}/items/${itemId}/reserve`,
        {
          method: "DELETE",
          headers: { "x-guest-token": guestToken },
        }
      );
      if (!res.ok) throw new Error("Fehler beim Freigeben.");

      success("Reservierung freigegeben.");
      await refreshList();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const handleMarkPurchased = async (itemId: string) => {
    try {
      const res = await fetch(
        `/api/public/wishlists/${shareToken}/items/${itemId}/purchase`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-guest-token": guestToken },
        }
      );
      if (!res.ok) throw new Error("Fehler beim Aktualisieren.");

      success("Als gekauft markiert! Danke. ✓");
      await refreshList();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  // Count my claims
  const myClaimsCount = myClaims.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default" className="text-xs font-bold uppercase tracking-wider">
              {getOccasionLabel(wishlist.occasion)}
            </Badge>

            {wishlist.ownerName && (
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Wunschliste von {wishlist.ownerName}
              </span>
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

          {/* Privacy info banner */}
          <div className="inline-flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-xs text-violet-900 border border-violet-200/60 dark:bg-violet-950/40 dark:border-violet-900/40 dark:text-violet-200">
            <ShieldCheck className="h-4 w-4 text-violet-600 shrink-0" />
            <span>
              <strong>100% Geheim:</strong> {wishlist.ownerName} erfährt niemals, wer was reserviert. Du brauchst keinen Account!
            </span>
          </div>
        </div>

        {/* Guest Actions (Drawer) */}
        <div>
          <Button
            size="md"
            variant="secondary"
            onClick={() => setIsClaimsDrawerOpen(true)}
            className="w-full sm:w-auto relative gap-2 shadow-sm"
          >
            <BookmarkCheck className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <span>Meine Reservierungen</span>
            {myClaimsCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white text-[11px] font-bold">
                {myClaimsCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Alle Wünsche</span>
            <span className="text-xs font-normal text-slate-400">({items.length})</span>
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <Gift className="h-10 w-10 text-slate-400 mx-auto opacity-50" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Diese Wunschliste ist aktuell noch leer.
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Schau später noch einmal vorbei!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                isOwner={false}
                onReserve={() => setClaimingItem(item)}
                onContribute={() => setContributingItem(item)}
                onCancelReservation={handleCancelReservation}
                onMarkPurchased={handleMarkPurchased}
              />
            ))}
          </div>
        )}
      </div>

      {/* Claim Modal */}
      <ClaimModal
        isOpen={Boolean(claimingItem)}
        onClose={() => setClaimingItem(null)}
        item={claimingItem}
        guestName={guestName}
        onSaveGuestName={handleSaveGuestName}
        onConfirm={handleReserve}
      />

      {/* Group Gift Contribution Modal */}
      <ContributeModal
        isOpen={Boolean(contributingItem)}
        onClose={() => setContributingItem(null)}
        item={contributingItem}
        guestName={guestName}
        onSaveGuestName={handleSaveGuestName}
        onConfirm={handleContribute}
      />

      {/* My Claims Drawer */}
      <MyClaimsDrawer
        isOpen={isClaimsDrawerOpen}
        onClose={() => setIsClaimsDrawerOpen(false)}
        claims={myClaims}
        onCancel={handleCancelReservation}
        onMarkPurchased={handleMarkPurchased}
      />
    </div>
  );
}

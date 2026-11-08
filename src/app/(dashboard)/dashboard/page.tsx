import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { WishlistService } from "@/server/services/wishlist.service";
import { WishlistCard } from "@/components/wishlist/WishlistCard";
import { Button } from "@/components/ui/button";
import { Plus, Gift, Sparkles, Users } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const wishlists = await WishlistService.getWishlistsForUser(user.id);

  let totalWishes = 0;
  let totalReserved = 0;
  for (const list of wishlists) {
    totalWishes += list.stats.totalItems;
    totalReserved += list.stats.reservedItems;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text mb-1">
            Hallo, {user.name}! <span className="text-muted text-base">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Hier sind alle deine Wunschlisten und geteilten Familienräume.
          </p>
        </div>

        <Link href="/wishlists/new">
          <Button size="md" className="gap-2 shadow-md">
            <Plus className="h-4 w-4" />
            <span>Neue Wunschliste erstellen</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Gift className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Listen</span>
          </div>
          <div className="text-2xl font-bold text-text">{wishlists.length}</div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Wünsche</span>
          </div>
          <div className="text-2xl font-bold text-text">{totalWishes}</div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Reserviert</span>
          </div>
          <div className="text-2xl font-bold text-text">{totalReserved}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text flex items-center gap-2">
            <span>Deine Wunschlisten</span>
            <span className="text-xs font-normal text-muted">({wishlists.length})</span>
          </h2>
        </div>

        {wishlists.length === 0 ? (
          <div className="empty-state p-16 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Gift className="h-7 w-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-text">Noch keine Wunschliste erstellt</h3>
              <p className="text-xs text-muted">
                Erstelle jetzt deine erste Liste für deinen Geburtstag, Weihnachten oder einen besonderen Anlass.
              </p>
            </div>
            <Link href="/wishlists/new">
              <Button size="md" className="gap-2">
                <Plus className="h-4 w-4" />
                <span>Erste Liste anlegen</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlists.map((list) => (
              <WishlistCard key={list.id} wishlist={list as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

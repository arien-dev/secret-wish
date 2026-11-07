import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { WishlistService } from "@/server/services/wishlist.service";
import { WishlistCard } from "@/components/wishlist/WishlistCard";
import { Button } from "@/components/ui/button";
import { Plus, Gift, Sparkles, Users, Calendar } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const wishlists = await WishlistService.getWishlistsForUser(user.id);

  // Compute overall stats
  let totalWishes = 0;
  let totalReserved = 0;
  for (const list of wishlists) {
    totalWishes += list.stats.totalItems;
    totalReserved += list.stats.reservedItems;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      {/* Header with greeting & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Hallo, {user.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
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

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 mb-1">
            <Gift className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Listen</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {wishlists.length}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Wünsche</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {totalWishes}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-emerald-500 mb-1">
            <Users className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Reserviert</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {totalReserved}
          </div>
        </div>
      </div>

      {/* Wishlists Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Deine Wunschlisten</span>
            <span className="text-xs font-normal text-slate-400">({wishlists.length})</span>
          </h2>
        </div>

        {wishlists.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
              <Gift className="h-7 w-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Noch keine Wunschliste erstellt
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
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

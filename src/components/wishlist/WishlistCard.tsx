import Link from "next/link";
import { Calendar, Gift, ChevronRight, Lock, Globe, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, getOccasionLabel } from "@/lib/utils";

export interface WishlistCardProps {
  wishlist: {
    id: string;
    title: string;
    description?: string | null;
    occasion: string;
    eventDate?: string | Date | null;
    isPublic: boolean;
    isArchived: boolean;
    family?: { name: string } | null;
    childMember?: { childName: string | null } | null;
    stats?: {
      totalItems: number;
      reservedItems: number;
      receivedItems: number;
    };
  };
}

export function WishlistCard({ wishlist }: WishlistCardProps) {
  const stats = wishlist.stats || { totalItems: 0, reservedItems: 0, receivedItems: 0 };
  const percentComplete = stats.totalItems > 0 ? Math.round((stats.reservedItems / stats.totalItems) * 100) : 0;

  return (
    <Link href={`/wishlists/${wishlist.id}`} className="block group">
      <Card className="h-full flex flex-col justify-between glass-card hover:shadow-lg transition-all">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="default" className="text-[11px] uppercase tracking-wider font-semibold">
              {getOccasionLabel(wishlist.occasion)}
            </Badge>

            <div className="flex items-center gap-1.5 text-xs text-muted">
              {wishlist.isPublic ? (
                <span title="Öffentliche Liste" className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                </span>
              ) : (
                <span title="Private Liste mit Einladungslink" className="flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-text group-hover:text-primary dark:group-hover:text-dark-primary transition-colors line-clamp-1">
              {wishlist.title}
            </h3>
            {wishlist.childMember?.childName && (
              <p className="text-xs font-medium text-accent flex items-center gap-1 mt-0.5">
                <Sparkles className="h-3 w-3" /> Für {wishlist.childMember.childName}
              </p>
            )}
            {wishlist.description && (
              <p className="text-xs text-muted line-clamp-2 mt-1">{wishlist.description}</p>
            )}
          </div>

          {wishlist.eventDate && (
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Calendar className="h-3.5 w-3.5 text-muted" />
              <span>{formatDate(wishlist.eventDate)}</span>
            </div>
          )}
        </div>

        <div className="pt-4 mt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted mb-1.5">
            <span className="flex items-center gap-1 font-medium">
              <Gift className="h-3.5 w-3.5 text-muted" />
              {stats.totalItems} {stats.totalItems === 1 ? "Wunsch" : "Wünsche"}
            </span>
            <span className="font-semibold text-text">
              {stats.reservedItems} reserviert ({percentComplete}%)
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-dark-border h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${percentComplete}%` }} />
          </div>

          <div className="flex items-center justify-end text-xs font-medium text-primary dark:text-dark-primary pt-3 group-hover:translate-x-1 transition-transform">
            <span>Öffnen</span>
            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

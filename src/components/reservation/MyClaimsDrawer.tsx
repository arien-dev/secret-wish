"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Gift, CheckCircle, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface MyClaimsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  claims: Array<{
    reservationId: string;
    itemId: string;
    title: string;
    price?: number | null;
    currency: string;
    quantity: number;
    amount?: number | null;
    status: string;
    isGroupGift: boolean;
  }>;
  onCancel: (itemId: string) => Promise<void>;
  onMarkPurchased: (itemId: string) => Promise<void>;
}

export function MyClaimsDrawer({
  isOpen,
  onClose,
  claims,
  onCancel,
  onMarkPurchased,
}: MyClaimsDrawerProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deine Reservierungen 🎁"
      description="Hier siehst du alle Geschenke, die du auf dieser Liste reserviert hast."
      maxWidth="md"
    >
      <div className="space-y-3 pt-1 max-h-[60vh] overflow-y-auto">
        {claims.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
            <Gift className="h-8 w-8 mx-auto mb-2 opacity-40 text-violet-500" />
            Du hast auf dieser Liste noch keine Wünsche reserviert.
          </div>
        ) : (
          claims.map((claim) => (
            <div
              key={claim.reservationId}
              className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {claim.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {claim.isGroupGift && claim.amount ? (
                      <span>Gruppenbeitrag: {formatCurrency(claim.amount, claim.currency)}</span>
                    ) : (
                      <span>Menge: {claim.quantity}x</span>
                    )}
                  </p>
                </div>

                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    claim.status === "PURCHASED"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300"
                  }`}
                >
                  {claim.status === "PURCHASED" ? "Bereits gekauft" : "Reserviert"}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                {claim.status !== "PURCHASED" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 text-xs"
                    onClick={() => onMarkPurchased(claim.itemId)}
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                    Als gekauft markieren
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  onClick={() => onCancel(claim.itemId)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Freigeben
                </Button>
              </div>
            </div>
          ))
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Schließen
          </Button>
        </div>
      </div>
    </Modal>
  );
}

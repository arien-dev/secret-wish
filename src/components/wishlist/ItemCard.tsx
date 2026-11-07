"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ExternalLink,
  Edit2,
  Trash2,
  Copy,
  CheckCircle,
  Users,
  Lock,
  Gift,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getPriorityColor, getPriorityLabel } from "@/lib/utils";

export interface ItemCardProps {
  item: {
    id: string;
    title: string;
    description?: string | null;
    url?: string | null;
    imageUrl?: string | null;
    price?: number | null;
    currency: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "MUST_HAVE";
    quantity: number;
    variant?: string | null;
    note?: string | null;
    tags?: string | null;
    isGroupGift: boolean;
    targetAmount?: number | null;
    isReceived: boolean;
    // Owner view properties
    reservationStatus?: {
      isReserved: boolean;
      reservedQuantity: number;
      isPurchased: boolean;
      contributedAmount: number;
      isFullyFunded: boolean;
    };
    // Guest view properties
    status?: {
      isReserved: boolean;
      reservedQuantity: number;
      remainingQuantity: number;
      isFullyFunded: boolean;
      contributedAmount: number;
      remainingAmount: number;
    };
    myReservation?: {
      isMine: boolean;
      quantity: number;
      amount?: number | null;
      status: "RESERVED" | "PURCHASED" | "DELIVERED" | null;
    } | null;
  };
  isOwner?: boolean;
  onEdit?: (item: any) => void;
  onDelete?: (itemId: string) => void;
  onDuplicate?: (itemId: string) => void;
  onMarkReceived?: (itemId: string, isReceived: boolean) => void;
  onReserve?: (itemId: string, quantity: number) => void;
  onCancelReservation?: (itemId: string) => void;
  onMarkPurchased?: (itemId: string) => void;
  onContribute?: (itemId: string) => void;
}

export function ItemCard({
  item,
  isOwner = false,
  onEdit,
  onDelete,
  onDuplicate,
  onMarkReceived,
  onReserve,
  onCancelReservation,
  onMarkPurchased,
  onContribute,
}: ItemCardProps) {
  const [imageError, setImageError] = useState(false);

  // Group gift progress calculation
  const target = item.targetAmount || item.price || 0;
  const currentFunded = isOwner
    ? item.reservationStatus?.contributedAmount || 0
    : item.status?.contributedAmount || 0;
  const fundedPercent = target > 0 ? Math.min(100, Math.round((currentFunded / target) * 100)) : 0;

  // Guest claim states
  const isMine = !isOwner && item.myReservation?.isMine;
  const isFullyReserved = isOwner
    ? item.reservationStatus?.isReserved
    : item.status?.isReserved;
  const isFullyFunded = isOwner
    ? item.reservationStatus?.isFullyFunded
    : item.status?.isFullyFunded;

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md dark:bg-slate-900 ${
        item.isReceived
          ? "border-emerald-300/80 bg-emerald-50/20 dark:border-emerald-900/40 dark:bg-emerald-950/10"
          : isMine
          ? "border-violet-300 dark:border-violet-800 ring-1 ring-violet-500/20"
          : "border-slate-200/90 dark:border-slate-800"
      }`}
    >
      <div>
        {/* Top Image or Header */}
        {item.imageUrl && !imageError ? (
          <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
              unoptimized
            />
            {item.isGroupGift && (
              <div className="absolute top-3 left-3">
                <Badge variant="warning" className="flex items-center gap-1 shadow-sm">
                  <Users className="h-3 w-3" /> Gruppengeschenk
                </Badge>
              </div>
            )}
          </div>
        ) : (
          item.isGroupGift && (
            <div className="p-3 pb-0">
              <Badge variant="warning" className="flex items-center gap-1 w-fit">
                <Users className="h-3 w-3" /> Gruppengeschenk
              </Badge>
            </div>
          )
        )}

        {/* Content */}
        <div className="p-4 space-y-2.5">
          {/* Badges: Priority, Variant, Tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getPriorityColor(
                item.priority
              )}`}
            >
              {getPriorityLabel(item.priority)}
            </span>

            {item.variant && (
              <Badge variant="secondary" className="text-[11px]">
                {item.variant}
              </Badge>
            )}

            {item.quantity > 1 && (
              <Badge variant="outline" className="text-[11px]">
                {item.quantity}x
              </Badge>
            )}
          </div>

          {/* Title & Price */}
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {item.title}
            </h4>
            {item.price !== null && item.price !== undefined && (
              <span className="shrink-0 text-sm font-bold text-slate-800 dark:text-slate-200">
                {formatCurrency(item.price, item.currency)}
              </span>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
              {item.description}
            </p>
          )}

          {/* Note for gifter */}
          {item.note && (
            <div className="rounded-xl bg-amber-50 p-2.5 text-xs text-amber-900 border border-amber-200/70 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-800/40">
              <span className="font-semibold block mb-0.5">Hinweis:</span>
              {item.note}
            </div>
          )}

          {/* Group Gift Progress Bar */}
          {item.isGroupGift && target > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                <span>{formatCurrency(currentFunded, item.currency)} reserviert</span>
                <span>Ziel: {formatCurrency(target, item.currency)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    fundedPercent >= 100 ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${fundedPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-right text-slate-500 dark:text-slate-400">
                {fundedPercent}% finanziert
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Status / Actions */}
      <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
        {/* External Link */}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium transition-colors"
          >
            <span>Produkt ansehen</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        {/* OWNER VIEW CONTROLS */}
        {isOwner ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                {item.isReceived ? (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle className="h-3.5 w-3.5" /> Bereits erhalten
                  </span>
                ) : item.reservationStatus?.isReserved ? (
                  <span className="flex items-center gap-1 text-violet-600 dark:text-violet-400 font-medium">
                    <Lock className="h-3.5 w-3.5" /> Reserviert (Überraschung!)
                  </span>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400">
                    Noch verfügbar
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => onMarkReceived && onMarkReceived(item.id, !item.isReceived)}
                className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${
                  item.isReceived
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
                }`}
              >
                {item.isReceived ? "Als nicht erhalten markieren" : "✓ Erhalten"}
              </button>

              <div className="flex items-center gap-1">
                {onDuplicate && (
                  <button
                    onClick={() => onDuplicate(item.id)}
                    title="Wunsch duplizieren"
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(item)}
                    title="Wunsch bearbeiten"
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(item.id)}
                    title="Wunsch löschen"
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* GUEST VIEW CONTROLS */
          <div className="space-y-2">
            {isMine ? (
              <div className="space-y-2 rounded-xl bg-violet-50 p-2.5 border border-violet-200 dark:bg-violet-950/40 dark:border-violet-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-violet-800 dark:text-violet-200 flex items-center gap-1">
                    <Gift className="h-3.5 w-3.5 text-violet-600" />
                    Von dir reserviert!
                  </span>
                  <span className="text-[11px] text-violet-600 dark:text-violet-300">
                    {item.myReservation?.status === "PURCHASED" ? "Bereits gekauft" : "Reserviert"}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {item.myReservation?.status !== "PURCHASED" && onMarkPurchased && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs h-7 w-full"
                      onClick={() => onMarkPurchased(item.id)}
                    >
                      Als gekauft markieren
                    </Button>
                  )}
                  {onCancelReservation && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      onClick={() => onCancelReservation(item.id)}
                    >
                      Freigeben
                    </Button>
                  )}
                </div>
              </div>
            ) : item.isGroupGift ? (
              <div>
                {isFullyFunded ? (
                  <div className="text-xs font-semibold text-center text-emerald-600 dark:text-emerald-400 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                    ✓ Vollständig finanziert
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="w-full text-xs h-9 bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={() => onContribute && onContribute(item.id)}
                  >
                    <Users className="h-3.5 w-3.5 mr-1" />
                    Anteil beitragen
                  </Button>
                )}
              </div>
            ) : isFullyReserved ? (
              <div className="text-xs font-medium text-center text-slate-500 dark:text-slate-400 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Bereits reserviert
              </div>
            ) : (
              <Button
                size="sm"
                className="w-full text-xs h-9"
                onClick={() => onReserve && onReserve(item.id, 1)}
              >
                <Gift className="h-3.5 w-3.5 mr-1" />
                Diesen Wunsch reservieren
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

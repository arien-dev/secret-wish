"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, ShieldCheck } from "lucide-react";

export interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    quantity: number;
    status?: {
      remainingQuantity: number;
    };
  } | null;
  guestName: string;
  onSaveGuestName: (name: string) => void;
  onConfirm: (quantity: number) => Promise<void>;
}

export function ClaimModal({
  isOpen,
  onClose,
  item,
  guestName,
  onSaveGuestName,
  onConfirm,
}: ClaimModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [nameInput, setNameInput] = useState(guestName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!item) return null;

  const maxAvailable = item.status?.remainingQuantity ?? item.quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      if (nameInput.trim() !== guestName) {
        onSaveGuestName(nameInput.trim());
      }

      await onConfirm(quantity);
      onClose();
    } catch (err: any) {
      setError(err.message || "Fehler beim Reservieren.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Wunsch reservieren 🎁"
      description={`Möchtest du "${item.title}" reservieren?`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
            {error}
          </div>
        )}

        <div className="rounded-xl bg-violet-50 p-3 text-xs text-violet-900 border border-violet-200/80 dark:bg-violet-950/40 dark:border-violet-900/40 dark:text-violet-200 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
          <p>
            <strong>Geheimnis garantiert:</strong> Der Empfänger erfährt niemals, wer diesen Wunsch reserviert hat.
          </p>
        </div>

        {maxAvailable > 1 && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Anzahl zum Reservieren (Verfügbar: {maxAvailable})
            </label>
            <input
              type="number"
              min="1"
              max={maxAvailable}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(maxAvailable, parseInt(e.target.value) || 1)))}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        )}

        <Input
          label="Dein Name (nur für dich sichtbar, wird niemals dem Beschenkten gezeigt)"
          placeholder="z.B. Anna"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          helper="Wird nur auf diesem Gerät gespeichert, damit du den Überblick behältst."
        />

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Abbrechen
          </Button>
          <Button type="submit" isLoading={isLoading}>
            <Gift className="h-4 w-4 mr-1.5" />
            Jetzt verbindlich reservieren
          </Button>
        </div>
      </form>
    </Modal>
  );
}

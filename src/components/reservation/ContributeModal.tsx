"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    currency: string;
    targetAmount?: number | null;
    status?: {
      contributedAmount: number;
      remainingAmount: number;
    };
  } | null;
  guestName: string;
  onSaveGuestName: (name: string) => void;
  onConfirm: (amount: number) => Promise<void>;
}

export function ContributeModal({
  isOpen,
  onClose,
  item,
  guestName,
  onSaveGuestName,
  onConfirm,
}: ContributeModalProps) {
  const [amount, setAmount] = useState<string>("25");
  const [nameInput, setNameInput] = useState(guestName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!item) return null;

  const remaining = item.status?.remainingAmount ?? (item.targetAmount || 0);

  const presets = [10, 20, 30, 50].filter((val) => val <= remaining);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Bitte gib einen gültigen Betrag ein.");
      return;
    }

    if (parsedAmount > remaining) {
      setError(`Maximal ${formatCurrency(remaining, item.currency)} möglich.`);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (nameInput.trim() !== guestName) {
        onSaveGuestName(nameInput.trim());
      }

      await onConfirm(parsedAmount);
      onClose();
    } catch (err: any) {
      setError(err.message || "Fehler beim Beitragen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Zum Gruppengeschenk beitragen 🎉"
      description={`Beteilige dich an "${item.title}"`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
            {error}
          </div>
        )}

        <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200/80 dark:bg-amber-950/40 dark:border-amber-900/40 dark:text-amber-200 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Anonym gegenüber dem Beschenkten:</strong> Der Beschenkte sieht nur, wie viel insgesamt zusammengekommen ist, aber nicht wer wie viel gespendet hat!
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 flex justify-between items-center text-xs">
          <span className="text-slate-600 dark:text-slate-400">Noch benötigter Betrag:</span>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            {formatCurrency(remaining, item.currency)}
          </span>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Input
            label={`Dein Beitrag in ${item.currency} *`}
            type="number"
            step="0.5"
            min="1"
            max={remaining}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors"
              >
                +{preset} €
              </button>
            ))}
            {remaining > 0 && (
              <button
                type="button"
                onClick={() => setAmount(String(remaining))}
                className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-semibold text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300 transition-colors"
              >
                Gesamten Rest ({formatCurrency(remaining, item.currency)})
              </button>
            )}
          </div>
        </div>

        <Input
          label="Dein Name (nur für dich sichtbar)"
          placeholder="z.B. Jonas"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          helper="Wird niemals an den Beschenkten übertragen."
        />

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Abbrechen
          </Button>
          <Button type="submit" isLoading={isLoading} className="bg-amber-600 hover:bg-amber-700 text-white">
            <Users className="h-4 w-4 mr-1.5" />
            Beitrag reservieren
          </Button>
        </div>
      </form>
    </Modal>
  );
}

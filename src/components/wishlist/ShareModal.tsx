"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Copy, Check, RefreshCw, ShieldCheck, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistId: string;
  shareToken: string;
  wishlistTitle: string;
  onTokenRegenerated?: (newToken: string) => void;
}

export function ShareModal({
  isOpen,
  onClose,
  wishlistId,
  shareToken,
  wishlistTitle,
  onTokenRegenerated,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { success, error } = useToast();

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/share/${shareToken}`
    : `/share/${shareToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      success("Einladungslink in die Zwischenablage kopiert!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      error("Konnte nicht kopiert werden. Bitte manuell markieren.");
    }
  };

  const handleRegenerate = async () => {
    if (!confirm("Bist du sicher? Der alte Link wird sofort ungültig und Gäste können ihn nicht mehr öffnen.")) {
      return;
    }

    try {
      setIsRegenerating(true);
      const res = await fetch(`/api/wishlists/${wishlistId}/share`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (onTokenRegenerated) {
        onTokenRegenerated(data.shareToken);
      }
      success("Neuer Einladungslink generiert! Der alte Link wurde deaktiviert.");
    } catch (err: any) {
      error(err.message || "Fehler beim Erneuern des Links.");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Wunschliste teilen"
      description="Teile diesen sicheren Link mit Familie & Freunden."
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Privacy promise callout */}
        <div className="flex items-start gap-2.5 rounded-xl bg-violet-50 p-3 text-xs text-violet-900 border border-violet-200/80 dark:bg-violet-950/40 dark:border-violet-900/40 dark:text-violet-200">
          <ShieldCheck className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
          <p>
            <strong>Geheime Reservierungen:</strong> Gäste können Wünsche reservieren, ohne dass du erfährst, wer was ausgewählt hat.
          </p>
        </div>

        {/* Link Input & Copy */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Geheimer Gast-Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 text-xs font-mono select-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
            <Button
              size="sm"
              onClick={handleCopy}
              className="shrink-0 h-10 px-3.5"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="hidden sm:inline">{copied ? "Kopiert" : "Kopieren"}</span>
            </Button>
          </div>
        </div>

        {/* Quick share buttons */}
        <div className="flex items-center gap-2 pt-1">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Hier ist meine Wunschliste für ${wishlistTitle}: ${shareUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 transition-colors"
          >
            <Share2 className="h-3.5 w-3.5 text-emerald-600" />
            WhatsApp
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent(`Wunschliste: ${wishlistTitle}`)}&body=${encodeURIComponent(`Schau dir meine Wunschliste an: ${shareUrl}`)}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 transition-colors"
          >
            E-Mail
          </a>
        </div>

        {/* Link revocation / regeneration */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>Neuen Link generieren (alten Link ungültig machen)</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

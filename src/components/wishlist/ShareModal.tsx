"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, RefreshCw, ShieldCheck, Share2, Link, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistId: string;
  shareToken: string; // aktuell aktiver Slug
  wishlistTitle: string;
  onTokenRegenerated?: (newToken: string) => void;
}

export function ShareModal({
  isOpen,
  onClose,
  wishlistId,
  shareToken: activeSlug,
  wishlistTitle,
  onTokenRegenerated,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [customSlug, setCustomSlug] = useState(activeSlug);
  const [customSlugError, setCustomSlugError] = useState<string | null>(null);
  const [customSlugTouched, setCustomSlugTouched] = useState(false);
  const { success, error } = useToast();

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const previewUrl = `${origin}/share/${customSlug || activeSlug}`;
  const activeUrl = `${origin}/share/${activeSlug}`;

  useEffect(() => {
    if (isOpen) {
      setCustomSlug(activeSlug);
      setCustomSlugError(null);
      setCustomSlugTouched(false);
    }
  }, [isOpen, activeSlug]);

  const validateSlug = useCallback((value: string) => {
    if (!value) return null;
    if (value.length < 3 || value.length > 40) {
      return "Der Link muss 3 bis 40 Zeichen lang sein.";
    }
    if (!/^[a-z0-9-]+$/.test(value)) {
      return "Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt.";
    }
    if (value.startsWith("-") || value.endsWith("-") || value.includes("--")) {
      return "Bindestriche nicht am Anfang/Ende und nicht doppelt.";
    }
    const reserved = new Set([
      "admin","api","login","register","logout","share","dashboard","wishlists","wishlist",
      "items","item","families","family","public","me","session","sessions","upload","uploads",
      "notification","notifications","_next","static","favicon.ico","sitemap.xml","robots.txt",
      "settings","profile","reset-password","forgot-password","auth","health","manifest",
      "sw.js","service-worker","create","new","edit","delete",
    ]);
    const offensive = new Set([
      "nigga","nigger","nazi","hitler","fuck","shit","cunt","twat","bitch","bastard",
      "faggot","fag","dyke","tranny","retard","kike","spic","chink","gook","gypo",
      "wog","coon","wetback","honkey","cracker","redneck","hillbilly","degenerate",
    ]);
    if (reserved.has(value)) return "Dieser Link-Name ist reserviert.";
    if (offensive.has(value.toLowerCase())) return "Dieser Link-Name ist nicht zulässig.";
    return null;
  }, []);

  const handleCustomSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().trim();
    setCustomSlug(value);
    if (value) {
      const err = validateSlug(value);
      setCustomSlugError(err);
    } else {
      setCustomSlugError(null);
    }
  };

  const handleCustomSlugBlur = () => {
    setCustomSlugTouched(true);
    if (customSlug) {
      const err = validateSlug(customSlug);
      setCustomSlugError(err);
    }
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      success("Link in die Zwischenablage kopiert!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      error("Konnte nicht kopiert werden. Bitte manuell markieren.");
    }
  };

  const handleSaveCustom = async () => {
    if (!customSlug) return;
    const err = validateSlug(customSlug);
    if (err) {
      setCustomSlugError(err);
      setCustomSlugTouched(true);
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/wishlists/${wishlistId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: customSlug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Link konnte nicht gespeichert werden.");
      if (onTokenRegenerated) {
        onTokenRegenerated(data.shareToken);
      }
      setCustomSlug(data.shareToken);
      setCustomSlugError(null);
      success("Link gespeichert: " + `${origin}/share/${data.shareToken}`);
    } catch (err: any) {
      setCustomSlugError(err.message || "Fehler beim Speichern.");
      error(err.message || "Fehler beim Speichern.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (
      !confirm(
        "Neuen zufälligen Link generieren? Der bisherige Link wird danach nicht mehr aufgerufen werden können.",
      )
    ) {
      return;
    }
    setIsRegenerating(true);
    try {
      const res = await fetch(`/api/wishlists/${wishlistId}/share`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (onTokenRegenerated) {
        onTokenRegenerated(data.shareToken);
      }
      setCustomSlug(data.shareToken);
      setCustomSlugError(null);
      success("Neuer Link generiert: " + `${origin}/share/${data.shareToken}`);
    } catch (err: any) {
      error(err.message || "Fehler beim Erneuern des Links.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const canSave = Boolean(customSlug && !customSlugError && customSlug !== activeSlug);

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

        {/* Aktiver Link */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Aktiver Link
            </label>
            <span className="ml-auto text-xs font-medium text-slate-400 dark:text-slate-500">
              Immer gültig bis du ihn zurücksetzt
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={activeUrl}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
            <Button size="sm" onClick={() => handleCopy(activeUrl)} className="shrink-0 h-10 px-3.5">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="hidden sm:inline">{copied ? "Kopiert" : "Kopieren"}</span>
            </Button>
          </div>
        </div>

        {/* Link selbst festlegen */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Link className="h-4 w-4" />
            Link selbst festlegen
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="meine-geburtstagsliste"
              value={customSlug}
              onChange={handleCustomSlugChange}
              onBlur={handleCustomSlugBlur}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
            <Button
              size="sm"
              onClick={handleSaveCustom}
              disabled={isSaving || !canSave}
              className="shrink-0 h-10 px-3.5"
            >
              Speichern
            </Button>
          </div>
          {customSlugTouched && customSlugError && (
            <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {customSlugError}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
            Vorschau:{" "}
            <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[14rem]">
              {origin}/share/{customSlug || activeSlug}
            </span>
          </div>
        </div>

        {/* Zufälligen Link generieren */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-1.5 w-full justify-center text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
              <span>Neuen zufälligen Link generieren (bisheriger wird ungültig)</span>
            </button>
          </div>
        </div>

        {/* Quick share buttons */}
        <div className="flex items-center gap-2 pt-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Hier ist meine Wunschliste für ${wishlistTitle}: ${activeUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 transition-colors"
          >
            <Share2 className="h-3.5 w-3.5 text-emerald-600" />
            WhatsApp
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent(`Wunschliste: ${wishlistTitle}`)}&body=${encodeURIComponent(`Schau dir meine Wunschliste an: ${activeUrl}`)}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 transition-colors"
          >
            E-Mail
          </a>
        </div>
      </div>
    </Modal>
  );
}

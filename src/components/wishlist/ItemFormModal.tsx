"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Sparkles } from "lucide-react";

export interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
}

export function ItemFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ItemFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "MUST_HAVE">("MEDIUM");
  const [quantity, setQuantity] = useState("1");
  const [variant, setVariant] = useState("");
  const [note, setNote] = useState("");
  const [tags, setTags] = useState("");
  const [isGroupGift, setIsGroupGift] = useState(false);
  const [targetAmount, setTargetAmount] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setUrl(initialData.url || "");
      setImageUrl(initialData.imageUrl || "");
      setPrice(initialData.price !== null && initialData.price !== undefined ? String(initialData.price) : "");
      setCurrency(initialData.currency || "EUR");
      setPriority(initialData.priority || "MEDIUM");
      setQuantity(String(initialData.quantity || 1));
      setVariant(initialData.variant || "");
      setNote(initialData.note || "");
      setTags(initialData.tags || "");
      setIsGroupGift(initialData.isGroupGift || false);
      setTargetAmount(initialData.targetAmount ? String(initialData.targetAmount) : "");
    } else {
      setTitle("");
      setDescription("");
      setUrl("");
      setImageUrl("");
      setPrice("");
      setCurrency("EUR");
      setPriority("MEDIUM");
      setQuantity("1");
      setVariant("");
      setNote("");
      setTags("");
      setIsGroupGift(false);
      setTargetAmount("");
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload fehlgeschlagen.");

      setImageUrl(data.url);
    } catch (err: any) {
      setError(err.message || "Fehler beim Hochladen.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Bitte gib einen Titel an.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        url: url.trim() || null,
        imageUrl: imageUrl.trim() || null,
        price: price ? parseFloat(price) : null,
        currency,
        priority,
        quantity: parseInt(quantity, 10) || 1,
        variant: variant.trim() || null,
        note: note.trim() || null,
        tags: tags.trim() || null,
        isGroupGift,
        targetAmount: isGroupGift && targetAmount ? parseFloat(targetAmount) : isGroupGift && price ? parseFloat(price) : null,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || "Fehler beim Speichern des Wunsches.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Wunsch bearbeiten" : "Neuen Wunsch hinzufügen"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1 pr-2">
        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
            {error}
          </div>
        )}

        <Input
          label="Titel des Geschenks *"
          placeholder="z.B. Warme Kuscheldecke, LEGO Raumschiff, Buch..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Link zum Shop / Produkt (optional)"
            type="url"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                label="Preis"
                type="number"
                step="0.01"
                min="0"
                placeholder="29.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Währung
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-10 px-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="EUR">EUR (€)</option>
                <option value="CHF">CHF</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Priorität
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="LOW">Wäre nett (Niedrig)</option>
              <option value="MEDIUM">Mittlere Priorität</option>
              <option value="HIGH">Hohe Priorität</option>
              <option value="MUST_HAVE">Herzblut / Wunsch-Highlight ★</option>
            </select>
          </div>

          <div className="flex gap-2">
            <div className="w-28">
              <Input
                label="Menge"
                type="number"
                min="1"
                max="99"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                label="Größe / Variante"
                placeholder="z.B. Größe M, Blau"
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Bild URL oder Upload */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Bild (URL oder Datei-Upload)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/bild.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            <label className="shrink-0 flex items-center justify-center px-3.5 h-10 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer text-xs font-medium gap-1.5 transition-colors">
              <Upload className="h-4 w-4" />
              <span>{isUploading ? "Lädt..." : "Upload"}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <Textarea
          label="Beschreibung"
          placeholder="Details zum Geschenk, warum du es dir wünschst..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Textarea
          label="Notiz für den Schenkenden (optional)"
          placeholder="z.B. 'Bitte vorher kurz absprechen' oder 'Gutschein auch gerne!'"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        {/* Gruppengeschenk Option */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-2.5">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isGroupGift}
              onChange={(e) => setIsGroupGift(e.target.checked)}
              className="h-4 w-4 rounded text-violet-600 focus:ring-violet-500"
            />
            <div>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Als Gruppen-Geschenk markieren
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mehrere Personen können Teilbeträge beitragen (z.B. für teurere Anschaffungen).
              </p>
            </div>
          </label>

          {isGroupGift && (
            <div className="pt-2">
              <Input
                label="Zielbetrag für die Finanzierung"
                type="number"
                step="0.01"
                min="1"
                placeholder={price || "z.B. 150.00"}
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                helper="Falls leer gelassen, wird der reguläre Preis als Zielbetrag verwendet."
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Abbrechen
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {initialData ? "Änderungen speichern" : "Wunsch hinzufügen"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

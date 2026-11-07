"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Archive, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

export default function EditWishlistPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [occasion, setOccasion] = useState("OTHER");
  const [eventDate, setEventDate] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/wishlists/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.wishlist) {
          setTitle(data.wishlist.title || "");
          setDescription(data.wishlist.description || "");
          setOccasion(data.wishlist.occasion || "OTHER");
          setEventDate(
            data.wishlist.eventDate
              ? new Date(data.wishlist.eventDate).toISOString().split("T")[0]
              : ""
          );
          setIsPublic(data.wishlist.isPublic || false);
          setIsArchived(data.wishlist.isArchived || false);
        }
      })
      .catch(() => {
        setError("Wunschliste konnte nicht geladen werden.");
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch(`/api/wishlists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          occasion,
          eventDate: eventDate ? new Date(eventDate).toISOString() : null,
          isPublic,
          isArchived,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      success("Wunschliste erfolgreich aktualisiert!");
      router.push(`/wishlists/${id}`);
    } catch (err: any) {
      setError(err.message || "Fehler beim Speichern.");
      toastError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (
      !confirm(
        "ACHTUNG: Möchtest du diese Wunschliste und alle Wünsche endgültig löschen? Diese Aktion kann nicht rückgängig gemacht werden!"
      )
    )
      return;

    try {
      const res = await fetch(`/api/wishlists/${id}?permanent=true`, { method: "DELETE" });
      if (!res.ok) throw new Error("Fehler beim Löschen.");
      success("Wunschliste endgültig gelöscht.");
      router.push("/dashboard");
    } catch (err: any) {
      toastError(err.message);
    }
  };

  if (isFetching) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-xs text-slate-500">
        Laden...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-6">
      <div>
        <Link
          href={`/wishlists/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Zurück zur Wunschliste
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Wunschliste bearbeiten
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Passe Titel, Anlass und Sichtbarkeit an.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Titel *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Anlass
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="BIRTHDAY">Geburtstag</option>
                <option value="CHRISTMAS">Weihnachten</option>
                <option value="BABY">Geburt & Baby</option>
                <option value="WEDDING">Hochzeit</option>
                <option value="MOVING">Umzug & Einzug</option>
                <option value="OTHER">Sonstiger Anlass</option>
              </select>
            </div>

            <Input
              label="Datum des Anlasses"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>

          <Textarea
            label="Beschreibung / Begrüßungstext für Gäste"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Privacy Toggle */}
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                {isPublic ? <Globe className="h-4 w-4 text-violet-600" /> : <Lock className="h-4 w-4 text-emerald-600" />}
                {isPublic ? "Öffentlich auffindbar" : "Privat (Nur per geheimem Einladungslink)"}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>
          </div>

          {/* Archive Toggle */}
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Archive className="h-4 w-4 text-slate-600" />
                Liste archivieren
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isArchived}
                  onChange={(e) => setIsArchived(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Archivierte Listen werden im Dashboard standardmäßig ausgeblendet.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link href={`/wishlists/${id}`}>
              <Button type="button" variant="outline" disabled={isLoading}>
                Abbrechen
              </Button>
            </Link>
            <Button type="submit" isLoading={isLoading} className="gap-2">
              <Save className="h-4 w-4" />
              <span>Speichern</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="rounded-3xl border border-rose-200/80 bg-rose-50/40 p-6 sm:p-8 dark:border-rose-950 dark:bg-rose-950/20 space-y-4">
        <h2 className="text-base font-bold text-rose-800 dark:text-rose-200">
          Gefahrenzone
        </h2>
        <p className="text-xs text-rose-700 dark:text-rose-300">
          Das endgültige Löschen entfernt die Wunschliste und alle enthaltenen Wünsche unwiderruflich aus der Datenbank.
        </p>
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={handlePermanentDelete}
          className="gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Endgültig löschen
        </Button>
      </div>
    </div>
  );
}

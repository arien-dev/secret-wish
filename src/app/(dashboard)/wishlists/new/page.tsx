"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Gift, Lock, Globe, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

export default function NewWishlistPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [occasion, setOccasion] = useState("BIRTHDAY");
  const [eventDate, setEventDate] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [familyId, setFamilyId] = useState<string>("");
  const [childMemberId, setChildMemberId] = useState<string>("");

  const [families, setFamilies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch available family rooms for dropdown
    fetch("/api/families")
      .then((res) => res.json())
      .then((data) => {
        if (data.families) {
          setFamilies(data.families);
        }
      })
      .catch(() => {});
  }, []);

  const selectedFamily = families.find((f) => f.id === familyId);
  const childrenMembers = selectedFamily?.members?.filter((m: any) => m.role === "CHILD") || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Bitte gib einen Titel für die Wunschliste ein.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/wishlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          occasion,
          eventDate: eventDate ? new Date(eventDate).toISOString() : null,
          isPublic,
          familyId: familyId || null,
          childMemberId: childMemberId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      success("Wunschliste erfolgreich erstellt!");
      router.push(`/wishlists/${data.wishlist.id}`);
    } catch (err: any) {
      setError(err.message || "Fehler beim Erstellen der Liste.");
      toastError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Zurück zur Übersicht
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md shadow-violet-500/30">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Neue Wunschliste anlegen
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gestalte deine Liste und teile sie privat mit deinen Liebsten.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Titel der Wunschliste *"
            placeholder="z.B. Mein 30. Geburtstag, Weihnachten 2026..."
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
              label="Datum des Anlasses (optional)"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>

          <Textarea
            label="Beschreibung / Begrüßungstext für Gäste (optional)"
            placeholder="Schreibe ein paar liebe Worte für deine Gäste..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Familienraum Option */}
          {families.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-violet-600" /> Familienraum zuordnen (optional)
              </label>
              <select
                value={familyId}
                onChange={(e) => {
                  setFamilyId(e.target.value);
                  setChildMemberId("");
                }}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">Keinem Familienraum zuordnen (nur für mich)</option>
                {families.map((fam) => (
                  <option key={fam.id} value={fam.id}>
                    {fam.name}
                  </option>
                ))}
              </select>

              {familyId && childrenMembers.length > 0 && (
                <div className="pt-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Liste für ein Kind verwalten?
                  </label>
                  <select
                    value={childMemberId}
                    onChange={(e) => setChildMemberId(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="">Für mich selbst</option>
                    {childrenMembers.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        Für {c.childName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

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
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isPublic
                ? "Jeder, der den Link hat oder die Liste sieht, kann Wünsche ansehen."
                : "Empfohlen: Nur Personen mit deinem geheimen Share-Link können die Liste öffnen."}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link href="/dashboard">
              <Button type="button" variant="outline" disabled={isLoading}>
                Abbrechen
              </Button>
            </Link>
            <Button type="submit" isLoading={isLoading} className="shadow-md">
              Liste erstellen
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

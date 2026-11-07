"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Plus, KeyRound, Copy, Check, Sparkles, UserPlus, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function FamiliesPage() {
  const { success, error: toastError } = useToast();
  const [families, setFamilies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [familyName, setFamilyName] = useState("");

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>("");
  const [childName, setChildName] = useState("");

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchFamilies = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/families");
      const data = await res.json();
      if (res.ok && data.families) {
        setFamilies(data.families);
      }
    } catch {
      toastError("Familienräume konnten nicht geladen werden.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) return;

    try {
      const res = await fetch("/api/families", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: familyName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      success("Familienraum erfolgreich erstellt!");
      setIsCreateModalOpen(false);
      setFamilyName("");
      await fetchFamilies();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    try {
      const res = await fetch("/api/families/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: inviteCode.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      success("Erfolgreich dem Familienraum beigetreten!");
      setIsJoinModalOpen(false);
      setInviteCode("");
      await fetchFamilies();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim() || !selectedFamilyId) return;

    try {
      const res = await fetch(`/api/families/${selectedFamilyId}/children`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childName: childName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      success(`Profil für ${childName} angelegt!`);
      setIsAddChildModalOpen(false);
      setChildName("");
      await fetchFamilies();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const copyInvite = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    success("Einladungscode kopiert!");
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Users className="h-7 w-7 text-violet-600" />
            Familienräume
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Koordiniere Geschenke gemeinsam. Verwalte Wunschlisten für Kinder ohne eigene E-Mail.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="md"
            variant="outline"
            onClick={() => setIsJoinModalOpen(true)}
          >
            <KeyRound className="h-4 w-4 mr-1.5" />
            Raum beitreten
          </Button>

          <Button
            size="md"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Raum gründen
          </Button>
        </div>
      </div>

      {/* Families List */}
      {isLoading ? (
        <div className="text-center py-16 text-xs text-slate-500">Laden...</div>
      ) : families.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
            <Users className="h-7 w-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Noch keinem Familienraum beigetreten
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gründe einen eigenen Familienraum oder tritt einem bestehenden Raum mit einem Einladungscode bei.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Button size="md" onClick={() => setIsCreateModalOpen(true)}>
              Raum gründen
            </Button>
            <Button size="md" variant="outline" onClick={() => setIsJoinModalOpen(true)}>
              Mit Code beitreten
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {families.map((fam) => {
            const members = fam.members || [];
            const adults = members.filter((m: any) => m.role !== "CHILD");
            const children = members.filter((m: any) => m.role === "CHILD");

            return (
              <Card key={fam.id} className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {fam.name}
                    </h3>
                    <Badge variant="default" className="text-[10px] mt-1">
                      Rolle: {fam.myRole}
                    </Badge>
                  </div>

                  {/* Invite Code Badge */}
                  <button
                    onClick={() => copyInvite(fam.inviteCode)}
                    className="flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-mono font-semibold text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300 transition-colors"
                    title="Einladungscode kopieren"
                  >
                    <span>Code: {fam.inviteCode}</span>
                    {copiedCode === fam.inviteCode ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>

                {/* Adults / Members */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                    Mitglieder ({adults.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {adults.map((m: any) => (
                      <span
                        key={m.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {m.user?.name || "Mitglied"}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Children Profiles */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Baby className="h-3.5 w-3.5" />
                      Kinder-Profile ({children.length}):
                    </span>
                    <button
                      onClick={() => {
                        setSelectedFamilyId(fam.id);
                        setIsAddChildModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Kind anlegen
                    </button>
                  </div>

                  {children.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      Noch keine Kinder-Profile angelegt.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {children.map((c: any) => (
                        <span
                          key={c.id}
                          className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200"
                        >
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          {c.childName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Family Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Familienraum gründen"
        description="Erstelle einen gemeinsamen Raum für deine Familie oder WG."
        maxWidth="md"
      >
        <form onSubmit={handleCreateFamily} className="space-y-4 pt-1">
          <Input
            label="Name des Familienraums *"
            placeholder="z.B. Familie Schmidt, WG Sonnenblume..."
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit">Raum gründen</Button>
          </div>
        </form>
      </Modal>

      {/* Join Family Modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title="Familienraum beitreten"
        description="Gib den 8-stelligen Einladungscode ein, den du erhalten hast."
        maxWidth="md"
      >
        <form onSubmit={handleJoinFamily} className="space-y-4 pt-1">
          <Input
            label="Einladungscode *"
            placeholder="z.B. AB34XY79"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            required
            className="uppercase font-mono tracking-widest text-center text-lg"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsJoinModalOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit">Beitreten</Button>
          </div>
        </form>
      </Modal>

      {/* Add Child Modal */}
      <Modal
        isOpen={isAddChildModalOpen}
        onClose={() => setIsAddChildModalOpen(false)}
        title="Kinder-Profil anlegen"
        description="Kinder benötigen kein eigenes Benutzerkonto oder E-Mail-Adresse."
        maxWidth="md"
      >
        <form onSubmit={handleAddChild} className="space-y-4 pt-1">
          <Input
            label="Name des Kindes *"
            placeholder="z.B. Leo, Mia, Paul..."
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            required
          />

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Eltern können anschließend Wunschlisten für das Kind erstellen. Geschenke können von Verwandten reserviert werden, ohne dass die Eltern die Überraschung sehen!
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddChildModalOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit">Profil speichern</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

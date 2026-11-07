"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSubmitted(true);
      if (data.resetTokenForDev) {
        setDevResetToken(data.resetTokenForDev);
      }
    } catch (err: any) {
      setError(err.message || "Fehler beim Absenden der Anfrage.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Passwort vergessen?
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gib deine E-Mail-Adresse ein, um einen Link zum Zurücksetzen zu erhalten.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-emerald-50 p-4 text-xs text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
              Falls ein Konto mit dieser E-Mail-Adresse existiert, wurde eine E-Mail mit weiteren Anweisungen versendet.
            </div>

            {devResetToken && (
              <div className="rounded-2xl bg-amber-50 p-4 text-xs text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-200 dark:border-amber-800 space-y-2">
                <span className="font-bold block">Entwicklungs-Modus (Kein SMTP konfiguriert):</span>
                <p>Direktlink zum Zurücksetzen:</p>
                <Link
                  href={`/reset-password?token=${devResetToken}`}
                  className="font-mono text-violet-600 underline block break-all"
                >
                  /reset-password?token={devResetToken}
                </Link>
              </div>
            )}

            <Link href="/login" className="block text-center">
              <Button variant="outline" className="w-full">
                Zurück zur Anmeldung
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                {error}
              </div>
            )}

            <Input
              label="E-Mail-Adresse"
              type="email"
              placeholder="deine@email.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" className="w-full h-11" isLoading={isLoading}>
              Reset-Link anfordern
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Zurück zum Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

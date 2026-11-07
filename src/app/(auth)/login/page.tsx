"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gift, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();
  const { error: toastError, success } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Anmeldung fehlgeschlagen.");
      }

      success(`Willkommen zurück, ${data.user.name}!`);
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      toastError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md shadow-violet-500/30">
            <Gift className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Willkommen zurück
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Melde dich an, um deine Wunschlisten zu verwalten.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 p-3.5 text-xs text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="E-Mail-Adresse"
            type="email"
            placeholder="deine@email.de"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Passwort
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 font-medium"
              >
                Vergessen?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full h-11" isLoading={isLoading}>
            Anmelden
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          Noch kein Konto?{" "}
          <Link
            href="/register"
            className="font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400"
          >
            Jetzt kostenlos registrieren
          </Link>
        </div>
      </div>
    </div>
  );
}

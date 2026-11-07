import Link from "next/link";
import { Gift, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-5 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
          <Gift className="h-7 w-7" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Seite nicht gefunden (404)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Diese Wunschliste oder Seite existiert nicht oder der Link ist abgelaufen.
          </p>
        </div>

        <Link href="/">
          <Button size="md" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Zur Startseite</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

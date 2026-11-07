import Link from "next/link";
import { ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white/60 py-8 text-xs text-slate-500 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">SecretWish</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" /> 100% Datenschutz & Zero-Knowledge
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            Mit <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> für Familien gebaut
          </span>
          <span>•</span>
          <Link
            href="https://www.gnu.org/licenses/agpl-3.0.de.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            AGPL-3.0 Open Source
          </Link>
        </div>
      </div>
    </footer>
  );
}

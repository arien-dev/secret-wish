"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Gift, Home, Users, Bell, LogOut, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  user?: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      // Fallback
      window.location.href = "/login";
    }
  };

  const navLinks = [
    { href: "/dashboard", label: "Übersicht", icon: Home },
    { href: "/families", label: "Familienräume", icon: Users },
    { href: "/notifications", label: "Mitteilungen", icon: Bell },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 font-bold text-lg text-slate-900 dark:text-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm shadow-violet-500/30">
            <Gift className="h-5 w-5" />
          </div>
          <span>Secret<span className="text-violet-600 dark:text-violet-400">Wish</span></span>
        </Link>

        {/* Navigation for logged in users */}
        {user ? (
          <>
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2.5">
              <Link href="/wishlists/new">
                <Button size="sm" className="hidden sm:inline-flex">
                  <Plus className="h-4 w-4" />
                  <span>Neue Liste</span>
                </Button>
              </Link>
              <ThemeToggle />
              <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  title="Abmelden"
                  className="rounded-xl p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-300 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Anmelden
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                Registrieren
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

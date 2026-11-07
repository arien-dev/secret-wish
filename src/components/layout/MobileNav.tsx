"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Bell, PlusCircle } from "lucide-react";

interface MobileNavProps {
  user?: {
    id: string;
    email: string;
    name: string;
  } | null;
}

export function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname();

  if (!user) return null;

  const links = [
    { href: "/dashboard", label: "Listen", icon: Home },
    { href: "/wishlists/new", label: "Neu", icon: PlusCircle, isHighlight: true },
    { href: "/families", label: "Familie", icon: Users },
    { href: "/notifications", label: "Mitteilungen", icon: Bell },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200/80 bg-white/95 px-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));

        if (link.isHighlight) {
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center justify-center"
            >
              <div className="flex h-11 w-11 -translate-y-2 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-500/40 active:scale-95 transition-transform">
                <Icon className="h-6 w-6" />
              </div>
              <span className="-translate-y-1 text-[11px] font-medium text-violet-600 dark:text-violet-400">
                {link.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-1 text-[11px] font-medium transition-colors ${
              isActive
                ? "text-violet-600 dark:text-violet-400"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

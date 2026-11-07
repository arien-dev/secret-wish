"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCheck, Gift, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

export default function NotificationsPage() {
  const { success, error: toastError } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (res.ok && data.notifications) {
        setNotifications(data.notifications);
      }
    } catch {
      toastError("Benachrichtigungen konnten nicht geladen werden.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications/read-all", { method: "POST" });
      if (!res.ok) throw new Error("Fehler beim Aktualisieren.");
      success("Alle Benachrichtigungen als gelesen markiert.");
      await fetchNotifications();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date() } : n))
      );
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Bell className="h-7 w-7 text-violet-600" />
            Mitteilungen
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Status-Updates zu deinen Wunschlisten (vollkommen anonymisiert).
          </p>
        </div>

        {unreadCount > 0 && (
          <Button size="sm" variant="outline" onClick={handleMarkAllRead} className="gap-1.5">
            <CheckCheck className="h-4 w-4" />
            <span>Alle als gelesen markieren</span>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-xs text-slate-500">Laden...</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <Bell className="h-10 w-10 text-slate-400 mx-auto opacity-40" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Keine neuen Mitteilungen
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sobald Gäste einen Wunsch reservieren oder Gruppen-Geschenke das Ziel erreichen, wirst du hier informiert.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const isUnread = !n.readAt;
            return (
              <div
                key={n.id}
                onClick={() => isUnread && handleMarkSingleRead(n.id)}
                className={`flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                  isUnread
                    ? "bg-violet-50/60 border-violet-200 dark:bg-violet-950/30 dark:border-violet-900/50 shadow-sm"
                    : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 opacity-80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                      n.type === "GROUP_GIFT_COMPLETE"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                    }`}
                  >
                    {n.type === "GROUP_GIFT_COMPLETE" ? (
                      <Sparkles className="h-5 w-5" />
                    ) : (
                      <Gift className="h-5 w-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {n.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {n.body}
                    </p>
                    <span className="text-[11px] text-slate-400 block pt-0.5">
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                </div>

                {isUnread && (
                  <span className="h-2 w-2 rounded-full bg-violet-600 shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

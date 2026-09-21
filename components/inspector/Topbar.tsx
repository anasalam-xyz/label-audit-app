"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, UserRound } from "lucide-react";
import { getStoredUser, clearSession } from "@/lib/auth-storage";

export default function Topbar() {
  const router = useRouter();
  const notificationRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setName(getStoredUser()?.name ?? null);
  }, []);

  // Close notification popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleLogout() {
    clearSession();
    router.push("/login");
  }
  function getInitials(name: string | null) {
  if (!name) return "?";

  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  }

  return (
    <header className="mb-2 shadow-sm border-muted flex items-center justify-between px-5 py-3">
    
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-ink text-surface text-sm font-semibold text-dark shadow-sm transition-transform duration-200 hover:scale-[1.03]">
            {getInitials(name)}
          </div>
          {/* Online indicator */}
        </div>

        <div className="leading-tight">
          <p className="mb-0.5 text-xs font-medium text-muted">
            Welcome back
          </p>

          <p className="max-w-[180px] truncate text-base font-semibold tracking-[-0.01em] text-ink">
            {name ?? "…"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div ref={notificationRef} className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications((current) => !current)}
            aria-label="Notifications"
            aria-expanded={showNotifications}
            className={[
              "group relative flex h-11 w-11 items-center justify-center rounded-full",
              "border border-border bg-surface text-muted shadow-sm",
              "transition-all duration-200 ease-out",
              "hover:-translate-y-0.5 hover:border-dark/20 hover:text-dark hover:shadow-md",
              "active:translate-y-0 active:scale-95",
              showNotifications
                ? "border-dark/20 bg-dark text-white shadow-md"
                : "",
            ].join(" ")}
          >
            <Bell
              size={18}
              strokeWidth={1.8}
              className="transition-transform duration-200 group-hover:rotate-[-8deg]"
            />

            {/* Notification indicator */}
            {/**}<span
              className={[
                "absolute right-2.5 top-2.5 h-2 w-2 rounded-full",
                "bg-violation ring-2 ring-surface",
                "transition-all duration-200",
                showNotifications ? "scale-0 opacity-0" : "scale-100 opacity-100",
              ].join(" ")}
            />**/}
          </button>

          {/* Notification popover */}
          <div
            className={[
              "absolute right-0 top-[calc(100%+0.75rem)] z-50 w-80 origin-top-right",
              "transition-all duration-200 ease-out",
              showNotifications
                ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                : "pointer-events-none -translate-y-2 scale-95 opacity-0",
            ].join(" ")}
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xl shadow-ink/10">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
                <div>
                  <h3 className="text-sm font-semibold text-ink">
                    Notifications
                  </h3>
                  <p className="mt-0.5 text-xs text-muted">
                    Stay up to date
                  </p>
                </div>

                <span className="rounded-full bg-bg px-2.5 py-1 text-[11px] font-medium text-muted">
                  0 new
                </span>
              </div>

              {/* Empty state */}
              <div className="flex flex-col items-center px-6 py-9 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg text-muted">
                  <Bell size={22} strokeWidth={1.7} />
                </div>

                <p className="text-sm font-semibold text-ink">
                  No new notifications
                </p>

                <p className="mt-1 max-w-[220px] text-xs leading-5 text-muted">
                  You&apos;re all caught up. New alerts and updates will appear
                  here.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          className="group flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface text-muted shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-violation/20 hover:bg-violation-bg hover:text-violation hover:shadow-md active:translate-y-0 active:scale-95"
        >
          <LogOut
            size={18}
            strokeWidth={1.8}
            className="text-red-600 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </header>
  );
}

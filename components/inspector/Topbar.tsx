"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, UserRound, Bell } from "lucide-react";
import { getStoredUser, clearSession } from "@/lib/auth-storage";

export default function Topbar() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    setName(getStoredUser()?.name ?? null);
  }, []);

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <header className="flex items-center justify-between px-5 pt-6 pb-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-muted">
          <UserRound size={20} />
        </span>
        <div>
          <p className="text-xs text-muted">Welcome Back 👋</p>
          <p className="text-base font-semibold text-ink">{name ?? "…"}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-ink">
          <Bell size={18} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-violation" />
        </button>

        <button
          onClick={handleLogout}
          aria-label="Log out"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-muted"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

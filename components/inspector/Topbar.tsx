import { UserRound, Bell } from "lucide-react";

export default function Topbar({
  name = "Rakesh Kumar",
  greeting = "Welcome Back",
}: {
  name?: string;
  greeting?: string;
}) {
  return (
    <header className="w-full flex items-center justify-between px-5 pt-6 pb-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-muted">
          <UserRound size={20} />
        </span>
        <div>
          <p className="text-xs text-muted">{greeting}</p>
          <p className="text-base font-semibold text-ink">{name}</p>
        </div>
      </div>
      <button className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-ink">
        <Bell size={18} />
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-violation" />
      </button>
    </header>
  );
}

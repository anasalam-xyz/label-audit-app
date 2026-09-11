import { UserRound } from "lucide-react";

export default function Topbar() {
  return(
    <header className="border-b border-stone-200 bg-white/70 px-8 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14213D] text-white">
              <UserRound className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-lg leading-tight text-[#14213D]">Inspectors</p>
              <p className="text-xs text-stone-400">Field roster and performance across all zones</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-[#14213D]">Deputy Controller, Zone III</p>
              <p className="text-xs text-stone-400">Friday, 11 Sept 2026</p>
            </div>
            <span className="hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-[#B8873D]/15 font-display text-sm text-[#8A6529]">
              DC
            </span>
          </div>
        </div>
      </header>

  );
}

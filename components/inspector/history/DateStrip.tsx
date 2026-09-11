"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function startOfWeek(base: Date) {
  const d = new Date(base);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function DateStrip({
  selected,
  onSelect,
}: {
  selected: Date;
  onSelect: (d: Date) => void;
}) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(selected));

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  function shiftWeek(delta: number) {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + delta * 7);
    setWeekStart(next);
  }

  return (
    <div className="rounded-card bg-dark px-5 py-5 text-white">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => shiftWeek(-1)} aria-label="Previous week">
          <ChevronLeft size={18} />
        </button>
        <p className="text-base font-semibold">{MONTH[weekStart.getMonth()]}</p>
        <button onClick={() => shiftWeek(1)} aria-label="Next week">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex justify-between">
        {days.map((d) => {
          const isSelected = d.toDateString() === selected.toDateString();
          return (
            <button key={d.toISOString()} onClick={() => onSelect(d)} className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-white/60">{WEEKDAY[d.getDay()]}</span>
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  isSelected ? "bg-accent text-accent-ink" : "text-white"
                }`}
              >
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

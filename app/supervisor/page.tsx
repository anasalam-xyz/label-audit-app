"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpRight,
  Package,
  Users2,
  Timer,
  ShieldCheck,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Static data — replace with API calls once the backend is wired up */
/* ------------------------------------------------------------------ */

type Status = "violation" | "review" | "compliant";

type EscalatedCase = {
  id: string;
  product: string;
  category: string;
  status: Status;
  issue: string;
  inspector: string;
  location: string;
  day: number; // day of September 2026
  time: string;
};

const CASES: EscalatedCase[] = [
  {
    id: "LM-2609-0417",
    product: "Suraksha Refined Sunflower Oil, 1L",
    category: "MRP Declaration",
    status: "violation",
    issue: "MRP printed in a font smaller than the prescribed 1mm minimum height.",
    inspector: "Rohan Mehta",
    location: "Andheri, Mumbai",
    day: 11,
    time: "09:42",
  },
  {
    id: "LM-2609-0418",
    product: "Devbhoomi Garam Masala, 100g",
    category: "Manufacturer Address",
    status: "violation",
    issue: "Packer's complete address missing — only city and state declared.",
    inspector: "Priya Nair",
    location: "Whitefield, Bengaluru",
    day: 11,
    time: "11:05",
  },
  {
    id: "LM-2609-0409",
    product: "Amrit Dairy Toned Milk Powder, 500g",
    category: "Net Quantity",
    status: "review",
    issue: "Declared net quantity under verification against sample weight.",
    inspector: "Arjun Singh",
    location: "Kothrud, Pune",
    day: 11,
    time: "14:18",
  },
  {
    id: "LM-2609-0401",
    product: "Nirmal Herbal Toothpaste, 150g",
    category: "Manufacture Date",
    status: "violation",
    issue: "Month and year of manufacture absent from the primary display panel.",
    inspector: "Kavita Rao",
    location: "T. Nagar, Chennai",
    day: 9,
    time: "16:30",
  },
  {
    id: "LM-2608-0392",
    product: "Himveda Basmati Rice, 5kg",
    category: "Consumer Care",
    status: "review",
    issue: "Consumer care contact listed without a working toll-free number.",
    inspector: "Sameer Iyer",
    location: "Sector 62, Noida",
    day: 8,
    time: "10:52",
  },
  {
    id: "LM-2608-0384",
    product: "Coastal Fresh Fish Pickle, 250g",
    category: "Font Size",
    status: "violation",
    issue: "Declarations printed at 0.7mm — below the mandated font size for pack area.",
    inspector: "Rohan Mehta",
    location: "Vashi, Navi Mumbai",
    day: 8,
    time: "13:07",
  },
  {
    id: "LM-2608-0377",
    product: "Vaibhav Wheat Flour, 10kg",
    category: "MRP Declaration",
    status: "compliant",
    issue: "Re-inspection confirmed corrected MRP sticker across the batch.",
    inspector: "Priya Nair",
    location: "Malviya Nagar, Jaipur",
    day: 4,
    time: "12:00",
  },
  {
    id: "LM-2608-0361",
    product: "Kesar Ghee, 1kg Tin",
    category: "Net Quantity",
    status: "violation",
    issue: "Actual weight 962g against declared 1000g, exceeding permissible error.",
    inspector: "Kavita Rao",
    location: "Bhandup, Mumbai",
    day: 2,
    time: "17:24",
  },
];

const VIOLATIONS_BY_CATEGORY = [
  { label: "Net Quantity", value: 41 },
  { label: "MRP Declaration", value: 36 },
  { label: "Mfr. Address", value: 22 },
  { label: "Font Size", value: 19 },
  { label: "Mfg. Date", value: 14 },
  { label: "Consumer Care", value: 9 },
];

const STATUS_BREAKDOWN: { label: string; value: number; color: string }[] = [
  { label: "Compliant", value: 62, color: "#15803D" },
  { label: "Under review", value: 23, color: "var(--color-review)" },
  { label: "Violation", value: 15, color: "var(--color-violation)" },
];

/* ------------------------------------------------------------------ */
/*  September 2026 calendar geometry (Sept 1 falls on a Tuesday)      */
/* ------------------------------------------------------------------ */

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const LEADING_BLANKS = 2; // Sun, Mon before Sept 1
const DAYS_IN_MONTH = 30;
const TODAY = 11;

const casesByDay = CASES.reduce<Record<number, EscalatedCase[]>>((acc, c) => {
  acc[c.day] = acc[c.day] ? [...acc[c.day], c] : [c];
  return acc;
}, {});

/* ------------------------------------------------------------------ */
/*  Small presentational pieces                                       */
/* ------------------------------------------------------------------ */

function statusTint(status: Status) {
  if (status === "violation")
    return { text: "text-violation", bg: "bg-violation-bg", dot: "bg-[var(--color-violation)]" };
  if (status === "review")
    return { text: "text-review", bg: "bg-review-bg", dot: "bg-[var(--color-review)]" };
  return { text: "text-[#15803D]", bg: "bg-[#F0FDF4]", dot: "bg-[#15803D]" };
}

function CircularStat({
  label,
  value,
  suffix = "%",
  color,
  detail,
  delay = 0,
}: {
  label: string;
  value: number;
  suffix?: string;
  color: string;
  detail: string;
  delay?: number;
}) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -3 }}
      className="rounded-card border border-stone-200 bg-white p-5 shadow-[0_1px_2px_rgba(20,33,61,0.04)] transition-shadow hover:shadow-[0_10px_24px_rgba(20,33,61,0.08)]"
    >
      <div className="flex items-center gap-4">
        <svg width="76" height="76" viewBox="0 0 76 76" className="-rotate-90 shrink-0">
          <circle cx="38" cy="38" r={radius} fill="none" stroke="#EEECE3" strokeWidth="7" />
          <motion.circle
            cx="38"
            cy="38"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, delay: delay + 0.15, ease: "easeOut" }}
          />
        </svg>
        <div className="min-w-0">
          <p className="font-display text-2xl leading-none text-[#14213D]">
            {value}
            <span className="text-lg">{suffix}</span>
          </p>
          <p className="mt-1.5 text-sm font-medium text-stone-600">{label}</p>
          <p className="mt-0.5 text-xs text-stone-400">{detail}</p>
        </div>
      </div>
    </motion.div>
  );
}

function CaseRow({ c, index }: { c: EscalatedCase; index: number }) {
  const tint = statusTint(c.status);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ x: 4 }}
      className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-4 transition-colors hover:border-stone-300 hover:bg-stone-50"
    >
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${tint.dot}`} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium text-[#14213D]">{c.product}</p>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tint.text} ${tint.bg}`}>
            {c.status === "violation" ? "Violation" : c.status === "review" ? "Under review" : "Compliant"}
          </span>
        </div>
        <p className="mt-1 text-sm text-stone-500">{c.issue}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400">
          <span className="font-mono">{c.id}</span>
          <span className="inline-flex items-center gap-1">
            <Users2 className="h-3 w-3" /> {c.inspector}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {c.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {c.time}
          </span>
        </div>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-stone-300 opacity-0 transition-opacity group-hover:opacity-100" />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Page() {
  const [selectedDay, setSelectedDay] = useState<number>(TODAY);
  const [monthOffset, setMonthOffset] = useState(0); // visual only, static data is Sept 2026

  const visibleCases = useMemo(
    () => (casesByDay[selectedDay] ?? []).slice().sort((a, b) => a.time.localeCompare(b.time)),
    [selectedDay]
  );

  const openViolations = CASES.filter((c) => c.status === "violation").length;
  const maxBar = Math.max(...VIOLATIONS_BY_CATEGORY.map((d) => d.value));

  return (
    <div className="min-h-screen bg-[#F1F2ED] pb-16">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/70 px-8 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14213D] text-white">
              <Scale className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-lg leading-tight text-[#14213D]">Supervisor Console</p>
              <p className="text-xs text-stone-400">Legal Metrology (Packaged Commodities) Rules, 2011</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-400 sm:flex">
            <Search className="h-4 w-4" />
            <span>Search product, case ID or inspector</span>
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

      <main className="mx-auto mt-8 max-w-6xl px-8">
        {/* Stat row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:grid-cols-4">
          <CircularStat
            label="Compliance rate"
            value={78}
            color="#15803D"
            detail="Across 612 scans this month"
            delay={0}
          />
          <CircularStat
            label="Resolution rate"
            value={64}
            color="#B8873D"
            detail="Escalations closed on time"
            delay={0.06}
          />
          <CircularStat
            label="Pending review"
            value={23}
            color="var(--color-review)"
            detail="Awaiting supervisor sign-off"
            delay={0.12}
          />
          <CircularStat
            label="Open violations"
            value={15}
            color="var(--color-violation)"
            detail={`${openViolations} cases require action`}
            delay={0.18}
          />
        </div>

        {/* Main grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Escalated cases + calendar */}
          <section className="rounded-card border border-stone-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl text-[#14213D]">Escalated cases</h2>
                <p className="text-sm text-stone-400">Sent to you by field inspectors for review</p>
              </div>
              <span className="rounded-full bg-[#14213D] px-3 py-1 text-xs font-medium text-white">
                {CASES.length} this cycle
              </span>
            </div>

            {/* Calendar */}
            <div className="mt-5 rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <div className="flex items-center justify-between px-1">
                <button
                  onClick={() => setMonthOffset((m) => m - 1)}
                  className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-600"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <p className="font-display text-sm text-[#14213D]">September 2026</p>
                <button
                  onClick={() => setMonthOffset((m) => m + 1)}
                  className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-600"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-7 gap-y-1 text-center">
                {WEEKDAYS.map((d, i) => (
                  <span key={i} className="text-xs font-medium text-stone-400">
                    {d}
                  </span>
                ))}

                {Array.from({ length: LEADING_BLANKS }).map((_, i) => (
                  <span key={`b-${i}`} />
                ))}

                {Array.from({ length: DAYS_IN_MONTH }).map((_, i) => {
                  const day = i + 1;
                  const dayCases = casesByDay[day];
                  const isSelected = day === selectedDay;
                  const isToday = day === TODAY;
                  const worst = dayCases?.some((c) => c.status === "violation")
                    ? "violation"
                    : dayCases?.some((c) => c.status === "review")
                    ? "review"
                    : dayCases
                    ? "compliant"
                    : null;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className="relative mx-auto flex h-9 w-9 flex-col items-center justify-center"
                    >
                      <motion.span
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.94 }}
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${
                          isSelected
                            ? "bg-[#14213D] font-medium text-white"
                            : isToday
                            ? "border border-[#14213D] text-[#14213D]"
                            : "text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        {day}
                      </motion.span>
                      {worst && !isSelected && (
                        <span
                          className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                            worst === "violation"
                              ? "bg-[var(--color-violation)]"
                              : worst === "review"
                              ? "bg-[var(--color-review)]"
                              : "bg-[#15803D]"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Case list for selected day */}
            <div className="mt-5 flex items-center justify-between">
              <p className="text-sm font-medium text-stone-500">
                {visibleCases.length
                  ? `${visibleCases.length} case${visibleCases.length > 1 ? "s" : ""} on Sept ${selectedDay}`
                  : `No escalations logged for Sept ${selectedDay}`}
              </p>
              {selectedDay !== TODAY && (
                <button
                  onClick={() => setSelectedDay(TODAY)}
                  className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-[#14213D]"
                >
                  <X className="h-3 w-3" /> Back to today
                </button>
              )}
            </div>

            <div className="mt-3 space-y-3">
              <AnimatePresence mode="popLayout">
                {visibleCases.map((c, i) => (
                  <CaseRow key={c.id} c={c} index={i} />
                ))}
              </AnimatePresence>

              {visibleCases.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border border-dashed border-stone-200 p-8 text-center text-sm text-stone-400"
                >
                  Select a marked date to view the escalations inspectors sent that day.
                </motion.div>
              )}
            </div>
          </section>

          {/* Analytics */}
          <section className="flex flex-col gap-6">
            {/* Bar chart */}
            <div className="rounded-card border border-stone-200 bg-white p-6">
              <h3 className="font-display text-lg text-[#14213D]">Violations by declaration type</h3>
              <p className="text-sm text-stone-400">Last 30 days, all zones</p>

              <div className="mt-6 flex items-end gap-3" style={{ height: 160 }}>
                {VIOLATIONS_BY_CATEGORY.map((d, i) => (
                  <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                    <span className="font-mono text-xs text-stone-400">{d.value}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.value / maxBar) * 120}px` }}
                      transition={{ duration: 0.7, delay: 0.1 + i * 0.06, ease: "easeOut" }}
                      whileHover={{ backgroundColor: "#14213D" }}
                      className="w-full rounded-t-md bg-[#B8873D]/70"
                    />
                    <span className="text-center text-[10px] leading-tight text-stone-500">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status donut */}
            <div className="rounded-card border border-stone-200 bg-white p-6">
              <h3 className="font-display text-lg text-[#14213D]">Case status breakdown</h3>
              <p className="text-sm text-stone-400">Across {CASES.length} escalated cases</p>

              <div className="mt-6 flex items-center gap-6">
                <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90 shrink-0">
                  {(() => {
                    const r = 52;
                    const c = 2 * Math.PI * r;
                    let acc = 0;
                    return STATUS_BREAKDOWN.map((s, i) => {
                      const dash = (s.value / 100) * c;
                      const offset = -((acc / 100) * c);
                      const el = (
                        <motion.circle
                          key={s.label}
                          cx="64"
                          cy="64"
                          r={r}
                          fill="none"
                          stroke={s.color}
                          strokeWidth="14"
                          strokeDasharray={`${dash} ${c - dash}`}
                          style={{ strokeDashoffset: offset }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.6, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                        />
                      );
                      acc += s.value;
                      return el;
                    });
                  })()}
                </svg>
                <div className="space-y-2.5">
                  {STATUS_BREAKDOWN.map((s) => (
                    <div key={s.label} className="flex items-center gap-2 text-sm">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-stone-600">{s.label}</span>
                      <span className="ml-auto font-mono text-xs text-stone-400">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick facts */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ y: -2 }}
                className="rounded-card border border-stone-200 bg-white p-4"
              >
                <Package className="h-4 w-4 text-[#B8873D]" />
                <p className="mt-2 font-display text-xl text-[#14213D]">4,820</p>
                <p className="text-xs text-stone-400">Products scanned</p>
              </motion.div>
              <motion.div
                whileHover={{ y: -2 }}
                className="rounded-card border border-stone-200 bg-white p-4"
              >
                <Timer className="h-4 w-4 text-[#B8873D]" />
                <p className="mt-2 font-display text-xl text-[#14213D]">2.4 days</p>
                <p className="text-xs text-stone-400">Avg. resolution time</p>
              </motion.div>
              <motion.div
                whileHover={{ y: -2 }}
                className="rounded-card border border-stone-200 bg-white p-4"
              >
                <Users2 className="h-4 w-4 text-[#B8873D]" />
                <p className="mt-2 font-display text-xl text-[#14213D]">12</p>
                <p className="text-xs text-stone-400">Inspectors active</p>
              </motion.div>
              <motion.div
                whileHover={{ y: -2 }}
                className="rounded-card border border-stone-200 bg-white p-4"
              >
                <ShieldCheck className="h-4 w-4 text-[#B8873D]" />
                <p className="mt-2 font-display text-xl text-[#14213D]">96%</p>
                <p className="text-xs text-stone-400">Reports filed on time</p>
              </motion.div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  Search,
  ArrowUpDown,
  MapPin,
  Package,
  Flag,
  Clock,
  Circle,
  UserRound
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Static data — replace with API calls once the backend is wired up */
/* ------------------------------------------------------------------ */

type InspectorStatus = "active" | "leave";

type Inspector = {
  id: string;
  name: string;
  zone: string;
  status: InspectorStatus;
  casesReviewed: number;
  escalationsSent: number;
  accuracyRate: number; // %
  avgResolutionDays: number;
  lastActive: string;
};

const INSPECTORS: Inspector[] = [
  {
    id: "INS-014",
    name: "Rohan Mehta",
    zone: "Zone I · Mumbai Metro",
    status: "active",
    casesReviewed: 214,
    escalationsSent: 18,
    accuracyRate: 94,
    avgResolutionDays: 1.6,
    lastActive: "12 minutes ago",
  },
  {
    id: "INS-021",
    name: "Priya Nair",
    zone: "Zone III · Bengaluru",
    status: "active",
    casesReviewed: 198,
    escalationsSent: 15,
    accuracyRate: 91,
    avgResolutionDays: 2.0,
    lastActive: "40 minutes ago",
  },
  {
    id: "INS-009",
    name: "Arjun Singh",
    zone: "Zone V · Pune",
    status: "active",
    casesReviewed: 176,
    escalationsSent: 11,
    accuracyRate: 88,
    avgResolutionDays: 2.4,
    lastActive: "1 hour ago",
  },
  {
    id: "INS-032",
    name: "Kavita Rao",
    zone: "Zone IV · Chennai",
    status: "active",
    casesReviewed: 231,
    escalationsSent: 22,
    accuracyRate: 96,
    avgResolutionDays: 1.4,
    lastActive: "2 hours ago",
  },
  {
    id: "INS-017",
    name: "Sameer Iyer",
    zone: "Zone II · Delhi NCR",
    status: "leave",
    casesReviewed: 142,
    escalationsSent: 9,
    accuracyRate: 85,
    avgResolutionDays: 2.9,
    lastActive: "3 days ago",
  },
  {
    id: "INS-026",
    name: "Neha Kulkarni",
    zone: "Zone VI · Jaipur",
    status: "active",
    casesReviewed: 165,
    escalationsSent: 13,
    accuracyRate: 89,
    avgResolutionDays: 2.1,
    lastActive: "25 minutes ago",
  },
  {
    id: "INS-011",
    name: "Vikram Desai",
    zone: "Zone VIII · Ahmedabad",
    status: "active",
    casesReviewed: 187,
    escalationsSent: 16,
    accuracyRate: 90,
    avgResolutionDays: 1.9,
    lastActive: "1 hour ago",
  },
  {
    id: "INS-038",
    name: "Ananya Bose",
    zone: "Zone VII · Kolkata",
    status: "leave",
    casesReviewed: 121,
    escalationsSent: 7,
    accuracyRate: 82,
    avgResolutionDays: 3.2,
    lastActive: "5 days ago",
  },
  {
    id: "INS-005",
    name: "Farhan Sheikh",
    zone: "Zone I · Mumbai Metro",
    status: "active",
    casesReviewed: 203,
    escalationsSent: 19,
    accuracyRate: 93,
    avgResolutionDays: 1.7,
    lastActive: "10 minutes ago",
  },
  {
    id: "INS-029",
    name: "Divya Menon",
    zone: "Zone III · Bengaluru",
    status: "active",
    casesReviewed: 158,
    escalationsSent: 10,
    accuracyRate: 87,
    avgResolutionDays: 2.3,
    lastActive: "50 minutes ago",
  },
];

/* ------------------------------------------------------------------ */
/*  Small presentational pieces                                       */
/* ------------------------------------------------------------------ */

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("");
}

function AccuracyRing({ value }: { value: number }) {
  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 92 ? "#15803D" : value >= 86 ? "#B8873D" : "var(--color-review)";

  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
      <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
        <circle cx="22" cy="22" r={radius} fill="none" stroke="#EEECE3" strokeWidth="4" />
        <motion.circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute font-mono text-[10px] text-[#14213D]">{value}%</span>
    </div>
  );
}

function CircularStat({
  label,
  value,
  suffix = "",
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
  const pct = Math.min(value, 100);
  const offset = circumference - (pct / 100) * circumference;

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

function InspectorRow({ insp, index }: { insp: Inspector; index: number }) {
  const isActive = insp.status === "active";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ x: 4 }}
      className="group grid grid-cols-[1.8fr_0.8fr_0.8fr_0.9fr_0.9fr_auto] items-center gap-4 rounded-2xl border border-stone-200 bg-white px-4 py-3 transition-colors hover:border-stone-300 hover:bg-stone-50 max-lg:grid-cols-[1.8fr_auto] max-lg:gap-y-3"
    >
      {/* Identity */}
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#14213D] font-display text-sm text-white">
          {initials(insp.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-[#14213D]">{insp.name}</p>
          <p className="flex items-center gap-1 truncate text-xs text-stone-400">
            <MapPin className="h-3 w-3 shrink-0" /> {insp.zone}
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="max-lg:order-6 max-lg:col-start-2 max-lg:row-start-1">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            isActive ? "bg-[#F0FDF4] text-[#15803D]" : "bg-stone-100 text-stone-500"
          }`}
        >
          <Circle className={`h-1.5 w-1.5 fill-current ${isActive ? "" : "opacity-60"}`} />
          {isActive ? "Active" : "On leave"}
        </span>
      </div>

      {/* Cases reviewed */}
      <div className="max-lg:flex max-lg:items-center max-lg:gap-2">
        <p className="flex items-center gap-1.5 font-mono text-sm text-[#14213D]">
          <Package className="h-3.5 w-3.5 text-stone-300" />
          {insp.casesReviewed}
        </p>
        <p className="text-[11px] text-stone-400 max-lg:hidden">cases reviewed</p>
      </div>

      {/* Escalations sent */}
      <div className="max-lg:flex max-lg:items-center max-lg:gap-2">
        <p className="flex items-center gap-1.5 font-mono text-sm text-[#14213D]">
          <Flag className="h-3.5 w-3.5 text-stone-300" />
          {insp.escalationsSent}
        </p>
        <p className="text-[11px] text-stone-400 max-lg:hidden">escalated</p>
      </div>

      {/* Avg resolution */}
      <div className="max-lg:flex max-lg:items-center max-lg:gap-2">
        <p className="flex items-center gap-1.5 font-mono text-sm text-[#14213D]">
          <Clock className="h-3.5 w-3.5 text-stone-300" />
          {insp.avgResolutionDays}d
        </p>
        <p className="text-[11px] text-stone-400 max-lg:hidden">avg. resolution</p>
      </div>

      {/* Accuracy ring */}
      <div className="hidden md:flex items-center justify-end gap-2 max-lg:col-start-2 max-lg:row-start-1">
        <AccuracyRing value={insp.accuracyRate} />
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

type SortKey = "casesReviewed" | "accuracyRate" | "escalationsSent";

export default function Page() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InspectorStatus>("all");
  const [sortKey, setSortKey] = useState<SortKey>("casesReviewed");

  const filtered = useMemo(() => {
    return INSPECTORS.filter((i) => {
      const matchesQuery =
        i.name.toLowerCase().includes(query.toLowerCase()) ||
        i.zone.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || i.status === statusFilter;
      return matchesQuery && matchesStatus;
    }).sort((a, b) => b[sortKey] - a[sortKey]);
  }, [query, statusFilter, sortKey]);

  const activeCount = INSPECTORS.filter((i) => i.status === "active").length;
  const avgAccuracy = Math.round(
    INSPECTORS.reduce((s, i) => s + i.accuracyRate, 0) / INSPECTORS.length
  );
  const avgCases = Math.round(
    INSPECTORS.reduce((s, i) => s + i.casesReviewed, 0) / INSPECTORS.length
  );
  const totalEscalations = INSPECTORS.reduce((s, i) => s + i.escalationsSent, 0);

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "casesReviewed", label: "Cases reviewed" },
    { key: "accuracyRate", label: "Detection accuracy" },
    { key: "escalationsSent", label: "Escalations sent" },
  ];

  return (
    <div className="min-h-screen bg-[#F1F2ED] pb-16">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/70 px-8 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14213D] text-white">
              <UserRound className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-md md:text-lg leading-tight text-[#14213D]">Inspectors</p>
              <p className="text-xs text-stone-400">Field roster and performance across all zones</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs md:text-sm font-medium text-[#14213D]">Deputy Controller, Zone III</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:grid-cols-4">
          <CircularStat
            label="Active inspectors"
            value={Math.round((activeCount / INSPECTORS.length) * 100)}
            suffix="%"
            color="#15803D"
            detail={`${activeCount} of ${INSPECTORS.length} on duty today`}
            delay={0}
          />
          <CircularStat
            label="Detection accuracy"
            value={avgAccuracy}
            suffix="%"
            color="#B8873D"
            detail="Average across the roster"
            delay={0.06}
          />
          <CircularStat
            label="Cases per inspector"
            value={avgCases}
            suffix=""
            color="var(--color-review)"
            detail="Average reviewed this cycle"
            delay={0.12}
          />
          <CircularStat
            label="Escalations raised"
            value={totalEscalations}
            suffix=""
            color="var(--color-violation)"
            detail="Sent to supervisors this cycle"
            delay={0.18}
          />
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-500 sm:w-72">
            <Search className="h-4 w-4 text-stone-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or zone"
              className="w-full bg-transparent text-sm text-[#14213D] placeholder:text-stone-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full border border-stone-200 bg-white p-1">
              {(["all", "active", "leave"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? "bg-[#14213D] text-white"
                      : "text-stone-500 hover:text-[#14213D]"
                  }`}
                >
                  {s === "all" ? "All" : s === "active" ? "Active" : "On leave"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 rounded-full border border-stone-200 bg-white px-1 py-1">
              <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-stone-300" />
              {sortOptions.map((o) => (
                <button
                  key={o.key}
                  onClick={() => setSortKey(o.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    sortKey === o.key
                      ? "bg-stone-100 text-[#14213D]"
                      : "text-stone-400 hover:text-[#14213D]"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Roster */}
        <section className="mt-5 rounded-card border border-stone-200 bg-white p-6">
          <div className="mb-3 hidden grid-cols-[1.8fr_0.8fr_0.8fr_0.9fr_0.9fr_auto] gap-4 px-4 text-xs font-medium text-stone-400 lg:grid">
            <span>Inspector</span>
            <span>Status</span>
            <span>Reviewed</span>
            <span>Escalated</span>
            <span>Resolution</span>
            <span className="text-right">Accuracy</span>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((insp, i) => (
                <InspectorRow key={insp.id} insp={insp} index={i} />
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-dashed border-stone-200 p-8 text-center text-sm text-stone-400"
              >
                No inspectors match this search and filter combination.
              </motion.div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

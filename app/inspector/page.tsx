"use client";

import { redirect } from "next/navigation";
import { useRef, useState } from "react";
import { IconPlaceholder } from "@/components/ui/icon-placeholder";
import { StatusChip } from "@/components/ui/statusChip";
import { mockScans, type Scan, type ScanStatus } from "@/lib/mock-scans";
import Navbar from "@/components/inspector/Navbar";
import Topbar from "@/components/inspector/Topbar";
import { ScanLine, ScanBox, CircleSmall } from "lucide-react";

const RESULT_POOL: ScanStatus[] = ["pass", "violation", "review"];

export default function InspectorHomePage() {
  const [scans, setScans] = useState<Scan[]>(mockScans);
  const [isProcessing, setIsProcessing] = useState(false);

  const violations = scans.filter((s) => s.status === "violation").length;
  const complianceRate = Math.round(
    (scans.filter((s) => s.status === "pass").length / scans.length) * 100
  );

  
  return (
    <main className="mx-auto min-h-screen max-w-md bg-bg pb-32">
      {/* ---- Topbar ---- */}
      <header className="flex items-center justify-between px-5 pt-6 pb-4">
        <Topbar/>        
      </header>

      {/* ---- Summary card ---- */}
      <section className="mx-5 mb-5 rounded-card bg-dark px-5 py-5 text-white">
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60">Today&apos;s Scans</p>
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-dark">
            This Week
          </span>
        </div>
        <p className="mt-2 text-2xl font-semibold">{scans.length}</p>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <div>
            <p className="text-xs text-white/60">Flags Raised</p>
            <p className="text-base font-semibold text-violation">{violations}</p>
          </div>
          <div>
            <p className="text-xs text-white/60">Compliance Rate</p>
            <p className="text-base font-semibold">{complianceRate}%</p>
          </div>
        </div>
      </section>

      {/* ---- Actions ---- */}
      <section className="mx-5 mb-6 grid grid-cols-2 gap-3">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        <button
          onClick={() => redirect("/inspector/scan")}
          disabled={isProcessing}
          className="flex flex-col items-center gap-2 rounded-card border border-border bg-surface py-4 disabled:opacity-60"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-dark">
            <ScanLine size={22} />
          </span>
          <span className="text-sm font-medium text-ink">
            {isProcessing ? "Reading…" : "Scan"}
          </span>
        </button>

        <button 
          onClick={() => redirect("/inspector/scan?batch=true")}
          className="flex flex-col items-center gap-2 rounded-card border border-border bg-surface py-4 cursor-pointer"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-bg text-ink">
            <ScanBox size={22} />
          </span>
          <span className="text-sm font-medium text-ink">Batch Mode</span>
        </button>
      </section>

      {/* ---- Recent Activity ---- */}
      <section className="mx-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Recent Activity</h2>
          <button className="text-sm text-muted">See all</button>
        </div>

        <ul className="divide-y divide-border rounded-card border border-border bg-surface">
          {scans.map((scan) => (
            <li key={scan.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bg text-muted">
                  <CircleSmall size={16} />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{scan.product}</p>
                  <p className="text-xs text-muted">{scan.time}</p>
                </div>
              </div>
              <StatusChip status={scan.status} />
            </li>
          ))}
        </ul>
      </section>

      {/* ---- Floating bottom nav ---- */}
      <Navbar/>      

    </main>
  );
}

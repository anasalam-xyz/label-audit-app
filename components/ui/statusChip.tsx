import type { ScanStatus } from "@/lib/mock-scans";

const STYLES: Record<ScanStatus, { label: string; text: string; bg: string }> = {
  pass: { label: "Compliant", text: "text-pass", bg: "bg-pass-bg" },
  violation: { label: "Violation", text: "text-violation", bg: "bg-violation-bg" },
  review: { label: "Needs Review", text: "text-review", bg: "bg-review-bg" },
};

export function StatusChip({ status }: { status: ScanStatus }) {
  const s = STYLES[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}

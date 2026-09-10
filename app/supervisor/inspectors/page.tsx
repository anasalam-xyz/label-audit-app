"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { IconPlaceholder } from "@/components/ui/icon-placeholder";
import { fetchInspectors, type InspectorSummary } from "@/lib/api/inspectors";

export default function ManageInspectorsPage() {
  const [inspectors, setInspectors] = useState<InspectorSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInspectors()
      .then(setInspectors)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-md bg-bg px-5 pt-6 pb-28">
      <h1 className="mb-4 text-lg font-semibold text-ink">Inspectors</h1>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-card border border-violation/30 bg-violation-bg px-4 py-3">
          <AlertCircle size={16} className="text-violation" />
          <p className="text-sm text-violation">{error}</p>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <ul className="divide-y divide-border rounded-card border border-border bg-surface">
          {inspectors.map((insp) => (
            <li key={insp.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bg text-muted">
                  <IconPlaceholder size={16} />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{insp.name}</p>
                  <p className="text-xs text-muted">{insp.region}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-ink">{insp.scans_this_week} scans</p>
                <p className="text-xs text-violation">{insp.violations_flagged} flagged</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

"use client";

import { useRef } from "react";
import { Camera, X, ArrowRight } from "lucide-react";

export function CaptureStep({
  isBatchMode,
  batchCount,
  onCaptured,
  onProcessBatch,
  onCancel,
}: {
  isBatchMode: boolean;
  batchCount: number;
  onCaptured: (url: string) => void;
  onProcessBatch: () => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onCaptured(URL.createObjectURL(file));
    e.target.value = "";
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex w-full items-center justify-between">
        <button onClick={onCancel} className="text-muted">
          <X size={22} />
        </button>
        <p className="text-sm font-medium text-ink">
          {isBatchMode ? `Batch Mode — ${batchCount} captured` : "Scan Label"}
        </p>
        <span className="w-[22px]" />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />

      <div className="flex aspect-[3/4] w-full items-center justify-center rounded-card border-2 border-dashed border-border bg-surface">
        <p className="px-8 text-center text-sm text-muted">
          Position the label inside the frame
        </p>
      </div>

      <button
        onClick={() => inputRef.current?.click()}
        className="mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-dark shadow-md"
      >
        <Camera size={26} />
      </button>

      {isBatchMode && batchCount > 0 && (
        <button
          onClick={onProcessBatch}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-card bg-dark px-4 py-3 text-sm font-semibold text-white"
        >
          Process {batchCount} Photo{batchCount > 1 ? "s" : ""}
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}

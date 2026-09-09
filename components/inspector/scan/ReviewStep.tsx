"use client";

import { useState } from "react";
import { Mic, ArrowRight, AlertTriangle } from "lucide-react";
import type { ExtractedField } from "@/lib/scan-types";

export function ReviewStep({
  photoUrl,
  fields,
  onContinue,
}: {
  photoUrl: string | null;
  fields: ExtractedField[];
  onContinue: (fields: ExtractedField[]) => void;
}) {
  const [localFields, setLocalFields] = useState(fields);
  const [voiceNoted, setVoiceNoted] = useState(false);

  const lowConfidenceCount = localFields.filter((f) => f.confidence === "low").length;

  function updateField(id: string, value: string) {
    setLocalFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value, confidence: "high" } : f))
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-ink">Review Extracted Fields</h1>
      <p className="mb-4 text-sm text-muted">
        {lowConfidenceCount > 0
          ? `${lowConfidenceCount} field${lowConfidenceCount > 1 ? "s" : ""} need${
              lowConfidenceCount === 1 ? "s" : ""
            } a manual check`
          : "All fields extracted with high confidence"}
      </p>

      {photoUrl && (
        <img
          src={photoUrl}
          alt="Captured label"
          className="mb-4 h-40 w-full rounded-card object-cover"
        />
      )}

      <div className="mb-4 space-y-3">
        {localFields.map((field) => (
          <div key={field.id} className="rounded-card border border-border bg-surface p-3">
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs text-muted">{field.label}</label>
              {field.confidence === "low" && (
                <span className="flex items-center gap-1 text-xs font-medium text-review">
                  <AlertTriangle size={12} />
                  Low confidence
                </span>
              )}
            </div>
            <input
              value={field.value}
              onChange={(e) => updateField(field.id, e.target.value)}
              className={`w-full rounded-md border bg-bg px-3 py-2 text-sm text-ink outline-none ${
                field.confidence === "low" ? "border-review" : "border-border"
              }`}
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => setVoiceNoted((v) => !v)}
        className={`mb-4 flex w-full items-center justify-center gap-2 rounded-card border px-4 py-3 text-sm font-medium ${
          voiceNoted ? "border-accent text-accent" : "border-border text-muted"
        }`}
      >
        <Mic size={16} />
        {voiceNoted ? "Voice note added" : "Add Voice Note (optional)"}
      </button>

      <button
        onClick={() => onContinue(localFields)}
        className="flex w-full items-center justify-center gap-2 rounded-card bg-dark px-4 py-3 text-sm font-semibold text-white"
      >
        Run Compliance Check
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

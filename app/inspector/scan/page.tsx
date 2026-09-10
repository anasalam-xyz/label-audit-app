"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, X } from "lucide-react";
import { CaptureStep } from "@/components/inspector/scan/CaptureStep";
import { ProcessingStep } from "@/components/inspector/scan/ProcessingStep";
import { ReviewStep } from "@/components/inspector/scan/ReviewStep";
import { ResultStep } from "@/components/inspector/scan/ResultStep";
import { DoneStep } from "@/components/inspector/scan/DoneStep";
import { extractFields, checkCompliance } from "@/lib/api/scans";
import { generateExtraction } from "@/lib/mock-extraction"; // batch mode only — see note below
import type { ExtractedField, ScanStep, Violation } from "@/lib/scan-types";

function ScanFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBatchMode = searchParams.get("batch") === "true";

  const [step, setStep] = useState<ScanStep>("capture");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [batchQueue, setBatchQueue] = useState<string[]>([]);
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleCaptured(url: string, file: File) {
    setPhotoUrl(url);
    if (isBatchMode) {
      setBatchQueue((prev) => [...prev, url]);
      return; // stay on capture step for the next shot
    }
    proceedToBarcode(file);
  }

  function proceedToBarcode(file: File) {
    setErrorMessage(null);
    setStep("barcode");
    // cosmetic beat — no barcode-lookup endpoint yet, matches the flowchart's pacing
    setTimeout(() => proceedToExtraction(file), 900);
  }

  async function proceedToExtraction(file: File | null) {
    setStep("extracting");
    try {
      const result = file
        ? await extractFields(file)
        : generateExtraction(); // batch mode — see note below
      setFields(result);
      setStep("review");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Extraction failed");
      setStep("capture");
    }
  }

  async function proceedToCheck(finalFields: ExtractedField[]) {
    setFields(finalFields);
    setStep("checking");
    try {
      const result = await checkCompliance(finalFields);
      setViolations(result);
      setStep("result");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Compliance check failed");
      setStep("review");
    }
  }

  function proceedToSave() {
    setStep("saving");
    // no save/sync endpoint in current backend scope — kept as a UI beat
    setTimeout(() => {
      setStep("syncing");
      setTimeout(() => {
        setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
        setStep("done");
      }, 900);
    }, 900);
  }

  function reset() {
    setStep("capture");
    setPhotoUrl(null);
    setBatchQueue([]);
    setFields([]);
    setViolations([]);
    setErrorMessage(null);
  }

  return (
    <main className="mx-auto min-h-screen max-w-md bg-bg px-5 pb-24 pt-6">
      {errorMessage && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-card border border-violation/30 bg-violation-bg px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-violation" />
            <p className="text-sm text-violation">{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-violation">
            <X size={16} />
          </button>
        </div>
      )}

      {step === "capture" && (
        <CaptureStep
          isBatchMode={isBatchMode}
          batchCount={batchQueue.length}
          onCaptured={handleCaptured}
          onProcessBatch={() => proceedToBarcode(null as unknown as File)}
          onCancel={() => router.push("/inspector")}
        />
      )}

      {step === "barcode" && (
        <ProcessingStep label="Checking barcode…" sublabel="Looking up known product records" />
      )}

      {step === "extracting" && (
        <ProcessingStep label="Reading label…" sublabel="Extracting fields with AI" />
      )}

      {step === "review" && (
        <ReviewStep photoUrl={photoUrl} fields={fields} onContinue={proceedToCheck} />
      )}

      {step === "checking" && (
        <ProcessingStep
          label="Checking against rules…"
          sublabel="Legal Metrology (Packaged Commodities) Rules, 2011"
        />
      )}

      {step === "result" && <ResultStep violations={violations} onSave={proceedToSave} />}

      {step === "saving" && (
        <ProcessingStep label="Saving report…" sublabel="Storing photo + extracted data" />
      )}

      {step === "syncing" && <ProcessingStep label="Syncing…" sublabel="Checking connection" />}

      {step === "done" && (
        <DoneStep
          passed={violations.length === 0}
          isOnline={isOnline}
          onScanAnother={reset}
          onGoHome={() => router.push("/inspector")}
        />
      )}
    </main>
  );
}

export default function ScanPage() {
  return (
    <Suspense>
      <ScanFlow />
    </Suspense>
  );
}

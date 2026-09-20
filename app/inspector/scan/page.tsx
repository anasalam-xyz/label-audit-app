"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { CaptureStep } from "@/components/inspector/scan/CaptureStep";
import { ProcessingStep } from "@/components/inspector/scan/ProcessingStep";
import { ReviewStep } from "@/components/inspector/scan/ReviewStep";
import { ResultStep } from "@/components/inspector/scan/ResultStep";
import { DoneStep } from "@/components/inspector/scan/DoneStep";
import { BatchDoneStep, type BatchResultEntry } from "@/components/inspector/scan/BatchDoneStep";
import { ScanProgress } from "@/components/inspector/scan/ScanProgress";
import { extractFields, checkCompliance, saveScan } from "@/lib/api/scans";
import type { ExtractedField, ScanStep, Violation } from "@/lib/scan-types";

// Groups the 9 internal ScanStep values into the 4 phases a person
// actually experiences — barcode/extracting are both "AI is working",
// checking/result/saving/syncing are all "confirm and persist". Showing
// each internal step as its own numbered milestone would expose
// implementation detail (like the cosmetic barcode-lookup beat) as if
// it were a meaningful stage.
function stepToPhase(step: ScanStep): number {
  switch (step) {
    case "capture":
      return 0;
    case "barcode":
    case "extracting":
      return 1;
    case "review":
      return 2;
    default:
      return 3; // checking, result, saving, syncing
  }
}

function ScanFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBatchMode = searchParams.get("batch") === "true";

  const [step, setStep] = useState<ScanStep>("capture");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveResult, setSaveResult] = useState<{ id: string; scannedAt: string } | null>(null);

  const [batchQueue, setBatchQueue] = useState<string[]>([]);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchIndex, setBatchIndex] = useState(0);
  const [batchResults, setBatchResults] = useState<BatchResultEntry[]>([]);

  function handleCaptured(url: string, file: File) {
    setPhotoUrl(url);
    if (isBatchMode) {
      setBatchQueue((prev) => [...prev, url]);
      setBatchFiles((prev) => [...prev, file]);
      return;
    }
    setPhotoFile(file);
    proceedToBarcode(file);
  }

  function proceedToBarcode(file: File) {
    setErrorMessage(null);
    setStep("barcode");
    setTimeout(() => proceedToExtraction(file), 900);
  }

  async function proceedToExtraction(file: File) {
    setStep("extracting");
    try {
      const result = await extractFields(file);
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
      if (isBatchMode) {
        advanceBatch({ status: "failed" });
        return;
      }
      setErrorMessage(err instanceof Error ? err.message : "Compliance check failed");
      setStep("review");
    }
  }

  async function proceedToSave() {
    if (!photoFile) {
      setErrorMessage("No photo to save");
      setStep("result");
      return;
    }
    setStep("saving");
    try {
      const result = await saveScan(photoFile, fields, violations);
      setSaveResult({ id: result.id, scannedAt: result.scannedAt });
      setStep("syncing");
      setTimeout(() => {
        setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
        setStep("done");
      }, 900);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Save failed — try again");
      setStep("result");
    }
  }

  function startBatch() {
    if (batchFiles.length === 0) return;
    setErrorMessage(null);
    setBatchIndex(0);
    setBatchResults([]);
    runBatchItem(0);
  }

  async function runBatchItem(index: number) {
    const file = batchFiles[index];
    const url = batchQueue[index] ?? URL.createObjectURL(file);
    setPhotoFile(file);
    setPhotoUrl(url);
    setStep("extracting");
    try {
      const result = await extractFields(file, { provider: "groq" });
      setFields(result);
      setStep("review");
    } catch (err) {
      advanceBatch({ status: "failed" });
    }
  }

  async function proceedToSaveBatchItem() {
    if (!photoFile) {
      advanceBatch({ status: "failed" });
      return;
    }
    setStep("saving");
    try {
      const result = await saveScan(photoFile, fields, violations);
      advanceBatch({
        status: result.result,
        scanId: result.id,
        scannedAt: result.scannedAt,
        photo: photoFile,
        fields,
        violations,
      });
    } catch (err) {
      advanceBatch({ status: "failed" });
    }
  }

  function advanceBatch(entry: BatchResultEntry) {
    setBatchResults((prev) => [...prev, entry]);
    const nextIndex = batchIndex + 1;
    if (nextIndex < batchFiles.length) {
      setBatchIndex(nextIndex);
      runBatchItem(nextIndex);
    } else {
      setStep("done");
    }
  }

  function reset() {
    setStep("capture");
    setPhotoUrl(null);
    setPhotoFile(null);
    setFields([]);
    setViolations([]);
    setErrorMessage(null);
    setSaveResult(null);
    setBatchQueue([]);
    setBatchFiles([]);
    setBatchIndex(0);
    setBatchResults([]);
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

      {step !== "done" && (
        <ScanProgress
          phase={stepToPhase(step)}
          batchLabel={
            isBatchMode && batchFiles.length > 0
              ? `Photo ${batchIndex + 1} of ${batchFiles.length}`
              : undefined
          }
        />
      )}

      {/* One orchestrated transition for the whole flow, keyed by step —
          not a separate fade-in per component. This is the single motion
          decision the flow's "feel" hangs on. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {step === "capture" && (
            <CaptureStep
              isBatchMode={isBatchMode}
              batchCount={batchQueue.length}
              onCaptured={handleCaptured}
              onProcessBatch={startBatch}
              onCancel={() => router.push("/inspector/dashboard")}
            />
          )}

          {step === "barcode" && (
            <ProcessingStep label="Checking barcode…" sublabel="Looking up known product records" />
          )}

          {step === "extracting" && (
            <ProcessingStep
              label="Reading label…"
              sublabel={isBatchMode ? "Extracting fields · via Groq" : "Extracting fields with AI"}
            />
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

          {step === "result" && (
            <ResultStep
              violations={violations}
              onSave={isBatchMode ? proceedToSaveBatchItem : proceedToSave}
            />
          )}

          {step === "saving" && (
            <ProcessingStep label="Saving report…" sublabel="Storing photo + extracted data" />
          )}

          {step === "syncing" && (
            <ProcessingStep label="Syncing…" sublabel="Checking connection" />
          )}

          {step === "done" &&
            (isBatchMode ? (
              <BatchDoneStep
                results={batchResults}
                onScanAnother={reset}
                onGoHome={() => router.push("/inspector/dashboard")}
              />
            ) : (
              <DoneStep
                passed={violations.length === 0}
                isOnline={isOnline}
                onScanAnother={reset}
                onGoHome={() => router.push("/inspector/dashboard")}
                fields={fields}
                violations={violations}
                photo={photoFile}
                scanId={saveResult?.id}
                scannedAt={saveResult?.scannedAt}
              />
            ))}
        </motion.div>
      </AnimatePresence>
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

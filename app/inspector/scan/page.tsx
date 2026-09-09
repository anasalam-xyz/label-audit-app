"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CaptureStep } from "@/components/inspector/scan/CaptureStep";
import { ProcessingStep } from "@/components/inspector/scan/ProcessingStep";
import { ReviewStep } from "@/components/inspector/scan/ReviewStep";
import { ResultStep } from "@/components/inspector/scan/ResultStep";
import { DoneStep } from "@/components/inspector/scan/DoneStep";
import {
  generateExtraction,
  generateViolations,
  checkBarcodeMatch,
} from "@/lib/mock-extraction";
import type { ExtractedField, ScanStep, Violation } from "@/lib/scan-types";

function ScanFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBatchMode = searchParams.get("batch") === "true";

  const [step, setStep] = useState<ScanStep>("capture");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [batchQueue, setBatchQueue] = useState<string[]>([]);
  const [barcodeMatched, setBarcodeMatched] = useState(false);
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  function handleCaptured(url: string) {
    setPhotoUrl(url);
    if (isBatchMode) {
      setBatchQueue((prev) => [...prev, url]);
      return; // stay on capture step for the next shot
    }
    proceedToBarcode();
  }

  function proceedToBarcode() {
    setStep("barcode");
    setTimeout(() => {
      setBarcodeMatched(checkBarcodeMatch());
      proceedToExtraction();
    }, 900);
  }

  function proceedToExtraction() {
    setStep("extracting");
    setTimeout(() => {
      setFields(generateExtraction());
      setStep("review");
    }, 1400);
  }

  function proceedToCheck(finalFields: ExtractedField[]) {
    setFields(finalFields);
    setStep("checking");
    setTimeout(() => {
      setViolations(generateViolations());
      setStep("result");
    }, 1200);
  }

  function proceedToSave() {
    setStep("saving");
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
  }

  return (
    <main className="mx-auto min-h-screen max-w-md bg-bg px-5 pb-24 pt-6">
      {step === "capture" && (
        <CaptureStep
          isBatchMode={isBatchMode}
          batchCount={batchQueue.length}
          onCaptured={handleCaptured}
          onProcessBatch={proceedToBarcode}
          onCancel={() => router.push("/inspector")}
        />
      )}

      {step === "barcode" && (
        <ProcessingStep label="Checking barcode…" sublabel="Looking up known product records" />
      )}

      {step === "extracting" && (
        <ProcessingStep
          label="Reading label…"
          sublabel={
            barcodeMatched
              ? "Known fields prefilled · extracting the rest"
              : "Extracting fields with AI"
          }
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

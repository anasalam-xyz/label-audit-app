export type ScanStep =
  | "capture"
  | "barcode"
  | "extracting"
  | "review"
  | "checking"
  | "result"
  | "saving"
  | "syncing"
  | "done";

export type FieldConfidence = "high" | "low";

export type ExtractedField = {
  id: string;
  label: string;
  value: string;
  confidence: FieldConfidence;
};

export type Violation = {
  ruleCode: string;
  explanation: string;
};

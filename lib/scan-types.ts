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
  fieldKey: string; // stable key for rule matching — mirrors backend field_key
  label: string;
  value: string;
  confidence: FieldConfidence;
};

export type Violation = {
  ruleCode: string;
  severity: "minor" | "major";
  explanation: string;
};

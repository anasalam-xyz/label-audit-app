import type { ExtractedField, Violation } from "./scan-types";

const FIELD_POOL: Omit<ExtractedField, "id" | "confidence">[] = [
  { label: "Manufacturer Name", value: "Aarav Foods Pvt. Ltd." },
  { label: "Net Quantity", value: "500 g" },
  { label: "MRP", value: "₹45.00 (incl. of all taxes)" },
  { label: "Mfg. Date", value: "08/2026" },
  { label: "Consumer Care", value: "care@aaravfoods.in" },
];

export function generateExtraction(): ExtractedField[] {
  return FIELD_POOL.map((f, i) => ({
    ...f,
    id: String(i),
    confidence: Math.random() < 0.25 ? "low" : "high",
  }));
}

const VIOLATION_POOL: Violation[] = [
  { ruleCode: "Rule 6(1)(f)", explanation: "MRP text is too small — minimum required is 4mm." },
  { ruleCode: "Rule 5", explanation: "Net quantity declaration is missing." },
  { ruleCode: "Rule 6(1)(c)", explanation: "Manufacturer address is incomplete." },
];

export function generateViolations(): Violation[] {
  const count = Math.random() < 0.5 ? 0 : Math.floor(Math.random() * 2) + 1;
  return VIOLATION_POOL.slice(0, count);
}

export function checkBarcodeMatch(): boolean {
  return Math.random() < 0.4;
}

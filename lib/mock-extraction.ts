import type { ExtractedField, Violation } from "./scan-types";

const FIELD_POOL: Omit<ExtractedField, "id" | "confidence">[] = [
  { fieldKey: "manufacturer_name", label: "Manufacturer Name", value: "Aarav Foods Pvt. Ltd." },
  { fieldKey: "net_quantity", label: "Net Quantity", value: "500 g" },
  { fieldKey: "mrp", label: "MRP", value: "₹45.00 (incl. of all taxes)" },
  { fieldKey: "manufacture_date", label: "Mfg. Date", value: "08/2026" },
  { fieldKey: "consumer_care", label: "Consumer Care", value: "care@aaravfoods.in" },
];

export function generateExtraction(): ExtractedField[] {
  return FIELD_POOL.map((f, i) => ({
    ...f,
    id: String(i),
    confidence: Math.random() < 0.25 ? "low" : "high",
  }));
}

const VIOLATION_POOL: Violation[] = [
  {
    ruleCode: "Rule 6(1)(f)",
    severity: "major",
    explanation: "MRP text is too small — minimum required is 4mm.",
  },
  {
    ruleCode: "Rule 5",
    severity: "major",
    explanation: "Net quantity declaration is missing.",
  },
  {
    ruleCode: "Rule 6(1)(c)",
    severity: "major",
    explanation: "Manufacturer address is incomplete.",
  },
];

export function generateViolations(): Violation[] {
  const count = Math.random() < 0.5 ? 0 : Math.floor(Math.random() * 2) + 1;
  return VIOLATION_POOL.slice(0, count);
}

export function checkBarcodeMatch(): boolean {
  return Math.random() < 0.4;
}

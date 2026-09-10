import { getToken } from "../auth-storage";
import type { ExtractedField, Violation } from "../scan-types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function extractFields(photo: File): Promise<ExtractedField[]> {
  const token = getToken();
  const formData = new FormData();
  formData.append("photo", photo);

  const res = await fetch(`${API_BASE}/scans/extract`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? "Could not read the label — try again");
  }

  const data = await res.json();
  return data.fields;
}

export async function checkCompliance(fields: ExtractedField[]): Promise<Violation[]> {
  const token = getToken();

  const res = await fetch(`${API_BASE}/scans/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? "Compliance check failed — try again");
  }

  const data = await res.json();
  // backend returns rule_code (snake_case) — map to the frontend's ruleCode
  return data.violations.map((v: { rule_code: string; explanation: string }) => ({
    ruleCode: v.rule_code,
    explanation: v.explanation,
  }));
}

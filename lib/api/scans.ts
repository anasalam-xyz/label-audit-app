import { getToken } from "../auth-storage";
import type { ExtractedField, Violation } from "../scan-types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type WireField = {
  id: string;
  field_key: string;
  label: string;
  value: string;
  confidence: "high" | "low";
};

type WireViolation = {
  rule_code: string;
  severity: "minor" | "major";
  explanation: string;
};

function toFrontendField(f: WireField): ExtractedField {
  return { id: f.id, fieldKey: f.field_key, label: f.label, value: f.value, confidence: f.confidence };
}

function toWireField(f: ExtractedField): WireField {
  return { id: f.id, field_key: f.fieldKey, label: f.label, value: f.value, confidence: f.confidence };
}

function toWireViolation(v: Violation): WireViolation {
  return { rule_code: v.ruleCode, severity: v.severity, explanation: v.explanation };
}

export async function extractFields(
  photo: File,
  options?: { provider?: "groq" }
): Promise<ExtractedField[]> {
  const token = getToken();
  const formData = new FormData();
  formData.append("photo", photo);

  // provider=groq forces the fast path directly — used by batch mode, where
  // per-item latency compounds across a burst of photos.
  const query = options?.provider ? `?provider=${options.provider}` : "";

  const res = await fetch(`${API_BASE}/scans/extract${query}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? "Could not read the label — try again");
  }

  const data = await res.json();
  return (data.fields as WireField[]).map(toFrontendField);
}

export async function checkCompliance(fields: ExtractedField[]): Promise<Violation[]> {
  const token = getToken();

  const res = await fetch(`${API_BASE}/scans/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ fields: fields.map(toWireField) }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? "Compliance check failed — try again");
  }

  const data = await res.json();
  return (data.violations as WireViolation[]).map((v) => ({
    ruleCode: v.rule_code,
    severity: v.severity,
    explanation: v.explanation,
  }));
}

export async function saveScan(
  photo: File,
  fields: ExtractedField[],
  violations: Violation[],
  options?: { locationLat?: number; locationLng?: number; storeName?: string }
): Promise<{ id: string; result: "pass" | "violation" | "review"; scannedAt: string }> {
  const token = getToken();
  const formData = new FormData();
  formData.append("photo", photo);
  formData.append("fields", JSON.stringify(fields.map(toWireField)));
  formData.append("violations", JSON.stringify(violations.map(toWireViolation)));
  if (options?.locationLat != null) formData.append("location_lat", String(options.locationLat));
  if (options?.locationLng != null) formData.append("location_lng", String(options.locationLng));
  if (options?.storeName) formData.append("store_name", options.storeName);

  const res = await fetch(`${API_BASE}/scans/save`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? "Could not save the report — try again");
  }

  const data = await res.json();
  return { id: data.id, result: data.result, scannedAt: data.scanned_at };
}

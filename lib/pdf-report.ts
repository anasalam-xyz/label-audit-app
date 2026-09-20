import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { RULE_ASPECTS } from "./rule-aspects";
import type { ExtractedField, Violation } from "./scan-types";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

type ReportItem = {
  photo: File | null;
  fields: ExtractedField[];
  violations: Violation[];
  scanId?: string;
  scannedAt?: string;
};

// Shared page-drawing logic — used by both the single-scan report (one
// page) and the batch report (one page per item, same layout repeated).
async function renderReportPage(
  doc: jsPDF,
  item: ReportItem,
  itemLabel?: string // e.g. "Item 2 of 5" — omitted for single-scan reports
) {
  const margin = 40;
  let y = 50;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("LabelAudit — Compliance Report", margin, y);
  y += 20;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text("Legal Metrology (Packaged Commodities) Rules, 2011", margin, y);
  y += 16;

  if (itemLabel) {
    doc.text(itemLabel, margin, y);
    y += 12;
  }
  doc.text(`Report generated: ${new Date().toLocaleString()}`, margin, y);
  y += 12;
  if (item.scannedAt) {
    doc.text(`Scanned: ${new Date(item.scannedAt).toLocaleString()}`, margin, y);
    y += 12;
  }
  if (item.scanId) {
    doc.text(`Scan ID: ${item.scanId}`, margin, y);
    y += 12;
  }
  doc.setTextColor(0);
  y += 10;

  if (item.photo) {
    try {
      const dataUrl = await fileToDataUrl(item.photo);
      const format = item.photo.type.includes("png") ? "PNG" : "JPEG";
      const imgWidth = 180;
      const imgHeight = 240;
      doc.addImage(dataUrl, format, margin, y, imgWidth, imgHeight, undefined, "MEDIUM");
      y += imgHeight + 16;
    } catch {
      // Report still generates without the photo if embedding fails.
    }
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Extracted Fields", margin, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Field", "Value", "Confidence"]],
    body: item.fields.map((f) => [f.label, f.value || "—", f.confidence]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [20, 20, 20] },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 20;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Compliance Check", margin, y);
  y += 6;

  const checkedAspects = RULE_ASPECTS.map((aspect) => {
    const violation = item.violations.find((v) => v.ruleCode === aspect.ruleCode);
    return {
      ruleCode: aspect.ruleCode,
      label: aspect.label,
      status: violation ? "Violation" : "Compliant",
      severity: violation?.severity ?? "—",
      explanation: violation?.explanation ?? "—",
    };
  });

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Rule", "Check", "Status", "Severity", "Notes"]],
    body: checkedAspects.map((a) => [a.ruleCode, a.label, a.status, a.severity, a.explanation]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [20, 20, 20] },
    columnStyles: { 4: { cellWidth: 150 } },
  });
}

export async function generateComplianceReportPdf(item: ReportItem) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  await renderReportPage(doc, item);
  doc.save(`labelaudit-report-${item.scanId ?? Date.now()}.pdf`);
}

export async function generateBatchComplianceReportPdf(items: ReportItem[]) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  for (let i = 0; i < items.length; i++) {
    if (i > 0) doc.addPage();
    await renderReportPage(doc, items[i], `Item ${i + 1} of ${items.length}`);
  }
  doc.save(`labelaudit-batch-report-${Date.now()}.pdf`);
}

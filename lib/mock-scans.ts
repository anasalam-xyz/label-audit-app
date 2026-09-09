export type ScanStatus = "pass" | "violation" | "review";

export type Scan = {
  id: string;
  product: string;
  time: string;
  status: ScanStatus;
};

export const mockScans: Scan[] = [
  { id: "1", product: "Tata Salt 1kg", time: "10:42 AM", status: "pass" },
  { id: "2", product: "Local Brand Atta 5kg", time: "10:15 AM", status: "violation" },
  { id: "3", product: "Amul Butter 500g", time: "9:58 AM", status: "pass" },
  { id: "4", product: "Unbranded Spice Mix 200g", time: "9:40 AM", status: "review" },
  { id: "5", product: "Parle-G Biscuit 100g", time: "9:12 AM", status: "pass" },
];

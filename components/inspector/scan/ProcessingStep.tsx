import { Loader2 } from "lucide-react";

export function ProcessingStep({
  label,
  sublabel,
}: {
  label: string;
  sublabel: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Loader2 size={32} className="mb-4 animate-spin text-accent" />
      <p className="text-base font-semibold text-ink">{label}</p>
      <p className="mt-1 text-sm text-muted">{sublabel}</p>
    </div>
  );
}

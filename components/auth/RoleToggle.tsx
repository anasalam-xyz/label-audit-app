"use client";

export type Role = "inspector" | "supervisor";

export function RoleToggle({
  role,
  onChange,
}: {
  role: Role;
  onChange: (role: Role) => void;
}) {
  return (
    <div className="font-display relative mx-auto flex w-64 rounded-full border-[1px] border-border bg-surface p-1">
      <span
        className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-accent transition-transform duration-300 ease-out ${
          role === "supervisor" ? "translate-x-full" : "translate-x-0"
        }`}
      />
      <button
        type="button"
        onClick={() => onChange("inspector")}
        className={`relative z-10 w-1/2 py-2 text-sm font-medium transition-colors ${
          role === "inspector" ? "text-accent-ink" : "text-muted"
        }`}
      >
        Inspector
      </button>
      <button
        type="button"
        onClick={() => onChange("supervisor")}
        className={`relative z-10 w-1/2 py-2 text-sm font-medium transition-colors ${
          role === "supervisor" ? "text-accent-ink" : "text-muted"
        }`}
      >
        Supervisor
      </button>
    </div>
  );
}

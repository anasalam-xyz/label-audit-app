"use client";

import type { Role } from "./RoleToggle";

const IMAGES: Record<Role, string> = {
  inspector: "/inspector-illustration.svg",
  supervisor: "/supervisor-illustration.svg",
};

export function DesktopRoleImages({ role }: { role: Role }) {
  return (
    <>
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 overflow-hidden rounded-card bg-surface transition-all duration-500 ease-out ${
          role === "inspector" ? "h-80 w-64 opacity-100" : "h-64 w-52 opacity-50"
        }`}
      >
        <img src={IMAGES.inspector} alt="Inspector illustration" className="h-full w-full object-cover" />
      </div>
      <div
        className={`absolute right-0 top-1/2 -translate-y-1/2 overflow-hidden rounded-card bg-surface transition-all duration-500 ease-out ${
          role === "supervisor" ? "h-80 w-64 opacity-100" : "h-64 w-52 opacity-50"
        }`}
      >
        <img src={IMAGES.supervisor} alt="Supervisor illustration" className="h-full w-full object-cover" />
      </div>
    </>
  );
}

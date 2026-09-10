"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users } from "lucide-react";

const LINKS = [
  { href: "/supervisor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/supervisor/inspectors", label: "Inspectors", icon: Users },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-fit items-center gap-8 rounded-full bg-dark px-6 py-3 shadow-lg">
      {LINKS.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-label={link.label}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? "text-accent" : "text-white/60"
            }`}
          >
            <link.icon size={20} />
            <span className="text-[10px] font-medium">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

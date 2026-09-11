"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardClock, ScanSquare, LayoutDashboard } from "lucide-react";

const LINKS = [
  { href: "/inspector/scan", label: "Scan", icon: ScanSquare },
  { href: "/inspector/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inspector/history", label: "History", icon: ClipboardClock },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-4 z-50 mx-auto flex h-14 w-fit items-center gap-6 rounded-full bg-dark px-6 py-3 shadow-lg">
  {LINKS.map((link) => {
    const isActive = pathname === link.href;

    return (
      <Link
        key={link.href}
        href={link.href}
        aria-label={link.label}
        className={`flex items-center justify-center transition-all duration-300 
          hover:rotate-30 ${
          isActive
            ? "-translate-y-3 h-12 w-12 rounded-full bg-accent text-dark shadow-md"
            : "text-white/60"
        }`}
      >
        <link.icon size={22} />
      </Link>
    );
  })}
</nav>
  );
}

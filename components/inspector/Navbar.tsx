"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardClock, ScanSquare, LayoutDashboard } from "lucide-react";

const LINKS = [
  { href: "/inspector/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inspector", label: "Scan", icon: ScanSquare },
  { href: "/inspector/history", label: "History", icon: ClipboardClock },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-fit items-center gap-6 rounded-full bg-dark px-6 py-3 shadow-lg">
      {LINKS.map((link, i) => {
        const isActive = pathname === link.href;
        const isCenter = i === 1;

        if (isCenter) {
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-label={link.label}
              className={`-mt-8 flex h-14 w-14 items-center justify-center rounded-full shadow-md transition-colors ${
                isActive ? "bg-accent text-dark" : "bg-accent/80 text-dark"
              }`}
            >
              <link.icon size={22}/>  
            </Link>
          );
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-label={link.label}
            className={`transition-colors ${
              isActive ? "text-accent" : "text-white/60"
            }`}
          >
            <link.icon size = {22}/> 
          </Link>
        );
      })}
    </nav>
  );
}

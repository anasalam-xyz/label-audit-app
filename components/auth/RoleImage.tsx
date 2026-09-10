"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Role } from "./RoleToggle";

const IMAGES: Record<Role, string> = {
  inspector: "/inspector-illustration.svg",
  supervisor: "/supervisor-illustration.svg",
};

export function RoleImage({ role }: { role: Role }) {
  const [displayedRole, setDisplayedRole] = useState<Role>(role);
  const [wipeKey, setWipeKey] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const prevRole = useRef<Role>(role);

  useEffect(() => {
    if (role === prevRole.current) return;
    setDirection(role === "supervisor" ? 1 : -1);
    setWipeKey((k) => k + 1);
    // swap the image at the exact moment the orange panel fully covers it
    const timer = setTimeout(() => setDisplayedRole(role), 300);
    prevRole.current = role;
    return () => clearTimeout(timer);
  }, [role]);

  return (
    <div className="relative mx-auto h-56 w-full overflow-hidden rounded-card bg-surface">
      <img
        src={IMAGES[displayedRole]}
        alt={`${displayedRole} illustration`}
        className="h-full w-full object-cover"
      />
      {wipeKey > 0 && (
        <motion.div
          key={wipeKey}
          className="absolute inset-0 bg-accent"
          initial={{ x: direction === 1 ? "-100%" : "100%" }}
          animate={{ x: direction === 1 ? "100%" : "-100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}

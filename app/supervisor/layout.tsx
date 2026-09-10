"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/inspector/Topbar";
import Navbar from "@/components/supervisor/Navbar";
import { getToken, getStoredUser } from "@/lib/auth-storage";

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = getToken();
    const user = getStoredUser();
    if (!token) {
      router.replace("/login");
      return;
    }
    if (user?.role === "inspector") {
      router.replace("/inspector");
      return;
    }
    setIsChecking(false);
  }, [router]);

  if (isChecking) return null;

  return (
    <div>
      <Topbar />
      {children}
      <Navbar />
    </div>
  );
}

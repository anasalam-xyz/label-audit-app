"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/inspector/Navbar";
import Topbar from "@/components/inspector/Topbar";
import { getToken } from "@/lib/auth-storage";

export default function InspectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
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

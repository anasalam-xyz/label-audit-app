
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, HelpCircle } from "lucide-react";
import { login } from "@/lib/api/auth";
import { setSession } from "@/lib/auth-storage";
import { ApiError } from "@/lib/api/client";
import { RoleToggle, type Role } from "@/components/auth/RoleToggle";
import { RoleImage } from "@/components/auth/RoleImage";
import { DesktopRoleImages } from "@/components/auth/DesktopRoleImages";
import { AnimatePresence, motion } from "framer-motion";

const DEMO_ACCOUNTS = [
  { email: "rakesh@labelaudit.gov.in", password: "inspector123", name: "Rakesh Kumar", role: "inspector" as const },
  { email: "anjali@labelaudit.gov.in", password: "inspector123", name: "Anjali Verma", role: "inspector" as const },
  { email: "suresh@labelaudit.gov.in", password: "supervisor123", name: "Suresh Prasad", role: "supervisor" as const },
];

const ROLE_DESTINATION: Record<string, string> = {
  inspector: "/inspector/dashboard",
  supervisor: "/supervisor",
  admin: "/supervisor",
};

const ROLE_COPY: Record<Role, { title: string; subtitle: string }> = {
  inspector: {
    title: "Inspector Login",
    subtitle: "Enter your details to start scanning labels.",
  },
  supervisor: {
    title: "Supervisor Login",
    subtitle: "Enter your details to view your region's data",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("inspector");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleAccounts = DEMO_ACCOUNTS.filter((acc) => acc.role === role);
  const copy = ROLE_COPY[role];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await login(email, password);
      setSession(res.access_token, res.user);
      router.push(ROLE_DESTINATION[res.user.role] ?? "/inspector");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the server");
    } finally {
      setIsLoading(false);
    }
  }

  const form = (
    <form onSubmit={handleSubmit} className="h-[90%] flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-xs text-muted">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm text-ink outline-none focus:border-accent"
          placeholder="you@labelaudit.gov.in"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm text-ink outline-none focus:border-accent"
          placeholder="••••••••"
        />
      </div>

      <button type="button" className="font-mono text-left text-xs text-muted underline-offset-2 hover:underline">
        Having trouble signing in?
      </button>

      {error && <p className="text-sm text-violation">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="cursor-pointer group mt-2 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-body font-medium text-accent-ink disabled:opacity-60"
      >
        {isLoading ? "Signing in…" : "Sign in"}
        {!isLoading && <ArrowRight className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" size={16} />}
      </button>

      {/*}<div className="mt-6">
        <p className="mb-2 text-xs text-muted">Demo accounts — {role}</p>
        <ul className="divide-y divide-border rounded-card border border-border bg-surface">
          {visibleAccounts.map((acc) => (
            <li key={acc.email}>
              <button
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(acc.password);
                }}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{acc.name}</p>
                  <p className="text-xs text-muted">{acc.email}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>*/}
    </form>
  );

  return (
    <main className="h-fit bg-bg">
      {/* ---- Topbar (both breakpoints) ---- */}
      <header className="flex items-center justify-between px-6 py-5">
        <p className="flex flex-col text-lg font-bold md:font-extrabold text-ink">LabelAudit <span className="mt-2 w-full border-1 border-gray-500"></span></p>
        <button className="flex items-center gap-1.5 text-sm text-muted">
          <HelpCircle size={16} />
          Help
        </button>
      </header>

      {/* ---- Mobile layout (<md) ---- */}
      <div className="mx-auto max-w-md px-6 pb-10 md:hidden">
        <div className="mt-6 rounded-card bg-surface p-6 shadow-sm">
          <div className="my-4 flex justify-center">
          <RoleToggle role={role} onChange={setRole} />
        </div>
        <div className="pointer-events-none">
          <RoleImage role={role} />
        </div>
          <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
          <h1 className="mt-8 font-display text-lg font-semibold text-ink">
          {copy.title}
          </h1>

          <p className="mt-1 mb-6 text-xs text-muted md:text-sm">
            {copy.subtitle}
          </p>
          </motion.div>
          </AnimatePresence>

        {form}        
        </div>
      </div>

      {/* ---- Desktop layout (>=md) ---- */}
      <div className="relative mx-auto hidden min-h-[600px] max-w-5xl items-center justify-center md:flex">
        <div className="pointer-events-none">
            <DesktopRoleImages role={role} />
        </div>
        <div className="relative z-10 w-full max-w-md rounded-card bg-surface p-8 shadow-lg">
          <div className="mb-6 flex justify-center">
            <RoleToggle role={role} onChange={setRole} />
          </div>
          
          <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
          <h1 className="mt-8 font-display text-lg font-semibold text-ink">
          {copy.title}
          </h1>

          <p className="mt-1 mb-6 text-xs text-muted md:text-sm">
            {copy.subtitle}
          </p>
          </motion.div>
          </AnimatePresence>

        {form}        
        </div>
      </div>
    </main>
  );
}

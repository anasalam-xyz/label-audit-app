"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { login } from "@/lib/api/auth";
import { setSession } from "@/lib/auth-storage";
import { ApiError } from "@/lib/api/client";

const DEMO_ACCOUNTS = [
  { email: "rakesh@labelaudit.gov.in", password: "inspector123", name: "Rakesh Kumar", role: "inspector" as const },
  { email: "anjali@labelaudit.gov.in", password: "inspector123", name: "Anjali Verma", role: "inspector" as const },
  { email: "suresh@labelaudit.gov.in", password: "supervisor123", name: "Suresh Prasad", role: "supervisor" as const },
];

const ROLE_DESTINATION: Record<string, string> = {
  inspector: "/inspector",
  supervisor: "/supervisor",
  admin: "/supervisor",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="mb-8">
        <p className="text-sm font-medium text-accent">LabelAudit</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Sign in</h1>
        <p className="mt-1 text-sm text-muted">
          Legal Metrology compliance scanner
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs text-muted">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-card border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-accent"
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
            className="w-full rounded-card border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-accent"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-violation">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 flex items-center justify-center gap-2 rounded-card bg-dark px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isLoading ? "Signing in…" : "Sign in"}
          {!isLoading && <ArrowRight size={16} />}
        </button>
      </form>

      <div className="mt-8">
        <p className="mb-2 text-xs text-muted">Demo accounts</p>
        <ul className="divide-y divide-border rounded-card border border-border bg-surface">
          {DEMO_ACCOUNTS.map((acc) => (
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
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    acc.role === "supervisor"
                      ? "bg-accent/15 text-accent"
                      : "bg-bg text-muted"
                  }`}
                >
                  {acc.role === "supervisor" ? "Supervisor" : "Inspector"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

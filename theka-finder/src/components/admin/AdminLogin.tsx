"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Couldn't sign in.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network trouble.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mx-auto mt-10 max-w-sm rounded-card border border-border bg-surface p-5"
    >
      <h1 className="text-base font-semibold text-text">Curator access</h1>
      <p className="mt-1 text-sm text-muted">
        Enter the token from <code className="text-xs">ADMIN_TOKEN</code>.
      </p>
      <input
        type="password"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        autoComplete="current-password"
        placeholder="Token"
        className="mt-3 w-full rounded-card border border-border bg-bg px-3 py-2.5 text-base text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
      />
      {error && (
        <p role="alert" className="mt-2 rounded-card bg-warn-soft px-3 py-2 text-sm text-warn">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="mt-3 w-full rounded-card bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}

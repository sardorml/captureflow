"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";

// Kept separate from the marketing AuthPanel, which pulls in the i18n provider
// and marketing shell.
export function AuthForm({
  next,
  initialMode = "signin",
}: {
  next: string;
  initialMode?: "signin" | "signup";
}) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = isSignup
        ? await signUp.email({
            email,
            password,
            name: name.trim() || email.split("@")[0],
          })
        : await signIn.email({ email, password });
      if (res.error) {
        setError(
          res.error.message ?? "Something went wrong. Please try again.",
        );
        setBusy(false);
        return;
      }
      // Full navigation so the freshly-set session cookie is read by the
      // middleware and server components on the destination.
      window.location.assign(next);
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-line bg-canvas-2 p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-round.png"
          alt=""
          width={32}
          height={32}
          className="rounded-lg"
        />
        <span className="text-lg font-semibold tracking-tight text-fg">
          CaptureFlow
        </span>
      </div>

      <h1 className="text-xl font-semibold tracking-tight text-fg-strong">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-1 text-sm text-fg-muted">
        {isSignup
          ? "Start sharing recordings with a public link."
          : "Sign in to manage your shares and snaps."}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {isSignup && (
          <Field
            label="Name"
            type="text"
            value={name}
            onChange={setName}
            placeholder="Your name"
            autoComplete="name"
          />
        )}
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder={isSignup ? "At least 12 characters" : "••••••••"}
          autoComplete={isSignup ? "new-password" : "current-password"}
          required
          minLength={isSignup ? 12 : undefined}
        />

        {error && (
          <p
            className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-accent-bg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-bg-hover disabled:opacity-60"
        >
          {busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-fg-muted">
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(isSignup ? "signin" : "signup");
            setError(null);
          }}
          className="font-medium text-accent underline-offset-2 hover:underline"
        >
          {isSignup ? "Sign in" : "Sign up"}
        </button>
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-fg">{label}</span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line-strong bg-canvas px-3 py-2 text-sm text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-accent focus:ring-1 focus:ring-accent"
      />
    </label>
  );
}

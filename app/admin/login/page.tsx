"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { LuArrowLeft, LuGithub, LuLock, LuMail, LuCircleAlert } from "react-icons/lu";
import { Button, Field, Input } from "@/components/admin/ui";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"email" | "github" | null>(null);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "AccessDenied" ? "This account isn't on the admin allow-list." : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("email");
    setError(null);
    try {
      const res = await signIn("credentials", { email, password, redirect: false, callbackUrl });
      if (res?.error) {
        setError(res.error === "AccessDenied" ? "This account isn't on the admin allow-list." : "Incorrect email or password.");
        setLoading(null);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(null);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 font-mono text-sm font-bold text-white">BK</span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900">Sign in to your studio</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage projects, experience and your resume.</p>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <LuCircleAlert size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" autoComplete="username" leading={<LuMail size={15} />} value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input id="password" type="password" autoComplete="current-password" leading={<LuLock size={15} />} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        <Button type="submit" className="w-full" loading={loading === "email"} disabled={!!loading}>
          Sign in
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-wider text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200" /> or <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <Button
        variant="secondary"
        className="w-full"
        icon={<LuGithub size={16} />}
        loading={loading === "github"}
        disabled={!!loading}
        onClick={() => {
          setLoading("github");
          signIn("github", { callbackUrl });
        }}
      >
        Continue with GitHub
      </Button>

      <Link href="/" className="mt-10 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900">
        <LuArrowLeft size={14} /> Back to portfolio
      </Link>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center bg-white p-6 sm:p-12">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
      <div className="relative hidden overflow-hidden bg-zinc-950 lg:block">
        <div
          className="absolute inset-0 opacity-[.15]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-brand-500/40 blur-3xl" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <p className="font-mono text-xs uppercase tracking-[.2em] text-white/50">Portfolio studio</p>
          <p className="mt-4 max-w-md text-3xl font-semibold leading-tight tracking-tight">
            Every edit goes live instantly — and syncs to Cloudflare D1.
          </p>
        </div>
      </div>
    </div>
  );
}

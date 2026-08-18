"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Briefcase, Mail, Lock, Loader2 } from "lucide-react";
import { Button, Input, Card, Alert } from "@/components/ui";
import { useAuth } from "@/components/auth/AuthProvider";

import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      router.push(redirect);
    } else {
      setError(res.error || "Login failed");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">GlobalHire</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-600 mt-1">Sign in to continue to your account</p>
        </div>

        <Card className="p-6">
          {error && <Alert variant="error" className="mb-4">{error}</Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              required
              icon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              required
              icon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <Button type="submit" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600 space-y-2">
            <div>
              Don't have an account?{" "}
              <Link href="/register" className="font-medium text-emerald-700 hover:underline">
                Sign up as Job Seeker
              </Link>
            </div>
            <div className="text-xs">
              Hiring?{" "}
              <Link href="/employer/signup" className="font-medium text-emerald-700 hover:underline">
                Create Company Account
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center mb-3">Demo accounts:</p>
            <div className="space-y-2 text-xs">
              <DemoCred label="Admin" email="admin@globalhire.com" password="admin123" onClick={() => { setEmail("admin@globalhire.com"); setPassword("admin123"); }} />
              <DemoCred label="Employer" email="employer@globalhire.com" password="employer123" onClick={() => { setEmail("employer@globalhire.com"); setPassword("employer123"); }} />
              <DemoCred label="Seeker" email="seeker@globalhire.com" password="seeker123" onClick={() => { setEmail("seeker@globalhire.com"); setPassword("seeker123"); }} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function DemoCred({ label, email, password, onClick }: { label: string; email: string; password: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-left"
    >
      <span className="font-medium text-slate-700">{label}</span>
      <span className="text-slate-500 font-mono">{email}</span>
    </button>
  );
}

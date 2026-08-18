"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, Mail, Lock, User } from "lucide-react";
import { Button, Input, Card, Alert, Select } from "@/components/ui";
import { useAuth } from "@/components/auth/AuthProvider";

export default function RegisterPage() {
  // This page is for Job Seekers. Employers should use /employer/signup
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Job Seeker" | "Employer">("Job Seeker");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await register({ name, email, password, role });
    setLoading(false);
    if (res.success) {
      // Redirect based on role
      if (role === "Employer") {
        router.push("/employer/company/create");
      } else {
        router.push("/dashboard/profile");
      }
    } else {
      setError(res.error || "Registration failed");
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
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-slate-600 mt-1">Join millions of job seekers and employers</p>
        </div>

        <Card className="p-6">
          {error && <Alert variant="error" className="mb-4">{error}</Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select label="I am a..." value={role} onChange={(e) => setRole(e.target.value as any)}>
              <option value="Job Seeker">Job Seeker</option>
              <option value="Employer">Employer</option>
            </Select>
            <Input
              label="Full Name"
              required
              icon={<User className="w-4 h-4" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
            />
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
              placeholder="At least 8 characters"
              hint="Must be at least 8 characters"
            />
            <Button type="submit" className="w-full" loading={loading}>
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-emerald-700 hover:underline">
              Sign in
            </Link>
          </div>
        </Card>

        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
          <p className="text-sm text-emerald-900">
            <strong>Hiring for your company?</strong>{" "}
            <Link href="/employer/signup" className="font-semibold underline">
              Create a company account →
            </Link>
          </p>
        </div>

        <p className="text-xs text-slate-500 text-center mt-4">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline">Terms</Link> and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

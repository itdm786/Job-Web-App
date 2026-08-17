"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, UserRole } from "@/lib/auth-context";
import { LANGUAGES } from "@/lib/constants";
import { translations, LangCode } from "@/lib/translations";
import Link from "next/link";

function AuthContent() {
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get("role") as UserRole) || "seeker";
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [loading, setLoading] = useState(false);
  const { login, language } = useAuth();
  const router = useRouter();
  const t = (k: string) => translations[language as LangCode]?.[k] || translations.en[k] || k;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { alert("Enter valid Gmail-like email"); return; }
    setLoading(true);
    try {
      await login(email, name || email.split("@")[0], role);
      if (role === "seeker") router.push("/dashboard/seeker");
      else if (role === "employer") router.push("/dashboard/employer");
      else router.push("/dashboard/admin");
    } catch (err: any) {
      alert(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-5xl grid md:grid-cols-2 gap-0 rounded-[24px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-200">
      <div className="p-8 md:p-10 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-slate-900 font-bold">GJ</div>
            <span className="font-bold">GlobalJobs</span>
          </Link>
          <h1 className="mt-10 text-3xl font-bold leading-tight">Secure Gmail Login<br/>for All Roles</h1>
          <p className="mt-3 text-sm text-slate-300">{t("authSubtitle")} — Indeed-like profiles, pending review workflow, multi-lang.</p>

          <div className="mt-8 space-y-3">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur ring-1 ring-white/10">
              <div className="font-semibold text-sm">👤 Job Seeker Portal</div>
              <div className="text-xs text-slate-300 mt-1">Profile, resume upload, skills, saved jobs, alerts, application tracking</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur ring-1 ring-white/10">
              <div className="font-semibold text-sm">🏢 Employer Portal</div>
              <div className="text-xs text-slate-300 mt-1">Company page, post job (Pending Review until admin approval), applicants, analytics</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur ring-1 ring-white/10">
              <div className="font-semibold text-sm">🛡️ Admin Portal</div>
              <div className="text-xs text-slate-300 mt-1">Super admin + Manager/Editor/Publisher + custom roles/permissions, approval queue</div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {LANGUAGES.map(l => <div key={l.code} className="rounded-full bg-white/10 px-3 py-1 text-xs">{l.flag} {l.name}</div>)}
          </div>
        </div>
      </div>

      <div className="p-8 md:p-10">
        <h2 className="text-2xl font-bold">Continue with Gmail</h2>
        <p className="mt-1 text-sm text-slate-500">Mock Google OAuth — Enter any email, choose role. In production use NextAuth + Google.</p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {(["seeker", "employer", "admin"] as UserRole[]).map(r => (
            <button key={r} onClick={() => setRole(r)} className={`rounded-xl border p-3 text-left ${role === r ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 hover:bg-slate-50"}`}>
              <div className="text-xs font-bold uppercase">{r}</div>
              <div className="text-[11px] mt-1 opacity-80">{r === "seeker" ? "Find jobs" : r === "employer" ? "Post jobs" : "Manage"}</div>
            </button>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-4 gap-2 text-[10px]">
          {(["manager", "editor", "publisher", "advertiser"] as UserRole[]).map(r => (
            <button key={r} onClick={() => setRole(r)} className={`rounded-full border px-2 py-1 ${role === r ? "bg-amber-700 text-white border-amber-700" : "bg-white"}`}>{r}</button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div>
            <label className="text-xs font-semibold">Gmail Address</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@gmail.com" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-100" />
          </div>
          <div>
            <label className="text-xs font-semibold">Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-100" />
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-full bg-slate-900 py-3 text-sm font-bold text-white hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-bold text-slate-900">G</span>
            {loading ? "Signing in..." : `${t("login")} as ${role}`}
          </button>

          <div className="text-[11px] text-slate-500 text-center">🔒 Simulates Google OAuth. Real app would use Firebase Auth / Auth0 / NextAuth.</div>
        </form>

        <div className="mt-6 rounded-xl bg-teal-50 p-3 text-xs text-teal-900">
          <div className="font-bold">Test Accounts:</div>
          <div>👤 Seeker: seeker@gmail.com</div>
          <div>🏢 Employer: employer@gmail.com</div>
          <div>🛡️ Admin: admin@gmail.com</div>
          <div className="mt-1 opacity-70">Use any name, pick role to explore portals.</div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-[#F2F1EC] p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <AuthContent />
      </Suspense>
    </div>
  );
}

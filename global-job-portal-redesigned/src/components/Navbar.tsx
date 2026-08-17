"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { LANGUAGES } from "@/lib/constants";
import { useState } from "react";
import { translations, LangCode } from "@/lib/translations";

export default function Navbar() {
  const { user, logout, language, setLanguage } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const t = (k: string) => translations[language as LangCode]?.[k] || translations.en[k] || k;

  return (
    <nav className="sticky top-0 z-50 border-b" style={{ borderColor: "var(--line)", background: "var(--card)" }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-7">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="seal" style={{ width: 34, height: 34, transform: "rotate(0deg)" }}>
              <span className="seal-mark">GJ</span>
            </span>
            <div className="leading-tight">
              <div className="font-display text-[16px] font-semibold tracking-tight" style={{ color: "var(--ink)" }}>GlobalJobs Registry</div>
              <div className="text-[10.5px] uppercase tracking-[0.08em]" style={{ color: "var(--ink-faint)" }}>Government &amp; Private &middot; Worldwide</div>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <Link href="/jobs" className="rounded-full px-3 py-1.5 text-sm font-medium hover:bg-[var(--paper)] transition" style={{ color: "var(--ink)" }}>{t("jobs")}</Link>
            <Link href="/jobs?jobNature=government" className="rounded-full px-3 py-1.5 text-sm font-medium transition" style={{ color: "var(--gold)" }}>Government Jobs</Link>
            <Link href="/blogs" className="rounded-full px-3 py-1.5 text-sm font-medium hover:bg-[var(--paper)] transition" style={{ color: "var(--ink)" }}>{t("blog")}</Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select value={language} onChange={e => setLanguage(e.target.value as LangCode)} className="appearance-none rounded-full border bg-transparent px-3 py-1.5 pr-7 text-xs font-medium" style={{ borderColor: "var(--line)" }}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.code.toUpperCase()}</option>)}
            </select>
          </div>

          {user ? (
            <>
              <Link href={user.role === "employer" ? "/dashboard/employer" : user.role === "seeker" ? "/dashboard/seeker" : "/dashboard/admin"} className="btn btn-primary hidden md:inline-flex">
                {t("dashboard")}
              </Link>
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 rounded-full border pl-1 pr-3 py-1" style={{ borderColor: "var(--line)" }}>
                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="h-7 w-7 rounded-full" alt="" />
                  <span className="hidden md:block text-sm font-medium max-w-[100px] truncate">{user.name}</span>
                </button>
                {menuOpen && (
                  <div className="card absolute right-0 mt-2 w-56 p-2 shadow-xl">
                    <div className="px-3 py-2">
                      <div className="text-sm font-semibold">{user.name}</div>
                      <div className="text-xs truncate" style={{ color: "var(--ink-faint)" }}>{user.email}</div>
                      <div className="mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: "var(--teal-soft)", color: "var(--teal)" }}>{user.role}</div>
                    </div>
                    <div className="my-1 stub-divider" />
                    <Link href="/dashboard/seeker" className="block rounded px-3 py-2 text-sm hover:bg-[var(--paper)]">Job Seeker</Link>
                    <Link href="/dashboard/employer" className="block rounded px-3 py-2 text-sm hover:bg-[var(--paper)]">Employer</Link>
                    <Link href="/dashboard/admin" className="block rounded px-3 py-2 text-sm hover:bg-[var(--paper)]">Admin / Manager</Link>
                    <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full text-left rounded px-3 py-2 text-sm hover:bg-[var(--rust-soft)]" style={{ color: "var(--rust)" }}>{t("logout")}</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth" className="btn btn-outline">Sign in</Link>
              <Link href="/auth" className="btn btn-teal">Post a Job</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

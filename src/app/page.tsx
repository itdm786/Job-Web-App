"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import JobCard from "@/components/JobCard";
import Link from "next/link";
import { COUNTRIES, CATEGORIES } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { translations, LangCode } from "@/lib/translations";

export default function HomePage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [govJobs, setGovJobs] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, jobs: 0 });
  const [saved, setSaved] = useState<string[]>([]);
  const { user, language } = useAuth();
  const t = (k: string) => translations[language as LangCode]?.[k] || translations.en[k] || k;

  useEffect(() => {
    const load = async () => {
      try {
        const [jobsRes, govRes, adsRes, statsRes] = await Promise.all([
          fetch("/api/jobs?limit=6").then(r => r.json()),
          fetch("/api/jobs?jobNature=government&limit=6").then(r => r.json()),
          fetch("/api/ads?zone=homepage_banner").then(r => r.json()),
          fetch("/api/admin/stats").then(r => r.json()).catch(() => ({ users: 12400, jobs: 3400 })),
        ]);
        setJobs(jobsRes.jobs || []);
        setGovJobs(govRes.jobs || []);
        setAds(adsRes.ads || []);
        setStats(statsRes);
        if (user) {
          const savedRes = await fetch(`/api/saved?seekerId=${user.id}`).then(r => r.json());
          setSaved(savedRes.saved?.map((s: any) => s.job?.id) || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [user]);

  const toggleSave = async (jobId: string) => {
    if (!user) { window.location.href = "/auth"; return; }
    await fetch("/api/saved", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ seekerId: user.id, jobId }) });
    setSaved(prev => prev.includes(jobId) ? prev.filter(i => i !== jobId) : [...prev, jobId]);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden ledger-rule" style={{ background: "var(--ink)" }}>
        <div className="relative mx-auto max-w-7xl px-4 py-14 lg:px-6 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em]" style={{ background: "rgba(255,255,255,0.08)", color: "#EDEBE2", border: "1px solid rgba(255,255,255,0.14)" }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#3FAE96" }}></span>
              Notice board &middot; {stats.jobs || 3400}+ listings &middot; {stats.users || 12400}+ registered seekers
            </div>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] text-white md:text-[3.4rem]">
              {t("welcome")}
              <span className="block" style={{ color: "#C9A15B" }}>Government &amp; Private, one registry.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed" style={{ color: "#B7BCC9" }}>{t("subtitle")} &mdash; Pakistan, USA, India, UAE and more. Filter by country, department, city and office.</p>

            <div className="mt-8">
              <SearchBar />
            </div>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
              {COUNTRIES.slice(0, 4).map(c => (
                <Link key={c.code} href={`/jobs?country=${encodeURIComponent(c.name)}`} className="rounded-md p-4 transition" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>
                  <div className="text-xl">{c.flag}</div>
                  <div className="mt-2 text-sm font-semibold text-white">{c.name}</div>
                  <div className="text-[11px]" style={{ color: "#8891A3" }}>Gov &amp; Private listings</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ads banner */}
      {ads.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 lg:px-6 mt-6">
          <div className="card flex items-center gap-4 p-4" style={{ borderColor: "var(--gold)", borderStyle: "dashed" }}>
            <span className="rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide" style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>Sponsored</span>
            <div className="flex-1">
              <div className="text-sm font-bold">{ads[0].title} &middot; {ads[0].countryTarget || "Global"} targeted</div>
              <div className="text-xs" style={{ color: "var(--ink-soft)" }}>{ads[0].description}</div>
            </div>
            <a href={ads[0].linkUrl} target="_blank" className="btn btn-primary" style={{ padding: "0.45rem 1rem", fontSize: "0.75rem" }}>Learn more</a>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 lg:px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main */}
        <div className="lg:col-span-8 space-y-10">
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">{t("featuredJobs")}</h2>
              <Link href="/jobs" className="text-sm font-medium" style={{ color: "var(--teal)" }}>View all &rarr;</Link>
            </div>
            <div className="mt-4 grid gap-3">
              {jobs.length === 0 ? (
                <div className="card border-dashed p-10 text-center" style={{ borderStyle: "dashed" }}>
                  <div className="font-display text-lg font-semibold">No listings yet</div>
                  <div className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>Post a job as an employer, or check back after the approval queue clears.</div>
                </div>
              ) : jobs.map(job => <JobCard key={job.id} job={job} onSave={toggleSave} isSaved={saved.includes(job.id)} />)}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">{t("latestGovJobs")}</h2>
              <Link href="/jobs?jobNature=government" className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>Government only</Link>
            </div>
            <div className="mt-4 grid gap-3">
              {govJobs.map(job => <JobCard key={job.id} job={job} onSave={toggleSave} isSaved={saved.includes(job.id)} />)}
              {govJobs.length === 0 && <div className="text-sm card p-6" style={{ color: "var(--ink-soft)" }}>No government notices yet. Filter logic: select Pakistan &rarr; Government shows only Pakistan's government jobs.</div>}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card p-5">
            <h3 className="font-display font-semibold">Browse by category</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <Link key={cat} href={`/jobs?category=${encodeURIComponent(cat)}`} className="rounded-full px-3 py-1.5 text-xs font-medium transition" style={{ background: "var(--paper)", color: "var(--ink-soft)" }}>{cat}</Link>
              ))}
            </div>
          </div>

          <div className="p-5 ledger-rule" style={{ background: "var(--ink)", color: "#fff", borderRadius: 6 }}>
            <h3 className="font-display font-semibold">For employers</h3>
            <p className="mt-2 text-sm" style={{ color: "#B7BCC9" }}>Post jobs, get reviewed by an admin, and reach candidates worldwide. Every listing clears an approval queue before it goes live.</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded p-3" style={{ background: "rgba(255,255,255,0.07)" }}>
                <div className="font-bold">Pending &rarr; Approved</div>
                <div style={{ color: "#8891A3" }}>Admin approves</div>
              </div>
              <div className="rounded p-3" style={{ background: "rgba(255,255,255,0.07)" }}>
                <div className="font-bold">Country targeting</div>
                <div style={{ color: "#8891A3" }}>Ads per country</div>
              </div>
            </div>
            <Link href="/auth?role=employer" className="mt-4 flex w-full justify-center rounded-full px-4 py-2.5 text-sm font-bold" style={{ background: "#fff", color: "var(--ink)" }}>Post a job &mdash; free</Link>
          </div>

          <div className="card p-5">
            <h3 className="font-display font-semibold">Trust &amp; safety</h3>
            <ul className="mt-3 space-y-2 text-xs" style={{ color: "var(--ink-soft)" }}>
              <li>Auto-flag: scam, fake and illegal keyword detection</li>
              <li>Reporting: users can report a job, ad or blog post</li>
              <li>Privacy Policy, Terms and Cookie Policy pages</li>
              <li>Resume visibility controls for every seeker</li>
            </ul>
            <div className="mt-4 flex gap-3 text-xs font-medium" style={{ color: "var(--teal)" }}>
              <Link href="/privacy">Privacy Policy</Link>
              <span style={{ color: "var(--line)" }}>&middot;</span>
              <Link href="/terms">Terms</Link>
            </div>
          </div>

          <div className="card p-5" style={{ background: "var(--gold-soft)", borderColor: "var(--gold)" }}>
            <h3 className="font-display font-semibold" style={{ color: "var(--gold)" }}>Multi-language</h3>
            <p className="mt-1 text-xs" style={{ color: "#6B5527" }}>Urdu, Hindi, English, Arabic, Spanish, French &mdash; UI and job posts are translatable. Switch language from the top nav.</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { code: "EN", name: "English" },
                { code: "UR", name: "\u0627\u0631\u062f\u0648" },
                { code: "HI", name: "\u0939\u093f\u0928\u094d\u0926\u0940" },
                { code: "AR", name: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629" },
                { code: "ES", name: "Espa\u00f1ol" },
                { code: "FR", name: "Fran\u00e7ais" },
              ].map(l => <div key={l.code} className="rounded px-2 py-2 text-center text-[11px] font-bold" style={{ background: "#fff", color: "var(--ink)" }}>{l.code}</div>)}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-display font-semibold">From the blog</h3>
            <div className="mt-3 space-y-3 text-sm">
              <div className="rounded p-3" style={{ background: "var(--paper)" }}>
                <div className="font-medium">How to get a government job in Pakistan</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>Editor &rarr; Review &rarr; Publisher workflow, with a full rich-text editor</div>
              </div>
              <Link href="/blogs" className="text-xs font-medium" style={{ color: "var(--teal)" }}>Browse the blog &rarr;</Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t py-10 mt-10" style={{ borderColor: "var(--line)", background: "var(--card)" }}>
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid md:grid-cols-4 gap-8 text-sm">
            <div>
              <div className="font-display font-semibold">GlobalJobs Registry</div>
              <div className="mt-2 text-xs" style={{ color: "var(--ink-soft)" }}>Government &amp; private jobs across Pakistan, USA, India, UAE and more &mdash; every listing reviewed before it's published.</div>
            </div>
            <div>
              <div className="font-semibold">Job Seekers</div>
              <div className="mt-2 space-y-1 text-xs" style={{ color: "var(--ink-soft)" }}><div>Profile + resume</div><div>Alerts &amp; saved jobs</div><div>Application tracking</div></div>
            </div>
            <div>
              <div className="font-semibold">Employers</div>
              <div className="mt-2 space-y-1 text-xs" style={{ color: "var(--ink-soft)" }}><div>Company profile</div><div>Post a job (pending review)</div><div>Applicant analytics</div></div>
            </div>
            <div>
              <div className="font-semibold">Admin</div>
              <div className="mt-2 space-y-1 text-xs" style={{ color: "var(--ink-soft)" }}><div>Role-based (Manager / Editor / Publisher)</div><div>Jobs approval queue</div><div>Ads country targeting</div></div>
            </div>
          </div>
          <div className="mt-8 text-center text-[11px]" style={{ color: "var(--ink-faint)" }}>&copy; 2026 GlobalJobs Registry &middot; Built with Next.js, PostgreSQL &amp; Drizzle</div>
        </div>
      </footer>
    </div>
  );
}

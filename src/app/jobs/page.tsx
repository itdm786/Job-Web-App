"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import FiltersSidebar from "@/components/FiltersSidebar";
import JobCard from "@/components/JobCard";
import { useAuth } from "@/lib/auth-context";
import { SALARY_RANGES } from "@/lib/constants";

function JobsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    country: searchParams.get("country") || "All",
    city: searchParams.get("city") || "All",
    jobNature: searchParams.get("jobNature") || "All",
    department: searchParams.get("department") || "All",
    category: searchParams.get("category") || "All",
    employmentType: searchParams.get("employmentType") || "All",
    salaryRange: "Any",
    postedDate: searchParams.get("postedDate") || "All",
    organization: searchParams.get("organization") || "",
  });
  const [q, setQ] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setFilters({
      country: searchParams.get("country") || "All",
      city: searchParams.get("city") || "All",
      jobNature: searchParams.get("jobNature") || "All",
      department: searchParams.get("department") || "All",
      category: searchParams.get("category") || "All",
      employmentType: searchParams.get("employmentType") || "All",
      salaryRange: "Any",
      postedDate: searchParams.get("postedDate") || "All",
      organization: searchParams.get("organization") || "",
    });
    setQ(searchParams.get("q") || "");
  }, [searchParams]);

  const fetchJobs = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (filters.country !== "All") params.set("country", filters.country);
    if (filters.city !== "All") params.set("city", filters.city);
    if (filters.jobNature !== "All") params.set("jobNature", filters.jobNature);
    if (filters.department !== "All") params.set("department", filters.department);
    if (filters.category !== "All") params.set("category", filters.category);
    if (filters.employmentType !== "All") params.set("employmentType", filters.employmentType);
    if (filters.postedDate !== "All") params.set("postedDate", filters.postedDate);
    if (filters.organization) params.set("organization", filters.organization);
    const salary = SALARY_RANGES.find(r => r.label === filters.salaryRange);
    if (salary && salary.label !== "Any") {
      params.set("salaryMin", salary.min.toString());
      params.set("salaryMax", salary.max.toString());
    }
    params.set("status", "approved");
    params.set("limit", "50");

    const res = await fetch(`/api/jobs?${params.toString()}`);
    const data = await res.json();
    setJobs(data.jobs || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, [filters, q]);

  useEffect(() => {
    if (user) {
      fetch(`/api/saved?seekerId=${user.id}`).then(r => r.json()).then(d => setSaved(d.saved?.map((s: any) => s.job?.id) || []));
    }
  }, [user]);

  const toggleSave = async (jobId: string) => {
    if (!user) { router.push("/auth"); return; }
    await fetch("/api/saved", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ seekerId: user.id, jobId }) });
    setSaved(prev => prev.includes(jobId) ? prev.filter(i => i !== jobId) : [...prev, jobId]);
  };

  const clearFilters = () => {
    setFilters({
      country: "All",
      city: "All",
      jobNature: "All",
      department: "All",
      category: "All",
      employmentType: "All",
      salaryRange: "Any",
      postedDate: "All",
      organization: "",
    });
    setQ("");
    router.push("/jobs");
  };

  const activeLogic = filters.country !== "All" && filters.jobNature !== "All" ? `Showing ${filters.country}'s ${filters.jobNature} jobs only` : null;

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6 py-6">
      <div className="mb-6">
        <SearchBar initialQ={q} compact />
        {activeLogic && (
          <div className="mt-3 rounded-full inline-flex px-4 py-1.5 text-xs font-semibold" style={{ background: "var(--teal-soft)", color: "var(--teal)", border: "1px solid var(--teal)" }}>{activeLogic} &mdash; country + gov/private filter active</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <FiltersSidebar filters={filters} onChange={setFilters} onClear={clearFilters} />
          <div className="mt-4 rounded p-4 text-white" style={{ background: "var(--ink)" }}>
            <div className="text-sm font-bold font-display">How filtering works</div>
            <p className="mt-1 text-xs" style={{ color: "#B7BCC9" }}>Selecting a country and Government together shows only that country's government notices &mdash; e.g. Pakistan + Government. The department filter applies to government listings only.</p>
          </div>
        </div>

        <div className="lg:col-span-9">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-display font-semibold">{loading ? "Loading..." : `${jobs.length} jobs found`} {q && `for "${q}"`}</h1>
            <div className="text-xs" style={{ color: "var(--ink-faint)" }}>Sorted by newest</div>
          </div>

          <div className="mt-4 grid gap-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 animate-pulse card" />)
            ) : jobs.length === 0 ? (
              <div className="card p-12 text-center" style={{ borderStyle: "dashed" }}>
                <div className="font-display text-lg font-semibold">No jobs found matching your criteria</div>
                <div className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>Try different filters or keywords.</div>
                <button onClick={clearFilters} className="btn btn-primary mt-4">Clear filters</button>
              </div>
            ) : (
              jobs.map(job => <JobCard key={job.id} job={job} onSave={toggleSave} isSaved={saved.includes(job.id)} />)
            )}
          </div>

          <div className="mt-6 card p-4 text-center" style={{ borderColor: "var(--gold)", borderStyle: "dashed" }}>
            <div className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--gold)" }}>Ad zone &middot; in-between listings, country-targeted</div>
            <div className="text-[11px]" style={{ color: "var(--ink-soft)" }}>An advertiser targeting Pakistan appears only to Pakistan-based visitors here, once approved.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--paper)" }}>
      <Navbar />
      <Suspense fallback={<div className="p-10">Loading filters...</div>}>
        <JobsContent />
      </Suspense>
    </div>
  );
}

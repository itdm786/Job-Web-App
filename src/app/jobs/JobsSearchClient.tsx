"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search, MapPin, Briefcase, Building2, Filter, X, ChevronDown, Bookmark, CheckCircle2,
  Loader2, BookmarkCheck, SlidersHorizontal, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button, Card, Badge, Input, Select, EmptyState } from "@/components/ui";
import { formatSalary, timeAgo, cn } from "@/lib/utils";
import Link from "next/link";

interface FilterState {
  q: string;
  country: string;
  city: string;
  category: string;
  sector: string;
  workModes: string[];
  jobTypes: string[];
  experience: string;
  postedWithin: string;
  isGovernment: boolean;
  isRemote: boolean;
  sort: "relevance" | "newest" | "salary_desc" | "salary_asc";
  location: string;
}

interface JobResult {
  id: string;
  title: string;
  slug: string;
  jobSector: string;
  workModes: string[];
  jobTypeIds: string[];
  experienceLevel: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  isGovernmentJob: boolean;
  governmentVerified: boolean;
  featured: boolean;
  publishedAt: string;
  deadline: string;
  skills: string[];
  company: { id: string; name: string; logo: string; verificationLevel: string };
  category?: { name: string };
  country?: { name: string; flag: string };
  city?: { name: string };
}

export function JobsSearchClient({
  initialFilters,
  countries,
  categories,
  jobTypes,
  cities,
}: {
  initialFilters: FilterState;
  countries: any[];
  categories: any[];
  jobTypes: any[];
  cities: any[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [results, setResults] = useState<JobResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set("q", filters.q);
      if (filters.country) params.set("country", filters.country);
      if (filters.city) params.set("city", filters.city);
      if (filters.category) params.set("category", filters.category);
      if (filters.sector) params.set("sector", filters.sector);
      if (filters.workModes.length) params.set("workModes", filters.workModes.join(","));
      if (filters.jobTypes.length) params.set("jobTypes", filters.jobTypes.join(","));
      if (filters.experience) params.set("experience", filters.experience);
      if (filters.postedWithin) params.set("postedWithin", filters.postedWithin);
      if (filters.isGovernment) params.set("isGovernment", "true");
      if (filters.isRemote) params.set("isRemote", "true");
      if (filters.sort && filters.sort !== "relevance") params.set("sort", filters.sort);
      params.set("page", page.toString());
      params.set("pageSize", "20");

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.data.jobs);
        setTotal(data.data.total);
      }
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const toggleArrayFilter = (key: "workModes" | "jobTypes", value: string) => {
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      q: "", country: "", city: "", category: "", sector: "",
      workModes: [], jobTypes: [], experience: "", postedWithin: "",
      isGovernment: false, isRemote: false, sort: "relevance", location: "",
    });
    setPage(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const toggleSave = async (jobId: string) => {
    const newSet = new Set(savedJobs);
    if (newSet.has(jobId)) newSet.delete(jobId);
    else newSet.add(jobId);
    setSavedJobs(newSet);
    try {
      await fetch("/api/jobs/apply", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ jobId }),
      });
    } catch {}
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.country) count++;
    if (filters.city) count++;
    if (filters.category) count++;
    if (filters.sector) count++;
    if (filters.workModes.length) count++;
    if (filters.jobTypes.length) count++;
    if (filters.experience) count++;
    if (filters.postedWithin) count++;
    if (filters.isGovernment) count++;
    if (filters.isRemote) count++;
    return count;
  }, [filters]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      {/* Search header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={filters.q}
                onChange={(e) => updateFilter("q", e.target.value)}
                placeholder="Job title, skill, or keyword"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              />
            </div>
            <div className="hidden sm:block flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={filters.location}
                onChange={(e) => updateFilter("location", e.target.value)}
                placeholder="Country or city"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              />
            </div>
            <Button type="submit">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFiltersCount > 0 && (
                <span className="bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Filter sidebar */}
          <aside
            className={cn(
              "lg:block lg:w-72 shrink-0",
              showFilters ? "fixed inset-0 z-50 bg-white overflow-y-auto p-4" : "hidden"
            )}
          >
            <div className="sticky top-24 space-y-5">
              <div className="flex items-center justify-between lg:hidden mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <FilterSection title="Country">
                <Select value={filters.country} onChange={(e) => updateFilter("country", e.target.value)}>
                  <option value="">All countries</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </Select>
              </FilterSection>

              <FilterSection title="Job Sector">
                <div className="space-y-2">
                  {[
                    { value: "government", label: "Government" },
                    { value: "private", label: "Private" },
                    { value: "ngo", label: "NGO / Non-profit" },
                    { value: "public", label: "Public Sector" },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="sector"
                        checked={filters.sector === opt.value}
                        onChange={() => updateFilter("sector", filters.sector === opt.value ? "" : opt.value)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Work Mode">
                <div className="space-y-2">
                  {["remote", "hybrid", "onsite"].map((m) => (
                    <label key={m} className="flex items-center gap-2 text-sm cursor-pointer capitalize">
                      <input
                        type="checkbox"
                        checked={filters.workModes.includes(m)}
                        onChange={() => toggleArrayFilter("workModes", m)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      {m}
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Job Type">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {jobTypes.map((jt) => (
                    <label key={jt.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.jobTypes.includes(jt.slug)}
                        onChange={() => toggleArrayFilter("jobTypes", jt.slug)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      {jt.name}
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Category">
                <Select value={filters.category} onChange={(e) => updateFilter("category", e.target.value)}>
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </FilterSection>

              <FilterSection title="Experience Level">
                <Select value={filters.experience} onChange={(e) => updateFilter("experience", e.target.value)}>
                  <option value="">Any experience</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level (3-5 years)</option>
                  <option value="senior">Senior (5-10 years)</option>
                  <option value="lead">Lead / Principal</option>
                  <option value="executive">Executive</option>
                </Select>
              </FilterSection>

              <FilterSection title="Date Posted">
                <Select value={filters.postedWithin} onChange={(e) => updateFilter("postedWithin", e.target.value)}>
                  <option value="">Any time</option>
                  <option value="1">Last 24 hours</option>
                  <option value="3">Last 3 days</option>
                  <option value="7">Last 7 days</option>
                  <option value="14">Last 14 days</option>
                  <option value="30">Last 30 days</option>
                </Select>
              </FilterSection>

              {activeFiltersCount > 0 && (
                <Button variant="outline" className="w-full" onClick={clearFilters}>
                  Clear all filters
                </Button>
              )}

              <div className="lg:hidden">
                <Button className="w-full" onClick={() => setShowFilters(false)}>
                  Show {total} results
                </Button>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {loading ? "Searching..." : `${total.toLocaleString()} jobs found`}
                </h1>
                {filters.q && (
                  <p className="text-sm text-slate-600">
                    for "<span className="font-medium">{filters.q}</span>"
                    {filters.country && <> in <span className="font-medium">{filters.country}</span></>}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-600">Sort by:</label>
                <Select
                  value={filters.sort}
                  onChange={(e) => updateFilter("sort", e.target.value)}
                  className="w-auto"
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest first</option>
                  <option value="salary_desc">Salary: High to Low</option>
                  <option value="salary_asc">Salary: Low to High</option>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-40 bg-white rounded-xl animate-pulse" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No jobs found"
                description="Try adjusting your filters or search terms"
                action={
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {results.map((job) => (
                  <JobResultCard
                    key={job.id}
                    job={job}
                    saved={savedJobs.has(job.id)}
                    onSave={() => toggleSave(job.id)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm text-slate-600 px-3">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function JobResultCard({ job, saved, onSave }: { job: JobResult; saved: boolean; onSave: () => void }) {
  const location = [job.city?.name, job.country?.name].filter(Boolean).join(", ");
  return (
    <Card className="p-5 card-hover">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-2xl shrink-0">
          {job.company?.logo || "🏢"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <Link href={`/jobs/${job.slug}`} className="group">
                <h3 className="font-semibold text-lg text-slate-900 group-hover:text-emerald-700 line-clamp-1">
                  {job.title}
                </h3>
              </Link>
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Link href={job.company?.id ? `/companies/${job.company.id}` : "#"} className="hover:text-emerald-700">
                  {job.company?.name}
                </Link>
                {job.company?.verificationLevel === "verified" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
              </div>
            </div>
            <button
              onClick={onSave}
              className={cn(
                "p-2 rounded-lg hover:bg-slate-100 shrink-0",
                saved ? "text-emerald-600" : "text-slate-400"
              )}
              aria-label={saved ? "Unsave job" : "Save job"}
            >
              {saved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {job.isGovernmentJob && <Badge variant="government">✓ Verified Government</Badge>}
            {job.featured && <Badge variant="warning">Featured</Badge>}
            {job.workModes?.map((m) => (
              <Badge key={m} variant="default">
                {m}
              </Badge>
            ))}
            {job.category?.name && <Badge variant="info">{job.category.name}</Badge>}
          </div>

          <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600 mb-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{location || "Global"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
            </div>
          </div>

          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {job.skills.slice(0, 5).map((s) => (
                <span key={s} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                  {s}
                </span>
              ))}
              {job.skills.length > 5 && (
                <span className="text-xs px-2 py-0.5 text-slate-500">+{job.skills.length - 5} more</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">{timeAgo(job.publishedAt)}</span>
            <div className="flex items-center gap-2">
              <Link href={`/jobs/${job.slug}`}>
                <Button size="sm">
                  Apply Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

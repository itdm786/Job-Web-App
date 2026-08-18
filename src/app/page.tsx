import Link from "next/link";
import {
  Search,
  MapPin,
  Briefcase,
  ArrowRight,
  Shield,
  Building2,
  Globe2,
  TrendingUp,
  Users,
  CheckCircle2,
} from "lucide-react";
import { db } from "@/db";
import { jobs, companies, categories, countries, cities, jobTypes } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Button, Card, Badge } from "@/components/ui";
import { HeroSearch } from "@/components/home/HeroSearch";
import { formatSalary, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Featured jobs
  const featuredJobs = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      slug: jobs.slug,
      salaryMin: jobs.salaryMin,
      salaryMax: jobs.salaryMax,
      salaryCurrency: jobs.salaryCurrency,
      jobSector: jobs.jobSector,
      workModes: jobs.workModes,
      isGovernmentJob: jobs.isGovernmentJob,
      featured: jobs.featured,
      publishedAt: jobs.publishedAt,
      company: { name: companies.name, logo: companies.logo, verificationLevel: companies.verificationLevel },
      category: { name: categories.name },
      country: { name: countries.name, flag: countries.flag },
      city: { name: cities.name },
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .leftJoin(categories, eq(jobs.categoryId, categories.id))
    .leftJoin(countries, eq(jobs.countryId, countries.id))
    .leftJoin(cities, eq(jobs.cityId, cities.id))
    .where(and(eq(jobs.status, "published"), eq(jobs.featured, true)))
    .orderBy(desc(jobs.publishedAt))
    .limit(6);

  // Categories
  const cats = await db.select().from(categories).where(eq(categories.active, true)).limit(12);

  // Countries
  const countryList = await db.select().from(countries).where(eq(countries.active, true));

  // Stats
  const [jobStats] = await db
    .select({ count: jobs.id })
    .from(jobs)
    .where(eq(jobs.status, "published"));
  const [companyStats] = await db.select({ count: companies.id }).from(companies);
  const [countryStats] = await db.select({ count: countries.id }).from(countries);

  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-slate-200 rounded-full px-4 py-1.5 mb-6 shadow-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-slow"></span>
              <span className="text-xs font-medium text-slate-700">
                {jobStats?.count || 0}+ active jobs across {countryStats?.count || 0} countries
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
              Find Your Next <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Opportunity</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Discover millions of jobs across 190+ countries. From verified government positions to remote roles at the world's top companies.
            </p>

            <HeroSearch />

            {/* Popular searches */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-medium text-slate-500">Popular:</span>
              {["Government Jobs", "Remote", "Software Engineer", "Marketing", "Healthcare", "Banking"].map((tag) => (
                <Link
                  key={tag}
                  href={`/jobs?q=${encodeURIComponent(tag)}`}
                  className="text-xs px-3 py-1 rounded-full bg-white/80 hover:bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-200"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative floating cards */}
        <div className="hidden lg:block absolute top-1/2 left-8 -translate-y-1/2 animate-pulse-slow">
          <FloatingCard icon="🚀" text="Remote Developer" company="Global Tech" />
        </div>
        <div className="hidden lg:block absolute top-1/3 right-8 animate-pulse-slow" style={{ animationDelay: "1s" }}>
          <FloatingCard icon="🏛️" text="Government Officer" company="Federal Gov" />
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Stat icon={Briefcase} value={`${jobStats?.count || 0}+`} label="Active Jobs" />
            <Stat icon={Building2} value={`${companyStats?.count || 0}+`} label="Companies" />
            <Stat icon={Globe2} value={`${countryStats?.count || 0}+`} label="Countries" />
            <Stat icon={Users} value="2M+" label="Job Seekers" />
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Featured Opportunities</h2>
              <p className="mt-2 text-slate-600">Hand-picked roles from top employers worldwide</p>
            </div>
            <Link href="/jobs" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          <div className="sm:hidden mt-6 text-center">
            <Link href="/jobs">
              <Button variant="outline">View all jobs</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Explore by Category</h2>
            <p className="mt-2 text-slate-600">Find jobs across every industry</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {cats.map((cat) => (
              <Link
                key={cat.id}
                href={`/jobs?category=${cat.slug}`}
                className="group p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all"
              >
                <div className="text-3xl mb-2">{cat.icon || "💼"}</div>
                <div className="text-sm font-medium text-slate-900 group-hover:text-emerald-700">
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Countries */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Jobs Around the World</h2>
            <p className="mt-2 text-slate-600">Opportunities in every major market</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {countryList.map((c) => (
              <Link
                key={c.id}
                href={`/jobs?country=${encodeURIComponent(c.name)}`}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md"
              >
                <span className="text-3xl">{c.flag}</span>
                <div>
                  <div className="font-medium text-slate-900 text-sm">{c.name}</div>
                  <div className="text-xs text-slate-500">Browse jobs</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why Choose GlobalHire</h2>
            <p className="mt-2 text-slate-300">Built for modern job seekers and employers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Feature icon={Shield} title="Verified Jobs" desc="Every government job is verified. Every employer is reviewed. Say goodbye to scams." />
            <Feature icon={Globe2} title="Truly Global" desc="Jobs from 190+ countries with localized filtering, currencies, and languages." />
            <Feature icon={TrendingUp} title="Smart Matching" desc="AI-powered recommendations based on your skills, preferences, and career goals." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-emerald-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to hire top talent?</h2>
          <p className="text-lg text-slate-600 mb-8">
            Post your job and reach millions of qualified candidates worldwide.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/employer/post">
              <Button size="lg">Post a Job <ArrowRight className="w-4 h-4" /></Button>
            </Link>
            <Link href="/employers">
              <Button variant="outline" size="lg">Learn more</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function JobCard({ job }: { job: any }) {
  const location = [job.city?.name, job.country?.name].filter(Boolean).join(", ");
  return (
    <Link href={`/jobs/${job.slug}`}>
      <Card className="p-5 h-full card-hover">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-xl shrink-0">
            {job.company?.logo || "🏢"}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 line-clamp-1">{job.title}</h3>
            <div className="text-sm text-slate-600 flex items-center gap-1">
              {job.company?.name}
              {job.company?.verificationLevel === "verified" && (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.isGovernmentJob && <Badge variant="government">Government</Badge>}
          {job.featured && <Badge variant="warning">Featured</Badge>}
          {job.workModes?.slice(0, 2).map((m: string) => (
            <Badge key={m} variant="default">
              {m}
            </Badge>
          ))}
        </div>
        <div className="space-y-1.5 text-sm text-slate-600 mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{location || "Global"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
          </div>
        </div>
        <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>{job.category?.name}</span>
          <span>{timeAgo(job.publishedAt)}</span>
        </div>
      </Card>
    </Link>
  );
}

function Stat({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 items-center justify-center mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-600">{label}</div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700">
      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-300 leading-relaxed">{desc}</p>
    </div>
  );
}

function FloatingCard({ icon, text, company }: { icon: string; text: string; company: string }) {
  return (
    <div className="bg-white rounded-xl shadow-xl p-3 w-56 border border-slate-200">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-xl">{icon}</div>
        <div>
          <div className="text-sm font-medium text-slate-900">{text}</div>
          <div className="text-xs text-slate-500">{company}</div>
        </div>
      </div>
    </div>
  );
}

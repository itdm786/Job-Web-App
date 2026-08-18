import Link from "next/link";
import { Building2, CheckCircle2, Briefcase } from "lucide-react";
import { db } from "@/db";
import { companies, jobs, countries, cities } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { Card, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [company] = await db
    .select({
      id: companies.id,
      name: companies.name,
      slug: companies.slug,
      logo: companies.logo,
      website: companies.website,
      description: companies.description,
      industry: companies.industry,
      size: companies.size,
      foundedYear: companies.foundedYear,
      verificationStatus: companies.verificationStatus,
      verificationLevel: companies.verificationLevel,
      linkedinUrl: companies.linkedinUrl,
      country: { name: countries.name, flag: countries.flag },
      city: { name: cities.name },
    })
    .from(companies)
    .leftJoin(countries, eq(companies.countryId, countries.id))
    .leftJoin(cities, eq(companies.cityId, cities.id))
    .where(eq(companies.id, id))
    .limit(1);

  if (!company) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Company not found</h1>
      </div>
    );
  }

  const companyJobs = await db
    .select()
    .from(jobs)
    .where(eq(jobs.companyId, company.id))
    .orderBy(desc(jobs.publishedAt))
    .limit(20);

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-4xl shrink-0">
              {company.logo || "🏢"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-3xl font-bold text-slate-900">{company.name}</h1>
                {company.verificationLevel === "verified" && (
                  <Badge variant="verified">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Employer
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                {company.industry && <span>{company.industry}</span>}
                {company.size && <span>{company.size} employees</span>}
                {company.foundedYear && <span>Founded {company.foundedYear}</span>}
                {company.country && (
                  <span>
                    {company.country.flag} {[company.city?.name, company.country.name].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
            </div>
          </div>
          {company.description && (
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{company.description}</p>
          )}
          {company.website && (
            <a href={company.website} target="_blank" rel="noopener" className="inline-block mt-4 text-emerald-700 hover:underline">
              Visit website →
            </a>
          )}
        </Card>

        <h2 className="text-2xl font-bold text-slate-900 mb-4">Open Positions ({companyJobs.length})</h2>
        <div className="space-y-3">
          {companyJobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.slug}`}>
              <Card className="p-5 card-hover">
                <h3 className="font-semibold text-slate-900 mb-1">{job.title}</h3>
                <div className="text-sm text-slate-600 flex flex-wrap gap-2">
                  {job.workModes?.map((m) => (
                    <Badge key={m} variant="default">{m}</Badge>
                  ))}
                  {job.isGovernmentJob && <Badge variant="government">Government</Badge>}
                </div>
              </Card>
            </Link>
          ))}
          {companyJobs.length === 0 && (
            <Card className="p-8 text-center text-slate-600">No open positions at this time</Card>
          )}
        </div>
      </div>
    </div>
  );
}

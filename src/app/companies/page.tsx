import Link from "next/link";
import { Search, MapPin, Building2, CheckCircle2, Users } from "lucide-react";
import { db } from "@/db";
import { companies, jobs, countries, cities } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { Card, Badge, Input } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = sp.q || "";

  const companyList = await db
    .select({
      id: companies.id,
      name: companies.name,
      slug: companies.slug,
      logo: companies.logo,
      description: companies.description,
      industry: companies.industry,
      size: companies.size,
      website: companies.website,
      verificationStatus: companies.verificationStatus,
      verificationLevel: companies.verificationLevel,
      country: { name: countries.name, flag: countries.flag },
      city: { name: cities.name },
      jobCount: sql<number>`(select count(*)::int from jobs where company_id = ${companies.id} and status = 'published')`,
    })
    .from(companies)
    .leftJoin(countries, eq(companies.countryId, countries.id))
    .leftJoin(cities, eq(companies.cityId, cities.id))
    .where(eq(companies.active, true))
    .orderBy(desc(companies.createdAt))
    .limit(50);

  const filtered = q
    ? companyList.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.industry?.toLowerCase().includes(q.toLowerCase()))
    : companyList;

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Companies</h1>
          <p className="text-slate-600 mt-1">Discover top employers hiring right now</p>
        </div>

        <form className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search companies..."
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
            />
          </div>
        </form>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Link key={c.id} href={`/companies/${c.id}`}>
              <Card className="p-5 h-full card-hover">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-2xl shrink-0">
                    {c.logo || "🏢"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 line-clamp-1 flex items-center gap-1">
                      {c.name}
                      {c.verificationLevel === "verified" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </h3>
                    <div className="text-xs text-slate-500">{c.industry}</div>
                  </div>
                </div>
                {c.description && (
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">{c.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {c.country?.flag} {[c.city?.name, c.country?.name].filter(Boolean).join(", ")}
                  </span>
                  <span className="font-medium text-emerald-700">{c.jobCount} jobs</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

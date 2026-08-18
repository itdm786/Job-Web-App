import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Briefcase, Building2, Clock, CheckCircle2, Shield, DollarSign,
  Users, Calendar, ArrowLeft, Bookmark, Share2, Flag, ExternalLink, Mail, Phone,
} from "lucide-react";
import { db } from "@/db";
import { jobs, companies, categories, countries, cities, states, jobSkills, skills } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Button, Card, Badge, Alert } from "@/components/ui";
import { formatSalary, timeAgo } from "@/lib/utils";
import { ApplyButton } from "./ApplyButton";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: "Job Not Found" };
  return {
    title: `${job.title} at ${job.company?.name || "Company"}`,
    description: job.description?.slice(0, 160) || `Apply for ${job.title} at ${job.company?.name}`,
    openGraph: {
      title: `${job.title} at ${job.company?.name}`,
      description: job.description?.slice(0, 160),
      type: "website",
    },
  };
}

async function getJobBySlug(slug: string) {
  const [job] = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      slug: jobs.slug,
      jobSector: jobs.jobSector,
      workModes: jobs.workModes,
      jobTypeIds: jobs.jobTypeIds,
      experienceLevel: jobs.experienceLevel,
      educationLevel: jobs.educationLevel,
      vacancies: jobs.vacancies,
      salaryMin: jobs.salaryMin,
      salaryMax: jobs.salaryMax,
      salaryCurrency: jobs.salaryCurrency,
      salaryType: jobs.salaryType,
      description: jobs.description,
      responsibilities: jobs.responsibilities,
      requirements: jobs.requirements,
      qualifications: jobs.qualifications,
      benefits: jobs.benefits,
      applicationMethod: jobs.applicationMethod,
      applicationUrl: jobs.applicationUrl,
      applicationEmail: jobs.applicationEmail,
      contactPhone: jobs.contactPhone,
      isGovernmentJob: jobs.isGovernmentJob,
      governmentVerified: jobs.governmentVerified,
      ministry: jobs.ministry,
      department: jobs.department,
      officialWebsite: jobs.officialWebsite,
      status: jobs.status,
      publishedAt: jobs.publishedAt,
      deadline: jobs.deadline,
      featured: jobs.featured,
      views: jobs.views,
      applications: jobs.applications,
      createdAt: jobs.createdAt,
      company: {
        id: companies.id,
        name: companies.name,
        slug: companies.slug,
        logo: companies.logo,
        website: companies.website,
        description: companies.description,
        verificationLevel: companies.verificationLevel,
      },
      category: { id: categories.id, name: categories.name, slug: categories.slug },
      country: { id: countries.id, name: countries.name, flag: countries.flag },
      state: { id: states.id, name: states.name },
      city: { id: cities.id, name: cities.name },
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .leftJoin(categories, eq(jobs.categoryId, categories.id))
    .leftJoin(countries, eq(jobs.countryId, countries.id))
    .leftJoin(states, eq(jobs.stateId, states.id))
    .leftJoin(cities, eq(jobs.cityId, cities.id))
    .where(eq(jobs.slug, slug))
    .limit(1);

  if (!job) return null;

  const skillsData = await db
    .select({ skillName: skills.name, skillId: skills.id })
    .from(jobSkills)
    .innerJoin(skills, eq(jobSkills.skillId, skills.id))
    .where(eq(jobSkills.jobId, job.id));

  return { ...job, skills: skillsData.map((s) => s.skillName) };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job || job.status !== "published") notFound();

  const location = [job.city?.name, job.state?.name, job.country?.name].filter(Boolean).join(", ");

  // JSON-LD for JobPosting
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.publishedAt,
    validThrough: job.deadline,
    employmentType: job.jobTypeIds?.map(() => "FULL_TIME"),
    hiringOrganization: {
      "@type": "Organization",
      name: job.company?.name,
      sameAs: job.company?.website,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city?.name,
        addressRegion: job.state?.name,
        addressCountry: job.country?.name,
      },
    },
    baseSalary: job.salaryMin && job.salaryMax
      ? {
          "@type": "MonetaryAmount",
          currency: job.salaryCurrency,
          value: {
            "@type": "QuantitativeValue",
            minValue: Number(job.salaryMin),
            maxValue: Number(job.salaryMax),
            unitText: job.salaryType?.toUpperCase() || "MONTH",
          },
        }
      : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-slate-50 min-h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-600 mb-6">
            <Link href="/jobs" className="flex items-center gap-1 hover:text-emerald-700">
              <ArrowLeft className="w-4 h-4" />
              Back to Jobs
            </Link>
            <span className="text-slate-400">/</span>
            {job.country && (
              <>
                <Link href={`/jobs?country=${encodeURIComponent(job.country.name)}`} className="hover:text-emerald-700">
                  {job.country.name}
                </Link>
                <span className="text-slate-400">/</span>
              </>
            )}
            {job.category && (
              <Link href={`/jobs?category=${job.category.slug}`} className="hover:text-emerald-700">
                {job.category.name}
              </Link>
            )}
          </nav>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header card */}
              <Card className="p-6 lg:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-3xl shrink-0">
                    {job.company?.logo || "🏢"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{job.title}</h1>
                    <div className="flex items-center gap-2 text-slate-600 flex-wrap">
                      <Link href={`/companies/${job.company?.id}`} className="font-medium hover:text-emerald-700">
                        {job.company?.name}
                      </Link>
                      {job.company?.verificationLevel === "verified" && (
                        <span className="flex items-center gap-0.5 text-xs text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {job.isGovernmentJob && (
                    <Badge variant="government">
                      <Shield className="w-3 h-3" />
                      Verified Government Job
                    </Badge>
                  )}
                  {job.featured && <Badge variant="warning">⭐ Featured</Badge>}
                  {job.workModes?.map((m) => (
                    <Badge key={m} variant="default">
                      {m}
                    </Badge>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <InfoItem icon={MapPin} label="Location" value={location || "Remote"} />
                  <InfoItem icon={DollarSign} label="Salary" value={formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)} />
                  <InfoItem icon={Briefcase} label="Experience" value={job.experienceLevel || "Not specified"} />
                  <InfoItem icon={Clock} label="Posted" value={timeAgo(job.publishedAt)} />
                  <InfoItem icon={Calendar} label="Deadline" value={job.deadline ? new Date(job.deadline).toLocaleDateString() : "Open"} />
                  <InfoItem icon={Users} label="Vacancies" value={job.vacancies?.toString() || "1"} />
                </div>

                {job.isGovernmentJob && (
                  <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Government Job Details
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm text-indigo-900">
                      {job.ministry && <div><span className="font-medium">Ministry:</span> {job.ministry}</div>}
                      {job.department && <div><span className="font-medium">Department:</span> {job.department}</div>}
                      {job.officialWebsite && (
                        <div className="sm:col-span-2">
                          <span className="font-medium">Official Website:</span>{" "}
                          <a href={job.officialWebsite} target="_blank" rel="noopener" className="text-indigo-700 hover:underline">
                            {job.officialWebsite}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>

              {/* Description */}
              {job.description && (
                <Card className="p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Job Description</h2>
                  <div className="rich-content text-slate-700 whitespace-pre-wrap">{job.description}</div>
                </Card>
              )}

              {job.responsibilities && (
                <Card className="p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Responsibilities</h2>
                  <div className="rich-content text-slate-700 whitespace-pre-wrap">{job.responsibilities}</div>
                </Card>
              )}

              {job.requirements && (
                <Card className="p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Requirements</h2>
                  <div className="rich-content text-slate-700 whitespace-pre-wrap">{job.requirements}</div>
                </Card>
              )}

              {job.qualifications && (
                <Card className="p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Qualifications</h2>
                  <div className="rich-content text-slate-700 whitespace-pre-wrap">{job.qualifications}</div>
                </Card>
              )}

              {job.skills.length > 0 && (
                <Card className="p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((s) => (
                      <Link
                        key={s}
                        href={`/jobs?q=${encodeURIComponent(s)}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-700 rounded-lg text-sm font-medium"
                      >
                        {s}
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {job.benefits && (
                <Card className="p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Benefits</h2>
                  <div className="rich-content text-slate-700 whitespace-pre-wrap">{job.benefits}</div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="p-5 sticky top-24">
                <ApplyButton jobId={job.id} applicationUrl={job.applicationUrl} applicationMethod={job.applicationMethod || "internal"} />
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" className="flex-1">
                    <Bookmark className="w-4 h-4" />
                    Save
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
                <button className="w-full mt-2 text-sm text-slate-500 hover:text-red-600 flex items-center justify-center gap-1">
                  <Flag className="w-3.5 h-3.5" />
                  Report this job
                </button>
              </Card>

              {/* Company card */}
              <Card className="p-5">
                <h3 className="font-semibold text-slate-900 mb-3">About the Company</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-xl">
                    {job.company?.logo || "🏢"}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{job.company?.name}</div>
                    {job.company?.verificationLevel === "verified" && (
                      <Badge variant="verified">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Employer
                      </Badge>
                    )}
                  </div>
                </div>
                {job.company?.description && (
                  <p className="text-sm text-slate-600 line-clamp-4 mb-3">{job.company.description}</p>
                )}
                <Link href={job.company?.id ? `/companies/${job.company.id}` : "#"} className="text-sm font-medium text-emerald-700 hover:underline">
                  View company profile →
                </Link>
              </Card>

              {job.applicationEmail && (
                <Card className="p-5">
                  <h3 className="font-semibold text-slate-900 mb-3">Contact</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${job.applicationEmail}`} className="hover:text-emerald-700">
                        {job.applicationEmail}
                      </a>
                    </div>
                    {job.contactPhone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4" />
                        {job.contactPhone}
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
      <Icon className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="font-medium text-slate-900 text-sm">{value}</div>
      </div>
    </div>
  );
}

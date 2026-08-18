import { db } from "@/db";
import {
  jobs,
  companies,
  categories,
  countries,
  cities,
  states,
  jobSkills,
  skills,
  governmentOrganizations,
} from "@/db/schema";
import { eq, and, or, like, inArray, sql, ilike, gte, desc, asc } from "drizzle-orm";

export interface JobFilters {
  q?: string;
  countryId?: string;
  stateId?: string;
  cityId?: string;
  categoryId?: string;
  sector?: string; // government, private, ngo
  jobTypeIds?: string[];
  workModes?: string[]; // remote, hybrid, onsite
  experience?: string;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  postedWithin?: number; // days
  companyId?: string;
  governmentOrgId?: string;
  isGovernment?: boolean;
  isRemote?: boolean;
  sort?: "relevance" | "newest" | "salary_desc" | "salary_asc";
  page?: number;
  pageSize?: number;
}

export async function searchJobs(filters: JobFilters) {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const offset = (page - 1) * pageSize;

  const conditions = [eq(jobs.status, "published"), eq(jobs.active, true)];

  if (filters.q) {
    const q = `%${filters.q}%`;
    conditions.push(
      or(
        ilike(jobs.title, q),
        ilike(jobs.description, q)
      )!
    );
  }
  if (filters.countryId) conditions.push(eq(jobs.countryId, filters.countryId));
  if (filters.stateId) conditions.push(eq(jobs.stateId, filters.stateId));
  if (filters.cityId) conditions.push(eq(jobs.cityId, filters.cityId));
  if (filters.categoryId) conditions.push(eq(jobs.categoryId, filters.categoryId));
  if (filters.sector) conditions.push(eq(jobs.jobSector, filters.sector));
  if (filters.isGovernment) conditions.push(eq(jobs.isGovernmentJob, true));
  if (filters.isRemote) {
    conditions.push(sql`${jobs.workModes}::jsonb @> '["remote"]'::jsonb`);
  }
  if (filters.companyId) conditions.push(eq(jobs.companyId, filters.companyId));
  if (filters.governmentOrgId)
    conditions.push(eq(jobs.governmentOrgId, filters.governmentOrgId));
  if (filters.experience) conditions.push(eq(jobs.experienceLevel, filters.experience));
  if (filters.minSalary) conditions.push(gte(jobs.salaryMax, filters.minSalary.toString()));
  if (filters.maxSalary) conditions.push(sql`${jobs.salaryMin}::numeric <= ${filters.maxSalary}`);
  if (filters.currency) conditions.push(eq(jobs.salaryCurrency, filters.currency));
  if (filters.postedWithin) {
    const since = new Date();
    since.setDate(since.getDate() - filters.postedWithin);
    conditions.push(sql`${jobs.publishedAt} >= ${since.toISOString()}`);
  }
  if (filters.jobTypeIds && filters.jobTypeIds.length > 0) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM jsonb_array_elements_text(${jobs.jobTypeIds}) AS jt WHERE jt = ANY(${filters.jobTypeIds}))`
    );
  }
  if (filters.workModes && filters.workModes.length > 0) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM jsonb_array_elements_text(${jobs.workModes}) AS wm WHERE wm = ANY(${filters.workModes}))`
    );
  }

  // Order
  let orderBy;
  switch (filters.sort) {
    case "salary_desc":
      orderBy = [desc(sql`COALESCE(${jobs.salaryMax}::numeric, 0)`), desc(jobs.publishedAt)];
      break;
    case "salary_asc":
      orderBy = [asc(sql`COALESCE(${jobs.salaryMin}::numeric, 999999999)`), desc(jobs.publishedAt)];
      break;
    case "newest":
      orderBy = [desc(jobs.publishedAt)];
      break;
    default:
      // Relevance: featured first, then newest
      orderBy = [desc(jobs.featured), desc(jobs.publishedAt)];
  }

  const whereClause = and(...conditions);

  // Count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(jobs)
    .where(whereClause);

  // Data
  const results = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      slug: jobs.slug,
      jobSector: jobs.jobSector,
      workModes: jobs.workModes,
      jobTypeIds: jobs.jobTypeIds,
      experienceLevel: jobs.experienceLevel,
      salaryMin: jobs.salaryMin,
      salaryMax: jobs.salaryMax,
      salaryCurrency: jobs.salaryCurrency,
      isGovernmentJob: jobs.isGovernmentJob,
      governmentVerified: jobs.governmentVerified,
      featured: jobs.featured,
      views: jobs.views,
      applications: jobs.applications,
      publishedAt: jobs.publishedAt,
      deadline: jobs.deadline,
      company: {
        id: companies.id,
        name: companies.name,
        slug: companies.slug,
        logo: companies.logo,
        verificationLevel: companies.verificationLevel,
      },
      category: { id: categories.id, name: categories.name, slug: categories.slug },
      country: { id: countries.id, name: countries.name, code: countries.code, flag: countries.flag },
      city: { id: cities.id, name: cities.name },
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .leftJoin(categories, eq(jobs.categoryId, categories.id))
    .leftJoin(countries, eq(jobs.countryId, countries.id))
    .leftJoin(cities, eq(jobs.cityId, cities.id))
    .where(whereClause)
    .orderBy(...orderBy)
    .limit(pageSize)
    .offset(offset);

  // Get skills for each job
  if (results.length > 0) {
    const jobIds = results.map((r) => r.id);
    const skillsData = await db
      .select({
        jobId: jobSkills.jobId,
        skillName: skills.name,
      })
      .from(jobSkills)
      .innerJoin(skills, eq(jobSkills.skillId, skills.id))
      .where(inArray(jobSkills.jobId, jobIds));

    const skillsByJob: Record<string, string[]> = {};
    for (const s of skillsData) {
      if (!skillsByJob[s.jobId]) skillsByJob[s.jobId] = [];
      skillsByJob[s.jobId].push(s.skillName);
    }

    for (const r of results) {
      (r as any).skills = skillsByJob[r.id] || [];
    }
  }

  return {
    jobs: results,
    total: count,
    page,
    pageSize,
    totalPages: Math.ceil(count / pageSize),
  };
}

export async function getJobBySlug(slug: string) {
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
      expiresAt: jobs.expiresAt,
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
      country: { id: countries.id, name: countries.name, code: countries.code, flag: countries.flag },
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

  // Get skills
  const skillsData = await db
    .select({ skillName: skills.name })
    .from(jobSkills)
    .innerJoin(skills, eq(jobSkills.skillId, skills.id))
    .where(eq(jobSkills.jobId, job.id));

  (job as any).skills = skillsData.map((s) => s.skillName);

  return job;
}

export async function getSearchSuggestions(q: string) {
  if (!q || q.length < 2) return [];
  const pattern = `%${q.toLowerCase()}%`;
  const limit = 8;

  // Countries
  const countryResults = await db
    .select({ name: countries.name })
    .from(countries)
    .where(ilike(countries.name, pattern))
    .limit(limit);

  // Cities
  const cityResults = await db
    .select({ name: cities.name, countryName: countries.name })
    .from(cities)
    .innerJoin(states, eq(cities.stateId, states.id))
    .innerJoin(countries, eq(states.countryId, countries.id))
    .where(ilike(cities.name, pattern))
    .limit(limit);

  // Categories
  const categoryResults = await db
    .select({ name: categories.name, slug: categories.slug })
    .from(categories)
    .where(ilike(categories.name, pattern))
    .limit(limit);

  // Skills
  const skillResults = await db
    .select({ name: skills.name })
    .from(skills)
    .where(ilike(skills.name, pattern))
    .limit(limit);

  // Companies
  const companyResults = await db
    .select({ name: companies.name })
    .from(companies)
    .where(ilike(companies.name, pattern))
    .limit(limit);

  // Job titles (distinct)
  const titleResults = await db
    .select({ title: jobs.title })
    .from(jobs)
    .where(and(ilike(jobs.title, pattern), eq(jobs.status, "published")))
    .limit(limit);

  const suggestions: Array<{ label: string; type: string; href?: string }> = [];

  for (const c of countryResults) {
    suggestions.push({ label: `${c.name} Jobs`, type: "country", href: `/jobs?country=${c.name}` });
  }
  for (const c of cityResults) {
    suggestions.push({
      label: `Jobs in ${c.name}, ${c.countryName}`,
      type: "city",
      href: `/jobs?city=${c.name}`,
    });
  }
  for (const c of categoryResults) {
    suggestions.push({ label: `${c.name} Jobs`, type: "category", href: `/jobs?category=${c.slug}` });
  }
  for (const s of skillResults) {
    suggestions.push({ label: `${s.name}`, type: "skill", href: `/jobs?q=${s.name}` });
  }
  for (const c of companyResults) {
    suggestions.push({ label: `${c.name}`, type: "company", href: `/companies?q=${c.name}` });
  }
  for (const t of titleResults) {
    suggestions.push({ label: t.title, type: "job", href: `/jobs?q=${encodeURIComponent(t.title)}` });
  }

  // Deduplicate
  const seen = new Set<string>();
  return suggestions.filter((s) => {
    const key = s.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

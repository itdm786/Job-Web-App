import { NextRequest } from "next/server";
import { db } from "@/db";
import { jobs, companies, categories, countries, cities, states, jobSkills, skills } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { success, error, notFound, parseBody } from "@/lib/api";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { randomUUID } from "crypto";
import { z } from "zod";

export const dynamic = "force-dynamic";

// GET single job by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  if (!job) return notFound("Job not found");
  return success(job);
}

// POST create job (employer)
const createSchema = z.object({
  title: z.string().min(3).max(200),
  companyId: z.string(),
  categoryId: z.string().optional(),
  countryId: z.string().optional(),
  cityId: z.string().optional(),
  jobSector: z.string().default("private"),
  workModes: z.array(z.string()).default([]),
  jobTypeIds: z.array(z.string()).default([]),
  experienceLevel: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryCurrency: z.string().default("USD"),
  description: z.string().optional(),
  responsibilities: z.string().optional(),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  skillIds: z.array(z.string()).default([]),
  deadline: z.string().optional(),
  vacancies: z.number().optional(),
  isGovernmentJob: z.boolean().default(false),
  governmentOrgId: z.string().optional(),
  submit: z.boolean().default(false), // false = draft, true = submit for review
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);
  if (!hasPermission(user, "create_jobs") && !user.roles.includes("Employer")) {
    return error("Not authorized to create jobs", 403);
  }

  const body = await parseBody<z.infer<typeof createSchema>>(req);
  if (!body) return error("Invalid request");
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0]?.message || "Validation failed");

  const data = parsed.data;
  const id = randomUUID();
  const slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${id.slice(0, 8)}`;
  const status = data.submit ? "pending" : "draft";

  await db.insert(jobs).values({
    id,
    slug,
    title: data.title,
    companyId: data.companyId,
    categoryId: data.categoryId,
    countryId: data.countryId,
    cityId: data.cityId,
    jobSector: data.jobSector,
    workModes: data.workModes,
    jobTypeIds: data.jobTypeIds,
    experienceLevel: data.experienceLevel,
    salaryMin: data.salaryMin?.toString(),
    salaryMax: data.salaryMax?.toString(),
    salaryCurrency: data.salaryCurrency,
    salaryType: "monthly",
    description: data.description,
    responsibilities: data.responsibilities,
    requirements: data.requirements,
    benefits: data.benefits,
    deadline: data.deadline ? new Date(data.deadline) : undefined,
    vacancies: data.vacancies || 1,
    isGovernmentJob: data.isGovernmentJob,
    governmentOrgId: data.governmentOrgId,
    status,
    applicationMethod: "internal",
  });

  // Add skills
  for (const skillId of data.skillIds) {
    await db.insert(jobSkills).values({ jobId: id, skillId });
  }

  return success({ id, slug, status }, 201);
}

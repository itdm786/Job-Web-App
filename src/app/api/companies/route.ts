import { NextRequest } from "next/server";
import { db } from "@/db";
import { companies, companyUsers, countries, cities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { success, error, parseBody, unauthorized } from "@/lib/api";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { randomUUID } from "crypto";
import { z } from "zod";

export const dynamic = "force-dynamic";

// GET user's companies
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const userCompanies = await db
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
      address: companies.address,
      phone: companies.phone,
      email: companies.email,
      verificationStatus: companies.verificationStatus,
      verificationLevel: companies.verificationLevel,
      linkedinUrl: companies.linkedinUrl,
      twitterUrl: companies.twitterUrl,
      country: { name: countries.name, flag: countries.flag },
      city: { name: cities.name },
      role: companyUsers.role,
    })
    .from(companyUsers)
    .innerJoin(companies, eq(companyUsers.companyId, companies.id))
    .leftJoin(countries, eq(companies.countryId, countries.id))
    .leftJoin(cities, eq(companies.cityId, cities.id))
    .where(eq(companyUsers.userId, user.id));

  return success(userCompanies);
}

const createSchema = z.object({
  name: z.string().min(2).max(200),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  foundedYear: z.number().int().min(1800).max(2100).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  countryId: z.string().optional(),
  cityId: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  logo: z.string().optional(),
});

// POST create company
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (!hasRole(user, "Employer") && !user.roles.includes("Super Admin")) {
    return error("You must be an employer to create a company", 403);
  }

  const body = await parseBody<z.infer<typeof createSchema>>(req);
  if (!body) return error("Invalid request");

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0]?.message || "Validation failed");

  const data = parsed.data;
  const id = randomUUID();
  const slug = `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${id.slice(0, 6)}`;

  await db.insert(companies).values({
    id,
    slug,
    name: data.name,
    website: data.website || null,
    description: data.description || null,
    industry: data.industry || null,
    size: data.size || null,
    foundedYear: data.foundedYear || null,
    address: data.address || null,
    phone: data.phone || null,
    email: data.email || null,
    countryId: data.countryId || null,
    cityId: data.cityId || null,
    linkedinUrl: data.linkedinUrl || null,
    twitterUrl: data.twitterUrl || null,
    logo: data.logo || null,
    verificationStatus: "pending",
    verificationLevel: "unverified",
  });

  // Add user as admin of the company
  await db.insert(companyUsers).values({
    companyId: id,
    userId: user.id,
    role: "admin",
  });

  return success({ id, slug, message: "Company created. Pending verification." }, 201);
}

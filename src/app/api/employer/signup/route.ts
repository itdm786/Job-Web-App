import { NextRequest } from "next/server";
import { db } from "@/db";
import { users, userRoles, roles, profiles, companies, companyUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, setSession } from "@/lib/auth";
import { success, error, parseBody } from "@/lib/api";
import { z } from "zod";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const schema = z.object({
  // Personal info (admin of the company)
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  designation: z.string().min(2).max(150),

  // Company info
  companyName: z.string().min(2).max(200),
  companyEmail: z.string().email().optional().or(z.literal("")),
  companyWebsite: z.string().url().optional().or(z.literal("")),
  companyPhone: z.string().optional(),
  companyAddress: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  foundedYear: z.number().int().optional(),
  countryId: z.string().optional(),
  cityId: z.string().optional(),
  companyDescription: z.string().optional(),
  companyLogo: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const body = await parseBody<z.infer<typeof schema>>(req);
  if (!body) return error("Invalid request");

  const parsed = schema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0]?.message || "Validation failed");

  const data = parsed.data;
  const email = data.email.toLowerCase();

  // Check existing user
  const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser) return error("This email is already registered. Please login.", 409);

  // Generate unique slug for company
  const companyId = randomUUID();
  const companySlug = `${data.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${companyId.slice(0, 6)}`;

  // Create company
  await db.insert(companies).values({
    id: companyId,
    slug: companySlug,
    name: data.companyName,
    email: data.companyEmail || email,
    website: data.companyWebsite || null,
    phone: data.companyPhone || null,
    address: data.companyAddress || null,
    industry: data.industry || null,
    size: data.size || null,
    foundedYear: data.foundedYear || null,
    countryId: data.countryId || null,
    cityId: data.cityId || null,
    description: data.companyDescription || null,
    logo: data.companyLogo || null,
    linkedinUrl: data.linkedinUrl || null,
    verificationStatus: "pending",
    verificationLevel: "unverified",
  });

  // Create user
  const userId = randomUUID();
  const passwordHash = await hashPassword(data.password);
  await db.insert(users).values({
    id: userId,
    email,
    name: data.name,
    passwordHash,
    emailVerified: false,
    active: true,
  });

  // Create profile
  await db.insert(profiles).values({
    id: randomUUID(),
    userId,
    headline: data.designation,
    phone: data.phone || null,
  });

  // Assign Employer role
  const [role] = await db.select().from(roles).where(eq(roles.name, "Employer")).limit(1);
  if (role) {
    await db.insert(userRoles).values({ userId, roleId: role.id });
  }

  // Link user to company as admin with designation
  await db.insert(companyUsers).values({
    companyId,
    userId,
    role: "admin",
    designation: data.designation,
    phone: data.phone || null,
    isPrimaryContact: true,
  });

  await setSession(userId);

  return success({
    message: "Company account created successfully",
    companyId,
    companySlug,
    userId,
  }, 201);
}

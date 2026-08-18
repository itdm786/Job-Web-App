import { NextRequest } from "next/server";
import { db } from "@/db";
import { profiles, users, userSkills, skills, experiences, education as educationTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { success, error, parseBody, unauthorized } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

// GET current user's profile
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
  if (!profile) return success({ user, profile: null, skills: [], experiences: [], education: [] });

  const userSkillsData = await db
    .select({ id: skills.id, name: skills.name })
    .from(userSkills)
    .innerJoin(skills, eq(userSkills.skillId, skills.id))
    .where(eq(userSkills.userId, user.id));

  const exps = await db.select().from(experiences).where(eq(experiences.userId, user.id));
  const edu = await db.select().from(educationTable).where(eq(educationTable.userId, user.id));

  return success({
    user,
    profile,
    skills: userSkillsData,
    experiences: exps,
    education: edu,
  });
}

// PUT update profile
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await parseBody<any>(req);
  if (!body) return error("Invalid request");

  const [existing] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);

  const profileData: any = {
    headline: body.headline,
    about: body.about,
    phone: body.phone,
    countryId: body.countryId || null,
    cityId: body.cityId || null,
    portfolioUrl: body.portfolioUrl,
    linkedinUrl: body.linkedinUrl,
    githubUrl: body.githubUrl,
    visibility: body.visibility || "public",
    preferredJobTypes: body.preferredJobTypes,
    preferredWorkModes: body.preferredWorkModes,
    preferredCategories: body.preferredCategories,
    minSalary: body.minSalary?.toString(),
    maxSalary: body.maxSalary?.toString(),
    currency: body.currency || "USD",
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(profiles).set(profileData).where(eq(profiles.id, existing.id));
  } else {
    await db.insert(profiles).values({ id: randomUUID(), userId: user.id, ...profileData });
  }

  // Update user name if provided
  if (body.name && body.name !== user.name) {
    await db.update(users).set({ name: body.name, updatedAt: new Date() }).where(eq(users.id, user.id));
  }

  // Update skills
  if (Array.isArray(body.skillIds)) {
    await db.delete(userSkills).where(eq(userSkills.userId, user.id));
    for (const skillId of body.skillIds) {
      await db.insert(userSkills).values({ userId: user.id, skillId });
    }
  }

  return success({ message: "Profile updated" });
}

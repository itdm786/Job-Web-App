import { NextRequest } from "next/server";
import { db } from "@/db";
import { users, userRoles, roles, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, setSession } from "@/lib/auth";
import { success, error, parseBody } from "@/lib/api";
import { z } from "zod";
import { randomUUID } from "crypto";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["Job Seeker", "Employer"]).default("Job Seeker"),
});

export async function POST(req: NextRequest) {
  const body = await parseBody<z.infer<typeof schema>>(req);
  if (!body) return error("Invalid request");

  const parsed = schema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0]?.message || "Validation failed");

  const email = parsed.data.email.toLowerCase();

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) return error("Email already registered", 409);

  const userId = randomUUID();
  const passwordHash = await hashPassword(parsed.data.password);

  await db.insert(users).values({
    id: userId,
    email,
    name: parsed.data.name,
    passwordHash,
    emailVerified: false,
    active: true,
  });

  // Create profile
  await db.insert(profiles).values({
    id: randomUUID(),
    userId,
  });

  // Assign role
  const [role] = await db.select().from(roles).where(eq(roles.name, parsed.data.role)).limit(1);
  if (role) {
    await db.insert(userRoles).values({ userId, roleId: role.id });
  }

  // Welcome notification
  const { notifyUser } = await import("@/lib/notifications");
  await notifyUser({
    userId,
    type: "welcome",
    title: `Welcome to GlobalHire, ${parsed.data.name.split(" ")[0]}! 🎉`,
    message: `Your ${parsed.data.role} account is ready. ${parsed.data.role === "Employer" ? "Start posting jobs and find great candidates." : "Complete your profile to get personalized job recommendations."}`,
    link: parsed.data.role === "Employer" ? "/employer" : "/dashboard/profile",
  });

  await setSession(userId);
  return success({ message: "Account created successfully" }, 201);
}

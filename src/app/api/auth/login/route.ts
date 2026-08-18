import { NextRequest } from "next/server";
import { db } from "@/db";
import { users, userRoles, roles, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, setSession } from "@/lib/auth";
import { success, error, parseBody } from "@/lib/api";
import { z } from "zod";
import { notifyUser } from "@/lib/notifications";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  const body = await parseBody<z.infer<typeof schema>>(req);
  if (!body) return error("Invalid request");

  const parsed = schema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0]?.message || "Validation failed");

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      active: users.active,
    })
    .from(users)
    .where(eq(users.email, parsed.data.email.toLowerCase()))
    .limit(1);

  if (!user || !user.passwordHash) return error("Invalid email or password", 401);
  if (!user.active) return error("Account is suspended", 403);

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return error("Invalid email or password", 401);

  await setSession(user.id);

  // Login alert notification (async, don't block response)
  notifyUser({
    userId: user.id,
    type: "login",
    title: "New sign-in to your account",
    message: `You just signed in to GlobalHire. If this wasn't you, please secure your account immediately.`,
    link: "/dashboard/settings",
  }).catch(() => {});

  return success({ message: "Logged in successfully" });
}

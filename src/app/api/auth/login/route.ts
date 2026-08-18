import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, seekerProfiles, companies } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { email, name, role, avatar, language } = await req.json();
    if (!email || !name || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    let user;
    if (existing.length > 0) {
      // update role if different? keep original but allow override for demo
      user = existing[0];
      // if role is admin/manager etc and existing is seeker, update for demo purposes if requested via query param? We'll update if role is not seeker and current is seeker
      if (role !== user.role && (role === "admin" || role === "employer" || role === "manager")) {
        // update
        const updated = await db.update(users).set({ role, language: language || user.language }).where(eq(users.id, user.id)).returning();
        user = updated[0];
      }
    } else {
      const inserted = await db.insert(users).values({
        email,
        name,
        role,
        avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`,
        language: language || "en",
        permissions: role === "admin" ? ["manage_jobs", "manage_users", "manage_blogs", "manage_ads", "manage_roles", "view_analytics", "manage_settings", "approve_content", "publish_blogs"] : [],
      }).returning();
      user = inserted[0];

      // create associated profile
      if (role === "seeker") {
        await db.insert(seekerProfiles).values({
          userId: user.id,
          headline: "Looking for opportunities",
          skills: [],
          experience: [],
          education: [],
          preferences: {},
        });
      } else if (role === "employer") {
        await db.insert(companies).values({
          employerId: user.id,
          name: `${name}'s Company`,
          industry: "Technology",
          location: "Global",
          country: "United States",
          description: "Leading company in industry",
          verified: false,
        });
      }
    }

    return NextResponse.json({ user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      language: user.language,
      permissions: user.permissions,
    }});
  } catch (e: any) {
    console.error("login error", e);
    return NextResponse.json({ error: e.message || "Internal error" }, { status: 500 });
  }
}

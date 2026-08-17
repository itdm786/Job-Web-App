import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, jobs, applications, blogs, ads } from "@/db/schema";
import { count, eq } from "drizzle-orm";

export async function GET() {
  try {
    const [userCount] = await db.select({ c: count() }).from(users);
    const [jobCount] = await db.select({ c: count() }).from(jobs);
    const [pendingJobs] = await db.select({ c: count() }).from(jobs).where(eq(jobs.status, "pending"));
    const [appCount] = await db.select({ c: count() }).from(applications);
    const [blogCount] = await db.select({ c: count() }).from(blogs);
    const [adCount] = await db.select({ c: count() }).from(ads);
    const [pendingAds] = await db.select({ c: count() }).from(ads).where(eq(ads.status, "pending"));

    return NextResponse.json({
      users: userCount.c,
      jobs: jobCount.c,
      pendingJobs: pendingJobs.c,
      applications: appCount.c,
      blogs: blogCount.c,
      ads: adCount.c,
      pendingAds: pendingAds.c,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

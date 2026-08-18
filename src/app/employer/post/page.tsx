import { redirect } from "next/navigation";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { db } from "@/db";
import { companies, companyUsers, categories, countries, cities, jobTypes, skills } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { PostJobForm } from "./PostJobForm";

export const dynamic = "force-dynamic";

export default async function PostJobPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/employer/post");
  if (!hasRole(user, "Employer") && !user.roles.includes("Super Admin")) redirect("/dashboard");

  const userCompanies = await db
    .select({ id: companies.id, name: companies.name })
    .from(companyUsers)
    .innerJoin(companies, eq(companyUsers.companyId, companies.id))
    .where(eq(companyUsers.userId, user.id));

  const [cats, ctries, jts, sks] = await Promise.all([
    db.select().from(categories).where(eq(categories.active, true)).orderBy(asc(categories.name)),
    db.select().from(countries).where(eq(countries.active, true)).orderBy(asc(countries.name)),
    db.select().from(jobTypes).where(eq(jobTypes.active, true)),
    db.select().from(skills).orderBy(asc(skills.name)).limit(100),
  ]);

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Post a New Job</h1>
          <p className="text-slate-600 mt-1">Fill in the details below. Your job will be reviewed before publishing.</p>
        </div>
        <PostJobForm companies={userCompanies} categories={cats} countries={ctries} jobTypes={jts} skills={sks} />
      </div>
    </div>
  );
}

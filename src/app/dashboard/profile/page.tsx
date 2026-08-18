import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { profiles, users, userSkills, skills, experiences, education as educationTable, countries, cities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProfileEditor } from "./ProfileEditor";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard/profile");

  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
  const userSkillsData = await db
    .select({ id: skills.id, name: skills.name })
    .from(userSkills)
    .innerJoin(skills, eq(userSkills.skillId, skills.id))
    .where(eq(userSkills.userId, user.id));

  const exps = await db.select().from(experiences).where(eq(experiences.userId, user.id));
  const edu = await db.select().from(educationTable).where(eq(educationTable.userId, user.id));

  const countryList = await db.select().from(countries);
  const cityList = await db.select().from(cities).limit(200);
  const allSkills = await db.select().from(skills).limit(100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Profile</h1>
      <p className="text-slate-600 mb-6">Complete your profile to get better job recommendations</p>
      <ProfileEditor
        user={user}
        profile={profile}
        skills={userSkillsData}
        experiences={exps}
        education={edu}
        countries={countryList}
        cities={cityList}
        allSkills={allSkills}
      />
    </div>
  );
}

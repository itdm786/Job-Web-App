import { redirect } from "next/navigation";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { db } from "@/db";
import { countries, cities } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { CreateCompanyForm } from "./CreateCompanyForm";

export const dynamic = "force-dynamic";

export default async function CreateCompanyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/employer/company/create");
  if (!hasRole(user, "Employer") && !user.roles.includes("Super Admin")) redirect("/dashboard");

  const [countryList, cityList] = await Promise.all([
    db.select().from(countries).where(eq(countries.active, true)).orderBy(asc(countries.name)),
    db.select().from(cities).orderBy(asc(cities.name)).limit(300),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Your Company Profile</h1>
      <p className="text-slate-600 mb-6">You need a company profile before you can post jobs. Our team will verify your company.</p>
      <CreateCompanyForm countries={countryList} cities={cityList} />
    </div>
  );
}

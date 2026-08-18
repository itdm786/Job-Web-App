import Link from "next/link";
import { db } from "@/db";
import { countries, cities } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { EmployerSignupForm } from "./EmployerSignupForm";
import { Briefcase, Shield, Globe, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EmployerSignupPage() {
  const [countryList, cityList] = await Promise.all([
    db.select().from(countries).where(eq(countries.active, true)).orderBy(asc(countries.name)),
    db.select().from(cities).orderBy(asc(cities.name)).limit(300),
  ]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Benefits */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">GlobalHire</span>
            </Link>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Create Your <span className="text-emerald-700">Company Account</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              One account to post jobs, manage applications, and hire top talent globally.
            </p>

            <div className="space-y-4">
              <Benefit icon={Globe} title="Reach 190+ Countries" desc="Post jobs and attract candidates from every corner of the world." />
              <Benefit icon={Shield} title="Verified Company Badge" desc="Get verified and build trust with high-quality candidates." />
              <Benefit icon={Zap} title="Smart Applicant Tracking" desc="Review, shortlist, and hire with our powerful ATS tools." />
              <Benefit icon={Briefcase} title="Unlimited Team Members" desc="Invite HR, recruiters, and managers to collaborate on hiring." />
            </div>

            <div className="mt-8 p-4 bg-white/70 border border-slate-200 rounded-xl text-sm text-slate-600">
              <strong className="text-slate-900">Already have an account?</strong>{" "}
              <Link href="/login" className="text-emerald-700 font-medium hover:underline">
                Sign in here
              </Link>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-3">
            <EmployerSignupForm countries={countryList} cities={cityList} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Benefit({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600">{desc}</p>
      </div>
    </div>
  );
}

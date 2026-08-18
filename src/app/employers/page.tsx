import Link from "next/link";
import { Briefcase } from "lucide-react";
import { Card, Button } from "@/components/ui";

export default function EmployersPage() {
  return (
    <div className="bg-slate-50">
      <section className="bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Hire the best talent,<br />anywhere in the world
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Post your job and reach millions of qualified candidates across 190+ countries.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/employer/post">
              <Button size="lg">Post a Job</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg">Create Employer Account</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Why employers choose GlobalHire</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Feature
            emoji="🌍"
            title="Global Reach"
            description="Access talent from 190+ countries with localized job listings in multiple currencies and languages."
          />
          <Feature
            emoji="✅"
            title="Verified Candidates"
            description="Our verification system ensures you see qualified, serious applicants for your positions."
          />
          <Feature
            emoji="🎯"
            title="Smart Matching"
            description="Our algorithm matches your jobs with the most relevant candidates automatically."
          />
          <Feature
            emoji="📊"
            title="Analytics Dashboard"
            description="Track views, applications, and performance metrics for all your job postings."
          />
          <Feature
            emoji="🏛️"
            title="Government Verified"
            description="Special verification track for government organizations and public sector jobs."
          />
          <Feature
            emoji="💼"
            title="Employer Branding"
            description="Build your company profile and attract top talent with rich company pages."
          />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Simple pricing</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <PricingCard
            name="Starter"
            price="Free"
            description="For small teams getting started"
            features={["1 active job post", "Basic company profile", "Standard support"]}
          />
          <PricingCard
            name="Professional"
            price="$99"
            period="/month"
            description="For growing companies"
            features={["10 active job posts", "Verified company badge", "Applicant tracking", "Priority support", "Analytics"]}
            featured
          />
          <PricingCard
            name="Enterprise"
            price="Custom"
            description="For large organizations"
            features={["Unlimited job posts", "Dedicated account manager", "Custom integrations", "API access", "SLA guarantee"]}
          />
        </div>
      </section>
    </div>
  );
}

function Feature({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <Card className="p-6">
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </Card>
  );
}

function PricingCard({ name, price, period, description, features, featured }: any) {
  return (
    <Card className={`p-6 ${featured ? "border-emerald-500 border-2 shadow-lg" : ""}`}>
      {featured && <div className="text-xs font-medium text-emerald-700 mb-2">MOST POPULAR</div>}
      <h3 className="text-xl font-bold text-slate-900">{name}</h3>
      <div className="mt-3 mb-1">
        <span className="text-4xl font-bold text-slate-900">{price}</span>
        {period && <span className="text-slate-600">{period}</span>}
      </div>
      <p className="text-sm text-slate-600 mb-6">{description}</p>
      <ul className="space-y-2 mb-6">
        {features.map((f: string) => (
          <li key={f} className="text-sm text-slate-700 flex items-start gap-2">
            <span className="text-emerald-600 mt-0.5">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <Button className="w-full" variant={featured ? "primary" : "outline"}>
        Get started
      </Button>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, Textarea, Card, Alert } from "@/components/ui";
import { Save, Building2, Loader2 } from "lucide-react";

const INDUSTRIES = [
  "Information Technology", "Software", "Internet", "Telecommunications", "Banking",
  "Finance", "Insurance", "Healthcare", "Pharmaceuticals", "Education", "Retail",
  "E-commerce", "Manufacturing", "Construction", "Real Estate", "Hospitality",
  "Media & Entertainment", "Marketing & Advertising", "Consulting", "Legal",
  "Non-profit", "Government", "Logistics", "Energy", "Agriculture", "Other",
];

const SIZES = [
  "1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5001-10000", "10000+",
];

const LOGOS = ["🚀", "💡", "🏢", "🌐", "⚡", "🎯", "🏆", "💎", "🔥", "✨", "🌟", "🎨", "🏥", "🏦", "🏛️", "📊"];

export function CreateCompanyForm({ countries, cities }: { countries: any[]; cities: any[] }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    website: "",
    description: "",
    industry: "",
    size: "",
    foundedYear: "",
    address: "",
    phone: "",
    email: "",
    countryId: "",
    cityId: "",
    linkedinUrl: "",
    twitterUrl: "",
    logo: "🏢",
  });

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      setError("Company name is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push("/employer");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <Alert variant="error">{error}</Alert>}

      <Card className="p-6">
        <h2 className="font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-600" />
          Company Details
        </h2>
        <div className="space-y-4">
          <Input
            label="Company Name *"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Acme Corporation"
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Company Logo</label>
            <div className="flex flex-wrap gap-2">
              {LOGOS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => update("logo", l)}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl border-2 ${
                    form.logo === l ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <Input label="Website" value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://your-company.com" />
          <Input label="Email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="careers@your-company.com" />
          <Input label="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 234 567 8900" />

          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Tell candidates about your company, mission, and culture..."
            rows={5}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-lg text-slate-900 mb-4">Business Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Industry" value={form.industry} onChange={(e) => update("industry", e.target.value)}>
            <option value="">Select industry</option>
            {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
          </Select>
          <Select label="Company Size" value={form.size} onChange={(e) => update("size", e.target.value)}>
            <option value="">Select size</option>
            {SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
          </Select>
          <Input label="Founded Year" type="number" min={1800} max={2030} value={form.foundedYear} onChange={(e) => update("foundedYear", e.target.value)} placeholder="2015" />
          <Input label="Address" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="123 Main St, City" />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-lg text-slate-900 mb-4">Location</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Country" value={form.countryId} onChange={(e) => update("countryId", e.target.value)}>
            <option value="">Select country</option>
            {countries.map((c) => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
          </Select>
          <Select label="City" value={form.cityId} onChange={(e) => update("cityId", e.target.value)}>
            <option value="">Select city</option>
            {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-lg text-slate-900 mb-4">Social Media (Optional)</h2>
        <div className="space-y-4">
          <Input label="LinkedIn URL" value={form.linkedinUrl} onChange={(e) => update("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/company/your-company" />
          <Input label="Twitter/X URL" value={form.twitterUrl} onChange={(e) => update("twitterUrl", e.target.value)} placeholder="https://twitter.com/your-company" />
        </div>
      </Card>

      <Card className="p-5 bg-amber-50 border-amber-200">
        <p className="text-sm text-amber-900">
          <strong>Note:</strong> Your company will be reviewed by our team after submission. Verification usually takes 1-2 business days. You can still post jobs while pending, but they won't show the "Verified Employer" badge.
        </p>
      </Card>

      <div className="flex gap-3 justify-end sticky bottom-4 bg-slate-50 p-4 -mx-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          <Save className="w-4 h-4" />
          Create Company
        </Button>
      </div>
    </form>
  );
}

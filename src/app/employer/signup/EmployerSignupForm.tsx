"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, Textarea, Card, Alert } from "@/components/ui";
import { Building2, User, Briefcase, ArrowRight, ArrowLeft, Check } from "lucide-react";

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

const DESIGNATIONS = [
  "CEO / Founder", "CTO", "COO", "HR Manager", "HR Director", "Recruiter",
  "Senior Recruiter", "Talent Acquisition Manager", "Talent Acquisition Specialist",
  "Hiring Manager", "Team Lead", "Department Head", "Office Manager",
  "Operations Manager", "Business Development", "Admin", "Other",
];

export function EmployerSignupForm({ countries, cities }: { countries: any[]; cities: any[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    // Personal
    name: "",
    email: "",
    password: "",
    phone: "",
    designation: "",
    // Company
    companyName: "",
    companyEmail: "",
    companyWebsite: "",
    companyPhone: "",
    companyAddress: "",
    industry: "",
    size: "",
    foundedYear: "",
    countryId: "",
    cityId: "",
    companyDescription: "",
    companyLogo: "🏢",
    linkedinUrl: "",
  });

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const nextStep = () => {
    if (step === 1) {
      if (!form.companyName) {
        setError("Company name is required");
        return;
      }
    }
    if (step === 2) {
      if (!form.name || !form.email || !form.password || !form.designation) {
        setError("Please fill all required fields");
        return;
      }
      if (form.password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
    }
    setError(null);
    setStep(step + 1);
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/employer/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create account");
      router.push("/employer");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6 sm:p-8">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        <StepIndicator num={1} label="Company" active={step === 1} done={step > 1} />
        <div className="flex-1 h-0.5 bg-slate-200">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: step > 1 ? "100%" : "0%" }} />
        </div>
        <StepIndicator num={2} label="Your Info" active={step === 2} done={step > 2} />
        <div className="flex-1 h-0.5 bg-slate-200">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: step > 2 ? "100%" : "0%" }} />
        </div>
        <StepIndicator num={3} label="Details" active={step === 3} done={false} />
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Company Information</h2>
          </div>
          <p className="text-sm text-slate-600 mb-4">Tell us about your company. This will be your main profile visible to candidates.</p>

          <Input
            label="Company Name *"
            value={form.companyName}
            onChange={(e) => update("companyName", e.target.value)}
            placeholder="e.g. TechCorp Solutions"
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Company Logo</label>
            <div className="flex flex-wrap gap-2">
              {LOGOS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => update("companyLogo", l)}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl border-2 ${
                    form.companyLogo === l ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Company Email" type="email" value={form.companyEmail} onChange={(e) => update("companyEmail", e.target.value)} placeholder="careers@company.com" />
            <Input label="Company Website" value={form.companyWebsite} onChange={(e) => update("companyWebsite", e.target.value)} placeholder="https://company.com" />
            <Input label="Company Phone" value={form.companyPhone} onChange={(e) => update("companyPhone", e.target.value)} placeholder="+1 234 567 8900" />
            <Select label="Industry" value={form.industry} onChange={(e) => update("industry", e.target.value)}>
              <option value="">Select industry</option>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </Select>
            <Select label="Company Size" value={form.size} onChange={(e) => update("size", e.target.value)}>
              <option value="">Select size</option>
              {SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
            </Select>
            <Input label="Founded Year" type="number" value={form.foundedYear} onChange={(e) => update("foundedYear", e.target.value)} placeholder="2015" />
          </div>

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

          <Input label="Company Address" value={form.companyAddress} onChange={(e) => update("companyAddress", e.target.value)} placeholder="123 Main Street, City" />
          <Textarea label="Company Description" value={form.companyDescription} onChange={(e) => update("companyDescription", e.target.value)} placeholder="Tell candidates about your company, mission, and culture..." rows={4} />

          <div className="flex justify-end pt-4">
            <Button onClick={nextStep} size="lg">
              Next: Your Information
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Your Information</h2>
          </div>
          <p className="text-sm text-slate-600 mb-4">You'll be the primary admin of this company account. Your designation will appear on job posts.</p>

          <Input
            label="Your Full Name *"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Jane Smith"
            required
          />

          <Select
            label="Your Designation *"
            value={form.designation}
            onChange={(e) => update("designation", e.target.value)}
            required
          >
            <option value="">Select your designation</option>
            {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </Select>

          <Input
            label="Your Email (Login) *"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@company.com"
            required
          />

          <Input
            label="Password *"
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="Minimum 8 characters"
            hint="Must be at least 8 characters"
            required
          />

          <Input label="Your Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 234 567 8900" />
          <Input label="Company LinkedIn" value={form.linkedinUrl} onChange={(e) => update("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/company/your-company" />

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button onClick={nextStep} size="lg">
              Next: Review
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Review & Create</h2>
          </div>
          <p className="text-sm text-slate-600 mb-4">Review your information before creating your company account.</p>

          {/* Company preview card */}
          <div className="p-5 border-2 border-emerald-200 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center text-3xl shadow-sm">
                {form.companyLogo}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-lg">{form.companyName}</h3>
                {form.industry && <p className="text-sm text-slate-600">{form.industry} {form.size && `• ${form.size} employees`}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
              {form.companyEmail && <div>📧 {form.companyEmail}</div>}
              {form.companyPhone && <div>📞 {form.companyPhone}</div>}
              {form.companyWebsite && <div className="col-span-2 truncate">🌐 {form.companyWebsite}</div>}
            </div>
          </div>

          {/* Admin preview */}
          <div className="p-4 border border-slate-200 rounded-lg bg-white">
            <div className="text-xs font-medium text-slate-500 mb-2">PRIMARY ADMIN</div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center font-semibold">
                {form.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-slate-900">{form.name}</div>
                <div className="text-sm text-slate-600">{form.designation}</div>
                <div className="text-xs text-slate-500">{form.email}</div>
              </div>
            </div>
          </div>

          <Alert variant="info">
            <strong>What happens next:</strong> Your company will be reviewed by our team (usually 1-2 business days). You can post jobs immediately, but the "Verified Employer" badge will appear after verification.
          </Alert>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button onClick={submit} loading={submitting} size="lg">
              <Briefcase className="w-4 h-4" />
              Create Company Account
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function StepIndicator({ num, label, active, done }: { num: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
        done ? "bg-emerald-500 text-white" : active ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
      }`}>
        {done ? <Check className="w-4 h-4" /> : num}
      </div>
      <span className={`text-sm font-medium hidden sm:inline ${active || done ? "text-slate-900" : "text-slate-500"}`}>{label}</span>
    </div>
  );
}

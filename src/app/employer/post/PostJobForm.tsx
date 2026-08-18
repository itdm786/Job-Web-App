"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, Textarea, Card, Alert } from "@/components/ui";
import { Save, Send, Loader2 } from "lucide-react";

export function PostJobForm({
  companies,
  categories,
  countries,
  jobTypes,
  skills,
}: {
  companies: any[];
  categories: any[];
  countries: any[];
  jobTypes: any[];
  skills: any[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    companyId: companies[0]?.id || "",
    categoryId: "",
    countryId: "",
    cityId: "",
    jobSector: "private",
    workModes: [] as string[],
    jobTypeIds: [] as string[],
    experienceLevel: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "USD",
    description: "",
    responsibilities: "",
    requirements: "",
    benefits: "",
    skillIds: [] as string[],
    vacancies: "1",
  });

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const toggleArr = (k: "workModes" | "jobTypeIds" | "skillIds", v: string) => {
    setForm((f) => ({
      ...f,
      [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v],
    }));
  };

  const submit = async (asDraft: boolean) => {
    if (!form.title || !form.companyId) {
      setError("Title and company are required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
          salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
          vacancies: Number(form.vacancies) || 1,
          submit: !asDraft,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      router.push("/employer");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}

      <Card className="p-6">
        <h2 className="font-semibold text-lg text-slate-900 mb-4">Basic Information</h2>
        <div className="space-y-4">
          <Input
            label="Job Title *"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Senior Software Engineer"
          />
          <Select
            label="Company *"
            value={form.companyId}
            onChange={(e) => update("companyId", e.target.value)}
          >
            <option value="">Select company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Select
            label="Category"
            value={form.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Select
            label="Job Sector"
            value={form.jobSector}
            onChange={(e) => update("jobSector", e.target.value)}
          >
            <option value="private">Private</option>
            <option value="government">Government</option>
            <option value="ngo">NGO / Non-profit</option>
            <option value="public">Public Sector</option>
          </Select>
          <Input
            label="Number of Vacancies"
            type="number"
            min={1}
            value={form.vacancies}
            onChange={(e) => update("vacancies", e.target.value)}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-lg text-slate-900 mb-4">Location</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Country" value={form.countryId} onChange={(e) => update("countryId", e.target.value)}>
            <option value="">Select country</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
            ))}
          </Select>
          <Input label="City" value={form.cityId} onChange={(e) => update("cityId", e.target.value)} placeholder="City name" />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-lg text-slate-900 mb-4">Work Mode & Type</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Work Mode</label>
            <div className="flex flex-wrap gap-2">
              {["remote", "hybrid", "onsite"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleArr("workModes", m)}
                  className={`px-3 py-1.5 rounded-lg text-sm border capitalize ${
                    form.workModes.includes(m)
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Job Type</label>
            <div className="flex flex-wrap gap-2">
              {jobTypes.map((jt) => (
                <button
                  key={jt.id}
                  type="button"
                  onClick={() => toggleArr("jobTypeIds", jt.slug)}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    form.jobTypeIds.includes(jt.slug)
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {jt.name}
                </button>
              ))}
            </div>
          </div>
          <Select
            label="Experience Level"
            value={form.experienceLevel}
            onChange={(e) => update("experienceLevel", e.target.value)}
          >
            <option value="">Any experience</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead / Principal</option>
          </Select>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-lg text-slate-900 mb-4">Salary</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Input label="Minimum" type="number" value={form.salaryMin} onChange={(e) => update("salaryMin", e.target.value)} />
          <Input label="Maximum" type="number" value={form.salaryMax} onChange={(e) => update("salaryMax", e.target.value)} />
          <Select label="Currency" value={form.salaryCurrency} onChange={(e) => update("salaryCurrency", e.target.value)}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="PKR">PKR</option>
            <option value="AED">AED</option>
            <option value="SAR">SAR</option>
            <option value="CAD">CAD</option>
            <option value="AUD">AUD</option>
            <option value="INR">INR</option>
          </Select>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-lg text-slate-900 mb-4">Description</h2>
        <div className="space-y-4">
          <Textarea label="Job Description" rows={6} value={form.description} onChange={(e) => update("description", e.target.value)} />
          <Textarea label="Responsibilities" rows={5} value={form.responsibilities} onChange={(e) => update("responsibilities", e.target.value)} />
          <Textarea label="Requirements" rows={5} value={form.requirements} onChange={(e) => update("requirements", e.target.value)} />
          <Textarea label="Benefits" rows={4} value={form.benefits} onChange={(e) => update("benefits", e.target.value)} />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-lg text-slate-900 mb-4">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 40).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => toggleArr("skillIds", s.id)}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                form.skillIds.includes(s.id)
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex gap-3 justify-end sticky bottom-4 bg-slate-50 p-4 -mx-4">
        <Button variant="outline" onClick={() => submit(true)} disabled={submitting}>
          <Save className="w-4 h-4" />
          Save as Draft
        </Button>
        <Button onClick={() => submit(false)} disabled={submitting} loading={submitting}>
          <Send className="w-4 h-4" />
          Submit for Review
        </Button>
      </div>
    </div>
  );
}

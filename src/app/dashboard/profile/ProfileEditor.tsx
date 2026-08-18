"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, Textarea, Card, Alert } from "@/components/ui";
import { Save, Plus, Trash2, Loader2 } from "lucide-react";

export function ProfileEditor({
  user,
  profile,
  skills,
  experiences,
  education,
  countries,
  cities,
  allSkills,
}: any) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    name: user.name,
    headline: profile?.headline || "",
    about: profile?.about || "",
    phone: profile?.phone || "",
    countryId: profile?.countryId || "",
    cityId: profile?.cityId || "",
    portfolioUrl: profile?.portfolioUrl || "",
    linkedinUrl: profile?.linkedinUrl || "",
    githubUrl: profile?.githubUrl || "",
    visibility: profile?.visibility || "public",
    preferredJobTypes: profile?.preferredJobTypes || [],
    preferredWorkModes: profile?.preferredWorkModes || [],
    minSalary: profile?.minSalary || "",
    maxSalary: profile?.maxSalary || "",
    currency: profile?.currency || "USD",
    skillIds: skills.map((s: any) => s.id),
  });

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const toggleArray = (k: "preferredJobTypes" | "preferredWorkModes" | "skillIds", v: string) => {
    setForm((f) => ({
      ...f,
      [k]: f[k].includes(v) ? f[k].filter((x: string) => x !== v) : [...f[k], v],
    }));
  };

  const submit = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          minSalary: form.minSalary ? Number(form.minSalary) : undefined,
          maxSalary: form.maxSalary ? Number(form.maxSalary) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessage({ type: "success", text: "Profile saved successfully!" });
      setTimeout(() => router.refresh(), 800);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {message && <Alert variant={message.type}>{message.text}</Alert>}

      <Card className="p-6">
        <h2 className="font-semibold text-lg text-slate-900 mb-4">Basic Information</h2>
        <div className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={(e) => update("name", e.target.value)} />
          <Input
            label="Headline"
            value={form.headline}
            onChange={(e) => update("headline", e.target.value)}
            placeholder="e.g. Senior Full Stack Developer"
            hint="A short professional tagline"
          />
          <Textarea
            label="About"
            value={form.about}
            onChange={(e) => update("about", e.target.value)}
            placeholder="Tell employers about yourself, your experience, and what you're looking for..."
            rows={5}
          />
          <Input label="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          <Select label="Profile Visibility" value={form.visibility} onChange={(e) => update("visibility", e.target.value)}>
            <option value="public">Public — anyone can see</option>
            <option value="employers">Employers only</option>
            <option value="private">Private — only you</option>
          </Select>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-lg text-slate-900 mb-4">Location</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Country" value={form.countryId} onChange={(e) => update("countryId", e.target.value)}>
            <option value="">Select country</option>
            {countries.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.flag} {c.name}
              </option>
            ))}
          </Select>
          <Select label="City" value={form.cityId} onChange={(e) => update("cityId", e.target.value)}>
            <option value="">Select city</option>
            {cities.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-lg text-slate-900 mb-4">Links</h2>
        <div className="space-y-4">
          <Input label="Portfolio URL" value={form.portfolioUrl} onChange={(e) => update("portfolioUrl", e.target.value)} placeholder="https://your-portfolio.com" />
          <Input label="LinkedIn URL" value={form.linkedinUrl} onChange={(e) => update("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/your-profile" />
          <Input label="GitHub URL" value={form.githubUrl} onChange={(e) => update("githubUrl", e.target.value)} placeholder="https://github.com/your-username" />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-lg text-slate-900 mb-4">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {allSkills.map((s: any) => (
            <button
              key={s.id}
              type="button"
              onClick={() => toggleArray("skillIds", s.id)}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                form.skillIds.includes(s.id)
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-medium"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-lg text-slate-900 mb-4">Job Preferences</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Work Mode</label>
            <div className="flex flex-wrap gap-2">
              {["remote", "hybrid", "onsite"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleArray("preferredWorkModes", m)}
                  className={`px-3 py-1.5 rounded-lg text-sm border capitalize ${
                    form.preferredWorkModes.includes(m)
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-white border-slate-300 text-slate-700"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Job Type</label>
            <div className="flex flex-wrap gap-2">
              {["full-time", "part-time", "contract", "freelance", "internship"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleArray("preferredJobTypes", t)}
                  className={`px-3 py-1.5 rounded-lg text-sm border capitalize ${
                    form.preferredJobTypes.includes(t)
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-white border-slate-300 text-slate-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Min Salary" type="number" value={form.minSalary} onChange={(e) => update("minSalary", e.target.value)} />
            <Input label="Max Salary" type="number" value={form.maxSalary} onChange={(e) => update("maxSalary", e.target.value)} />
            <Select label="Currency" value={form.currency} onChange={(e) => update("currency", e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="PKR">PKR</option>
              <option value="AED">AED</option>
              <option value="INR">INR</option>
            </Select>
          </div>
        </div>
      </Card>

      {experiences.length > 0 && (
        <Card className="p-6">
          <h2 className="font-semibold text-lg text-slate-900 mb-4">Experience</h2>
          <div className="space-y-3">
            {experiences.map((exp: any) => (
              <div key={exp.id} className="p-3 bg-slate-50 rounded-lg">
                <div className="font-medium text-slate-900">{exp.title}</div>
                <div className="text-sm text-slate-600">{exp.company}</div>
                {exp.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{exp.description}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {education.length > 0 && (
        <Card className="p-6">
          <h2 className="font-semibold text-lg text-slate-900 mb-4">Education</h2>
          <div className="space-y-3">
            {education.map((e: any) => (
              <div key={e.id} className="p-3 bg-slate-50 rounded-lg">
                <div className="font-medium text-slate-900">{e.degree}</div>
                <div className="text-sm text-slate-600">{e.institution}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="sticky bottom-4 bg-slate-50 p-4 -mx-4 flex justify-end">
        <Button onClick={submit} loading={saving}>
          <Save className="w-4 h-4" />
          Save Profile
        </Button>
      </div>
    </div>
  );
}

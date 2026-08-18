"use client";
import { COUNTRIES, CITIES_BY_COUNTRY, DEPARTMENTS, CATEGORIES, EMPLOYMENT_TYPES, SALARY_RANGES } from "@/lib/constants";

interface Filters {
  country: string;
  city: string;
  jobNature: string;
  department: string;
  category: string;
  employmentType: string;
  salaryRange: string;
  postedDate: string;
  organization: string;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClear: () => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--ink-soft)" }}>{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

const selectStyle = { borderColor: "var(--line)", background: "var(--paper)" } as const;

export default function FiltersSidebar({ filters, onChange, onClear }: Props) {
  const update = (k: keyof Filters, v: string) => onChange({ ...filters, [k]: v });

  const cities = filters.country && filters.country !== "All" && CITIES_BY_COUNTRY[filters.country] ? CITIES_BY_COUNTRY[filters.country] : Object.values(CITIES_BY_COUNTRY).flat();

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-[15px]">Registry Filters</h3>
        <button onClick={onClear} className="text-xs font-medium" style={{ color: "var(--teal)" }}>Clear all</button>
      </div>

      <div className="mt-5 space-y-5">
        <Field label="Country">
          <select value={filters.country} onChange={e => update("country", e.target.value)} className="w-full rounded-md border px-3 py-2.5 text-sm" style={selectStyle}>
            <option value="All">All Countries</option>
            {COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
          </select>
          {filters.country !== "All" && (
            <div className="mt-2 rounded px-2.5 py-1.5 text-[11px]" style={{ background: "var(--teal-soft)", color: "var(--teal)" }}>
              Showing {filters.country}{filters.jobNature !== "All" ? ` \u2013 ${filters.jobNature}` : ""} jobs only
            </div>
          )}
        </Field>

        <Field label="Job Nature">
          <div className="grid grid-cols-3 gap-2">
            {["All", "government", "private"].map(v => (
              <button
                key={v}
                onClick={() => update("jobNature", v)}
                className="rounded-md border px-3 py-2 text-xs font-medium capitalize transition"
                style={filters.jobNature === v ? { borderColor: "var(--ink)", background: "var(--ink)", color: "#fff" } : { borderColor: "var(--line)" }}
              >{v}</button>
            ))}
          </div>
        </Field>

        <Field label="City / Location">
          <select value={filters.city} onChange={e => update("city", e.target.value)} className="w-full rounded-md border px-3 py-2.5 text-sm" style={selectStyle}>
            <option value="All">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Department (Government)">
          <select value={filters.department} onChange={e => update("department", e.target.value)} className="w-full rounded-md border px-3 py-2.5 text-sm" style={selectStyle}>
            <option value="All">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>

        <Field label="Category / Industry">
          <select value={filters.category} onChange={e => update("category", e.target.value)} className="w-full rounded-md border px-3 py-2.5 text-sm" style={selectStyle}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Employment Type">
          <select value={filters.employmentType} onChange={e => update("employmentType", e.target.value)} className="w-full rounded-md border px-3 py-2.5 text-sm" style={selectStyle}>
            <option value="All">All Types</option>
            {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>

        <Field label="Salary Range">
          <select value={filters.salaryRange} onChange={e => update("salaryRange", e.target.value)} className="w-full rounded-md border px-3 py-2.5 text-sm" style={selectStyle}>
            {SALARY_RANGES.map(r => <option key={r.label} value={r.label}>{r.label}</option>)}
          </select>
        </Field>

        <Field label="Organization">
          <input value={filters.organization} onChange={e => update("organization", e.target.value)} placeholder="e.g. FPSC, Google" className="w-full rounded-md border px-3 py-2.5 text-sm" style={selectStyle} />
        </Field>

        <Field label="Posted Date">
          <select value={filters.postedDate} onChange={e => update("postedDate", e.target.value)} className="w-full rounded-md border px-3 py-2.5 text-sm" style={selectStyle}>
            <option value="All">Any time</option>
            <option value="24h">Last 24 hours</option>
            <option value="week">Last week</option>
            <option value="month">Last month</option>
          </select>
        </Field>
      </div>
    </div>
  );
}

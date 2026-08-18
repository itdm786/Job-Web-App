"use client";
import Link from "next/link";

export interface JobCardProps {
  job: any;
  onSave?: (id: string) => void;
  isSaved?: boolean;
}

function refNumber(job: any) {
  const cc = (job.country || "GLB").slice(0, 3).toUpperCase();
  const cty = (job.city || "XX").slice(0, 3).toUpperCase();
  const short = String(job.id || "0").replace(/-/g, "").slice(0, 5).toUpperCase();
  return `${cc}-${cty}-${short}`;
}

export default function JobCard({ job, onSave, isSaved }: JobCardProps) {
  const isGov = job.jobNature === "government";
  const daysAgo = Math.floor((Date.now() - new Date(job.postedAt).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="group relative card p-5 transition hover:shadow-[0_10px_28px_rgba(16,24,43,0.08)]" style={{ borderRadius: 6 }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3.5">
          {isGov ? (
            <span className="seal mt-0.5">
              <span className="seal-mark">Verified<br />Govt</span>
            </span>
          ) : (
            <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full text-sm font-bold" style={{ background: "var(--paper)", color: "var(--ink-soft)" }}>
              {job.company?.logo ? <img src={job.company.logo} className="h-11 w-11 rounded-full object-cover" alt="" /> : (job.organizationName?.[0] || job.company?.name?.[0] || "J")}
            </div>
          )}
          <div>
            <div className="ref-number text-[10.5px] tracking-wide" style={{ color: "var(--ink-faint)" }}>REF #{refNumber(job)}</div>
            <Link href={`/jobs/${job.id}`} className="line-clamp-1 font-display text-[16px] font-semibold leading-tight" style={{ color: "var(--ink)" }}>{job.title}</Link>
            <div className="mt-0.5 line-clamp-1 text-[13px]" style={{ color: "var(--ink-soft)" }}>{job.organizationName || job.company?.name || "Private Organization"} &middot; {job.city}, {job.country}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={isGov ? { background: "var(--gold-soft)", color: "var(--gold)" } : { background: "var(--teal-soft)", color: "var(--teal)" }}
              >
                {isGov ? "Government" : "Private Sector"}
              </span>
              <span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium capitalize" style={{ background: "var(--paper)", color: "var(--ink-soft)" }}>{job.employmentType}</span>
              {job.department && <span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: "var(--paper)", color: "var(--ink-soft)" }}>{job.department}</span>}
              {job.category && <span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: "var(--paper)", color: "var(--ink-soft)" }}>{job.category}</span>}
            </div>
          </div>
        </div>
        <button
          onClick={() => onSave?.(job.id)}
          aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
          className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border text-sm transition"
          style={isSaved ? { background: "var(--ink)", color: "#fff", borderColor: "var(--ink)" } : { borderColor: "var(--line)" }}
        >
          {isSaved ? "\u2665" : "\u2661"}
        </button>
      </div>

      <div className="mt-3 line-clamp-2 text-[13px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>{job.description?.slice(0, 180)}...</div>

      <div className="mt-4 flex items-center justify-between stub-divider pt-3">
        <div className="flex items-center gap-3 text-[12px]" style={{ color: "var(--ink-faint)" }}>
          <span className="ref-number">{job.salaryMin ? `${job.salaryMin.toLocaleString()}\u2013${job.salaryMax?.toLocaleString()}` : "Salary not disclosed"}</span>
          <span>&middot;</span>
          <span>{daysAgo <= 0 ? "Posted today" : `${daysAgo}d ago`}</span>
        </div>
        <Link href={`/jobs/${job.id}`} className="btn btn-primary" style={{ padding: "0.4rem 1rem", fontSize: "0.75rem" }}>View notice</Link>
      </div>

      {job.status === "pending" && <div className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>Pending review</div>}
      {job.status === "flagged" && <div className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: "var(--rust-soft)", color: "var(--rust)" }}>Flagged</div>}
    </div>
  );
}

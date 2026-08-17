"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES, CITIES_BY_COUNTRY } from "@/lib/constants";

interface Suggestion {
  label: string;
  value: string;
  type: string;
  icon: string;
}

export default function SearchBar({ initialQ = "", initialLocation = "", compact = false }: { initialQ?: string; initialLocation?: string; compact?: boolean }) {
  const [q, setQ] = useState(initialQ);
  const [location, setLocation] = useState(initialLocation);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [jobNature, setJobNature] = useState("All");
  const [country, setCountry] = useState("All");
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowSug(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (q.length < 2) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setShowSug(true);
      } catch {}
    }, 250);
    return () => clearTimeout(timer);
  }, [q]);

  const doSearch = (overrideQ?: string, overrideType?: string) => {
    const params = new URLSearchParams();
    const finalQ = overrideQ || q;
    if (finalQ) {
      if (overrideType === "city") params.set("city", finalQ);
      else if (overrideType === "organization") params.set("organization", finalQ);
      else if (overrideType === "department") params.set("department", finalQ);
      else params.set("q", finalQ);
    }
    if (location) {
      if (COUNTRIES.map(c => c.name).includes(location)) params.set("country", location);
      else params.set("city", location);
    }
    if (jobNature !== "All") params.set("jobNature", jobNature);
    if (country !== "All") params.set("country", country);
    router.push(`/jobs?${params.toString()}`);
    setShowSug(false);
  };

  return (
    <div ref={ref} className={`relative w-full ${compact ? "" : "card p-3 shadow-[0_16px_40px_rgba(16,24,43,0.10)]"}`} style={compact ? {} : { borderRadius: 8 }}>
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--ink-faint)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          </div>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            onFocus={() => q.length >= 2 && setShowSug(true)}
            onKeyDown={e => e.key === "Enter" && doSearch()}
            placeholder="Job title, keywords, or organization"
            className="w-full rounded-full border pl-11 pr-4 py-3 text-[15px] outline-none transition"
            style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          />
          {showSug && suggestions.length > 0 && (
            <div className="card absolute z-20 mt-2 w-full overflow-hidden shadow-xl">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => doSearch(s.value, s.type)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[var(--paper)]">
                  <span className="text-lg">{s.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{s.label}</div>
                    <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ink-faint)" }}>{s.type}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 md:w-48">
            <select value={country} onChange={e => setCountry(e.target.value)} className="w-full rounded-full border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--line)", background: "var(--paper)" }}>
              <option value="All">All Countries</option>
              {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.flag} {c.name}</option>)}
            </select>
          </div>
          <button onClick={() => doSearch()} className="btn btn-primary whitespace-nowrap px-7 py-3">Search Jobs</button>
        </div>
      </div>

      {!compact && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs" style={{ color: "var(--ink-faint)" }}>Popular:</span>
          {["Government", "Software Engineer", "Pakistan", "Dubai", "Remote"].map(tag => (
            <button key={tag} onClick={() => { setQ(tag); setTimeout(() => doSearch(tag), 0); }} className="rounded-full px-3 py-1 text-xs font-medium transition" style={{ background: "var(--paper)", color: "var(--ink-soft)" }}>{tag}</button>
          ))}
          <div className="ml-auto flex items-center gap-1 rounded-full p-1" style={{ background: "var(--paper)" }}>
            <button onClick={() => setJobNature("All")} className="rounded-full px-3 py-1 text-xs font-medium" style={jobNature === "All" ? { background: "var(--card)", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" } : {}}>All</button>
            <button onClick={() => setJobNature("government")} className="rounded-full px-3 py-1 text-xs font-medium" style={jobNature === "government" ? { background: "var(--gold)", color: "#fff" } : { color: "var(--gold)" }}>Government</button>
            <button onClick={() => setJobNature("private")} className="rounded-full px-3 py-1 text-xs font-medium" style={jobNature === "private" ? { background: "var(--teal)", color: "#fff" } : { color: "var(--teal)" }}>Private</button>
          </div>
        </div>
      )}
    </div>
  );
}

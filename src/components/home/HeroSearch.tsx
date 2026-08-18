"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";

interface Suggestion {
  label: string;
  type: string;
  href: string;
}

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setSuggestions(data.data || []);
          setShowSuggestions(true);
          setHighlightedIdx(-1);
        }
      } catch {
        // ignore
      }
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (location.trim()) params.set("location", location.trim());
    router.push(`/jobs?${params.toString()}`);
  };

  const handleSuggestionClick = (s: Suggestion) => {
    setShowSuggestions(false);
    router.push(s.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIdx((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && highlightedIdx >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[highlightedIdx]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl shadow-xl p-2 sm:p-3 flex flex-col sm:flex-row gap-2 border border-slate-200">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 sm:border-r sm:border-slate-200">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="Job title, skill, or keyword"
              className="flex-1 bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div className="flex-1 flex items-center gap-2 px-3 py-2">
            <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Country or city"
              className="flex-1 bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <Button type="submit" size="lg" className="sm:w-auto w-full">
            <Search className="w-4 h-4" />
            <span>Search Jobs</span>
          </Button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-medium text-slate-600">Smart suggestions</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(s)}
                onMouseEnter={() => setHighlightedIdx(i)}
                className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 text-sm hover:bg-emerald-50 ${
                  highlightedIdx === i ? "bg-emerald-50" : ""
                }`}
              >
                <span className="text-slate-900">{s.label}</span>
                <span className="text-xs text-slate-500 uppercase">{s.type}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

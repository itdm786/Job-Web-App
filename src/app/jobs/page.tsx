import { Suspense } from "react";
import { JobsSearchClient } from "./JobsSearchClient";
import { db } from "@/db";
import { countries, categories, jobTypes, cities, states } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search Jobs",
  description: "Search millions of jobs across 190+ countries with advanced filters.",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  // Load filter options
  const [countryList, categoryList, jobTypeList] = await Promise.all([
    db.select().from(countries).where(eq(countries.active, true)).orderBy(asc(countries.name)),
    db.select().from(categories).where(eq(categories.active, true)).orderBy(asc(categories.name)),
    db.select().from(jobTypes).where(eq(jobTypes.active, true)).orderBy(asc(jobTypes.name)),
  ]);

  // Resolve initial country: either explicit ?country= or derived from ?location= or ?city=
  let selectedCountryName = typeof sp.country === "string" ? sp.country : undefined;
  let resolvedCityName = typeof sp.city === "string" ? sp.city : undefined;
  const locationParam = typeof sp.location === "string" ? sp.location.trim() : "";

  // If location is provided but no explicit country/city, try to resolve it
  if (locationParam && !selectedCountryName && !resolvedCityName) {
    // Try exact country match first
    const [countryMatch] = await db
      .select({ name: countries.name })
      .from(countries)
      .where(eq(countries.name, locationParam))
      .limit(1);
    if (countryMatch) {
      selectedCountryName = countryMatch.name;
    } else {
      // Try case-insensitive country match
      const [countryIlike] = await db
        .select({ name: countries.name })
        .from(countries)
        .where(sql`lower(${countries.name}) = lower(${locationParam})`)
        .limit(1);
      if (countryIlike) {
        selectedCountryName = countryIlike.name;
      } else {
        // Try as city name - find city and its country
        const [cityMatch] = await db
          .select({
            cityName: cities.name,
            countryName: countries.name,
          })
          .from(cities)
          .innerJoin(states, eq(cities.stateId, states.id))
          .innerJoin(countries, eq(states.countryId, countries.id))
          .where(sql`lower(${cities.name}) = lower(${locationParam})`)
          .limit(1);
        if (cityMatch) {
          selectedCountryName = cityMatch.countryName;
          resolvedCityName = cityMatch.cityName;
        }
      }
    }
  }

  // Get cities for selected country
  let cityList: any[] = [];
  if (selectedCountryName) {
    const [country] = await db.select().from(countries).where(eq(countries.name, selectedCountryName)).limit(1);
    if (country) {
      cityList = await db
        .select({ id: cities.id, name: cities.name })
        .from(cities)
        .innerJoin(states, eq(cities.stateId, states.id))
        .where(eq(states.countryId, country.id))
        .orderBy(asc(cities.name))
        .limit(100);
    }
  }

  const initialFilters = {
    q: typeof sp.q === "string" ? sp.q : "",
    country: selectedCountryName || "",
    city: resolvedCityName || "",
    category: typeof sp.category === "string" ? sp.category : "",
    sector: typeof sp.sector === "string" ? sp.sector : "",
    workModes: typeof sp.workModes === "string" ? sp.workModes.split(",").filter(Boolean) : [],
    jobTypes: typeof sp.jobTypes === "string" ? sp.jobTypes.split(",").filter(Boolean) : [],
    experience: typeof sp.experience === "string" ? sp.experience : "",
    postedWithin: typeof sp.postedWithin === "string" ? sp.postedWithin : "",
    isGovernment: sp.isGovernment === "true",
    isRemote: sp.isRemote === "true",
    sort: (typeof sp.sort === "string" ? sp.sort : "relevance") as any,
    location: locationParam,
  };

  return (
    <Suspense fallback={<JobsLoadingState />}>
      <JobsSearchClient
        initialFilters={initialFilters}
        countries={countryList}
        categories={categoryList}
        jobTypes={jobTypeList}
        cities={cityList}
      />
    </Suspense>
  );
}

function JobsLoadingState() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-6">
        <div className="hidden lg:block w-72 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-slate-200 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="flex-1 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-40 bg-slate-200 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

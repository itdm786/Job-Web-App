import { NextRequest } from "next/server";
import { searchJobs } from "@/lib/search";
import { success, error } from "@/lib/api";
import { db } from "@/db";
import { countries, categories, states, cities } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  // Resolve country/city by name if needed
  let countryId = sp.get("countryId") || undefined;
  let resolvedCountryName: string | undefined;
  const countryName = sp.get("country");
  if (!countryId && countryName) {
    // Strict match (exact name) - prevents accidental cross-country leakage
    const [c] = await db.select().from(countries).where(eq(countries.name, countryName)).limit(1);
    if (c) {
      countryId = c.id;
      resolvedCountryName = c.name;
    } else {
      // Fallback: case-insensitive
      const [c2] = await db
        .select()
        .from(countries)
        .where(sql`lower(${countries.name}) = lower(${countryName})`)
        .limit(1);
      if (c2) {
        countryId = c2.id;
        resolvedCountryName = c2.name;
      }
    }
  } else if (countryId) {
    const [c] = await db.select().from(countries).where(eq(countries.id, countryId)).limit(1);
    if (c) resolvedCountryName = c.name;
  }

  let cityId = sp.get("cityId") || undefined;
  let resolvedCityName: string | undefined;
  const cityName = sp.get("city");
  if (!cityId && cityName) {
    // Only match cities that belong to the selected country (if any)
    let query = db
      .select({ id: cities.id, name: cities.name })
      .from(cities)
      .innerJoin(states, eq(cities.stateId, states.id))
      .$dynamic();
    if (countryId) {
      query = query.where(sql`lower(${cities.name}) = lower(${cityName}) AND ${states.countryId} = ${countryId}`) as any;
    } else {
      query = query.where(sql`lower(${cities.name}) = lower(${cityName})`) as any;
    }
    const results = await (query as any).limit(1);
    const c = results[0];
    if (c) {
      cityId = c.id;
      resolvedCityName = c.name;
    }
  }

  let categoryId = sp.get("categoryId") || undefined;
  const categorySlug = sp.get("category");
  if (!categoryId && categorySlug) {
    const [c] = await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1);
    if (c) categoryId = c.id;
  }

  const filters = {
    q: sp.get("q") || undefined,
    countryId,
    cityId,
    categoryId,
    sector: sp.get("sector") || undefined,
    experience: sp.get("experience") || undefined,
    minSalary: sp.get("minSalary") ? Number(sp.get("minSalary")) : undefined,
    maxSalary: sp.get("maxSalary") ? Number(sp.get("maxSalary")) : undefined,
    postedWithin: sp.get("postedWithin") ? Number(sp.get("postedWithin")) : undefined,
    isGovernment: sp.get("isGovernment") === "true",
    isRemote: sp.get("isRemote") === "true",
    sort: (sp.get("sort") as any) || "relevance",
    page: sp.get("page") ? Number(sp.get("page")) : 1,
    pageSize: sp.get("pageSize") ? Number(sp.get("pageSize")) : 20,
    jobTypeIds: sp.get("jobTypes")?.split(",").filter(Boolean) || undefined,
    workModes: sp.get("workModes")?.split(",").filter(Boolean) || undefined,
  };

  try {
    const result = await searchJobs(filters);
    return success(result);
  } catch (err: any) {
    return error(err.message || "Search failed", 500);
  }
}

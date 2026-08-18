import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, companies } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  if (q.length < 1) return NextResponse.json({ suggestions: [] });

  try {
    // Query distinct titles, cities, departments, organizations, companies that match
    const titleResults = await db.execute(sql`
      SELECT DISTINCT title as value, 'title' as type FROM jobs WHERE title ILIKE ${'%' + q + '%'} LIMIT 5
    `);
    const cityResults = await db.execute(sql`
      SELECT DISTINCT city as value, 'city' as type FROM jobs WHERE city ILIKE ${'%' + q + '%'} LIMIT 5
    `);
    const deptResults = await db.execute(sql`
      SELECT DISTINCT department as value, 'department' as type FROM jobs WHERE department ILIKE ${'%' + q + '%'} AND department IS NOT NULL LIMIT 5
    `);
    const orgResults = await db.execute(sql`
      SELECT DISTINCT organization_name as value, 'organization' as type FROM jobs WHERE organization_name ILIKE ${'%' + q + '%'} AND organization_name IS NOT NULL LIMIT 5
    `);
    const compResults = await db.execute(sql`
      SELECT DISTINCT name as value, 'company' as type FROM companies WHERE name ILIKE ${'%' + q + '%'} LIMIT 5
    `);

    const suggestions = [
      ...titleResults.rows.map((r: any) => ({ label: r.value, value: r.value, type: r.type, icon: "💼" })),
      ...cityResults.rows.map((r: any) => ({ label: r.value, value: r.value, type: r.type, icon: "📍" })),
      ...deptResults.rows.map((r: any) => ({ label: r.value, value: r.value, type: r.type, icon: "🏛️" })),
      ...orgResults.rows.map((r: any) => ({ label: r.value, value: r.value, type: r.type, icon: "🏢" })),
      ...compResults.rows.map((r: any) => ({ label: r.value, value: r.value, type: r.type, icon: "🏭" })),
    ].slice(0, 10);

    // If DB empty, fallback to static
    if (suggestions.length === 0) {
      const staticData = [
        { label: "Software Engineer", value: "Software Engineer", type: "title", icon: "💼" },
        { label: "Government Teacher", value: "Teacher", type: "title", icon: "💼" },
        { label: "Islamabad", value: "Islamabad", type: "city", icon: "📍" },
        { label: "Dubai", value: "Dubai", type: "city", icon: "📍" },
        { label: "Federal Government", value: "Federal Government", type: "department", icon: "🏛️" },
      ].filter(s => s.value.toLowerCase().includes(q.toLowerCase()));
      return NextResponse.json({ suggestions: staticData });
    }

    return NextResponse.json({ suggestions });
  } catch (e: any) {
    console.error(e);
    // fallback
    return NextResponse.json({ suggestions: [] });
  }
}

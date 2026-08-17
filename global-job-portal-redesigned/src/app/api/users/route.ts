import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db.select().from(users).orderBy(desc(users.createdAt)).limit(100);
    return NextResponse.json({ users: result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

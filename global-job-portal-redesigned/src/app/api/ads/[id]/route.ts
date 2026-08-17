import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ads } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const updated = await db.update(ads).set({ status: body.status }).where(eq(ads.id, id)).returning();
    return NextResponse.json({ ad: updated[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

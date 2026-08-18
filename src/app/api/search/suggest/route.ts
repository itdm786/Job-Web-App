import { NextRequest } from "next/server";
import { getSearchSuggestions } from "@/lib/search";
import { success, error } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  if (q.length < 2) return success([]);
  try {
    const suggestions = await getSearchSuggestions(q);
    return success(suggestions);
  } catch (err: any) {
    return error(err.message || "Failed to fetch suggestions", 500);
  }
}

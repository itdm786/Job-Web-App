import { getCurrentUser, getUserProfile } from "@/lib/auth";
import { success, unauthorized } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const profile = await getUserProfile(user.id);
  return success({ ...user, profile });
}

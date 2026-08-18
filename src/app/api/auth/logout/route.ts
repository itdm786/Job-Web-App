import { clearSession } from "@/lib/auth";
import { success } from "@/lib/api";

export async function POST() {
  await clearSession();
  return success({ message: "Logged out" });
}

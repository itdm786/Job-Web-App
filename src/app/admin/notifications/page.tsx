import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { SendNotificationsForm } from "./SendNotificationsForm";
import { Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) redirect("/dashboard");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Send Notification</h1>
          <p className="text-sm text-slate-600">Broadcast messages to users across the platform</p>
        </div>
      </div>
      <SendNotificationsForm />
    </div>
  );
}

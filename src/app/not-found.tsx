import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-slate-300 mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h1>
        <p className="text-slate-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/">
            <Button>
              <Home className="w-4 h-4" />
              Go home
            </Button>
          </Link>
          <Link href="/jobs">
            <Button variant="outline">
              <Search className="w-4 h-4" />
              Browse jobs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

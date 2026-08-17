import Navbar from "@/components/Navbar";
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-bold">Terms of Service & Cookie Policy</h1>
        <div className="mt-6 prose prose-slate text-sm">
          <p>By using GlobalJobs portal, you agree to our terms. All job posts must be legitimate. Employers must provide accurate organization details. Government jobs must follow respective country's official notification norms.</p>
          <h3>Cookies</h3>
          <p>We use cookies for auth (Gmail OAuth), language preference, saved filters. You can manage in browser.</p>
          <h3>Advertisements</h3>
          <p>Ads are reviewed. Country targeting ensures relevance. No misleading ads. Budget and targeting respected.</p>
          <h3>Limitation</h3>
          <p>We are not responsible for hiring decisions. Platform is Indeed-like aggregator with approval workflow.</p>
        </div>
      </div>
    </div>
  );
}

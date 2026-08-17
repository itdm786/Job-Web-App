import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 lg:px-6 py-10">
        <h1 className="text-3xl font-bold">Privacy Policy, Terms & Content Moderation</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: 2026 • GDPR compliant • Multi-country compliance</p>

        <div className="mt-8 prose prose-slate">
          <h2>1. Platform Overview</h2>
          <p>GlobalJobs is a multi-country job portal serving government and private jobs. We support Pakistan, USA, India, UAE, UK, Saudi Arabia, Canada, Germany, Australia and more. Every job post goes through Pending Review until Admin/Manager approves — ensuring quality and compliance.</p>

          <h2>2. Data Collection</h2>
          <p>We collect email, name, resume, skills, experience via Gmail OAuth (NextAuth/Firebase in production). Resumes stored on AWS S3 / Cloudinary with visibility controls.</p>

          <h2>3. Job Posting Policy</h2>
          <ul>
            <li>No scam, fake, illegal content — auto-flag keywords detection and manual admin review.</li>
            <li>Government jobs must mention department, country-specific eligibility.</li>
            <li>Country + Job Nature filter ensures precise results (e.g. Pakistan + Government = only Pakistan gov jobs).</li>
            <li>Reporting: Any user can report job/ad/blog. Reports reviewed per this policy.</li>
          </ul>

          <h2>4. Advertisement System</h2>
          <p>Advertisers apply with ID, request approval. Ads are country-targeted (e.g. Pakistan-only ad shows only to Pakistan users). Zones: homepage_banner, sidebar, in_between, search_top. Budget, impressions, clicks tracked.</p>

          <h2>5. Blog Content</h2>
          <p>Rich text editor (TipTap/CKEditor) with images, videos, embeds, AI-assisted generation via API. Workflow: Editor writes → Review → Publisher publishes. SEO fields, categories/tags, multi-language.</p>

          <h2>6. Multi-Language</h2>
          <p>UI, jobs, blogs translatable: English, Urdu, Hindi, Arabic, Spanish, French. Language switcher top nav. Employer selects language when posting.</p>

          <h2>7. Role-Based Access</h2>
          <ul>
            <li><strong>Super Admin:</strong> full control</li>
            <li><strong>Manager:</strong> approve jobs, manage employers</li>
            <li><strong>Editor:</strong> write/edit blogs</li>
            <li><strong>Publisher:</strong> publish blogs</li>
            <li><strong>Custom Roles:</strong> Admin creates new roles and assigns custom permissions (manage_jobs, manage_users, manage_blogs, manage_ads, manage_roles, etc.)</li>
          </ul>

          <h2>8. Content Moderation & Reporting</h2>
          <p>Auto-flag, manual review, user reporting. Violating content removed. Clear Terms of Service, Cookie Policy.</p>

          <h2>9. Contact</h2>
          <p>For privacy concerns: privacy@globaljobs.example</p>
        </div>

        <div className="mt-10 flex gap-3">
          <Link href="/terms" className="rounded-full bg-slate-900 px-5 py-2 text-sm text-white">Terms of Service</Link>
          <Link href="/" className="rounded-full border px-5 py-2 text-sm">Back Home</Link>
        </div>
      </div>
    </div>
  );
}

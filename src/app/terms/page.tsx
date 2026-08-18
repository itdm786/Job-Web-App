import { Card } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms of Service</h1>
      <Card className="p-8 rich-content">
        <p className="text-sm text-slate-500 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using GlobalHire, you agree to be bound by these Terms of Service. If you do not agree, do not use our platform.</p>

        <h2>2. User Accounts</h2>
        <p>You must provide accurate information when creating an account and are responsible for maintaining the security of your account credentials.</p>

        <h2>3. Job Postings</h2>
        <p>Employers are responsible for the accuracy and legality of their job postings. All job posts are subject to review and approval by our moderation team.</p>

        <h2>4. Prohibited Conduct</h2>
        <p>You may not use GlobalHire for any unlawful purpose, to post discriminatory job listings, to submit fraudulent applications, or to harass other users.</p>

        <h2>5. Intellectual Property</h2>
        <p>GlobalHire's platform, branding, and technology are our intellectual property. You retain ownership of content you post, but grant us a license to display it on the platform.</p>

        <h2>6. Limitation of Liability</h2>
        <p>GlobalHire is a platform connecting job seekers and employers. We are not a party to any employment relationship and are not liable for disputes between users.</p>

        <h2>7. Termination</h2>
        <p>We may suspend or terminate accounts that violate these terms or engage in fraudulent activity.</p>

        <h2>8. Changes to Terms</h2>
        <p>We may update these terms from time to time. Continued use of the platform constitutes acceptance of the updated terms.</p>
      </Card>
    </div>
  );
}

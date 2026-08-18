import { Card } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
      <Card className="p-8 rich-content">
        <p className="text-sm text-slate-500 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly to us, such as when you create an account, post a job, submit a job application, or contact us. This includes your name, email address, profile information, resume, and job preferences.</p>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to provide, maintain, and improve our services, to match you with relevant job opportunities, and to communicate with you about jobs, applications, and platform updates.</p>

        <h2>3. Information Sharing</h2>
        <p>We share your information with employers when you apply to their jobs, with service providers who help us operate our platform, and as required by law. We never sell your personal information.</p>

        <h2>4. Data Security</h2>
        <p>We implement industry-standard security measures including encryption, secure authentication, and regular security audits to protect your information.</p>

        <h2>5. Your Rights</h2>
        <p>You have the right to access, update, or delete your personal information at any time through your account settings. You can also request a copy of your data or request account deletion.</p>

        <h2>6. Cookies</h2>
        <p>We use cookies to maintain your session, remember your preferences, and analyze how our platform is used. You can control cookies through your browser settings.</p>

        <h2>7. Contact Us</h2>
        <p>If you have questions about this Privacy Policy, please contact us at privacy@globalhire.app.</p>
      </Card>
    </div>
  );
}

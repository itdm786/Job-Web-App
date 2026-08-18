import Link from "next/link";
import { Briefcase, Globe2, MessageCircle, Users, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg text-white">GlobalHire</div>
                <div className="text-[10px] text-slate-400 -mt-0.5">Global Jobs Platform</div>
              </div>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm mb-4">
              The world's most advanced global job portal. Connecting talent with opportunity across 190+ countries.
            </p>
            <div className="flex gap-3">
              <SocialIcon icon={MessageCircle} href="#" />
              <SocialIcon icon={Users} href="#" />
              <SocialIcon icon={Globe2} href="#" />
              <SocialIcon icon={Mail} href="#" />
            </div>
          </div>
          <FooterCol title="Job Seekers" links={[
            { href: "/jobs", label: "Browse Jobs" },
            { href: "/companies", label: "Companies" },
            { href: "/government", label: "Government Jobs" },
            { href: "/remote", label: "Remote Jobs" },
            { href: "/blog", label: "Career Advice" },
          ]} />
          <FooterCol title="Employers" links={[
            { href: "/employers", label: "Post a Job" },
            { href: "/employers/pricing", label: "Pricing" },
            { href: "/employers/solutions", label: "Solutions" },
            { href: "/employers/resources", label: "Resources" },
          ]} />
          <FooterCol title="Company" links={[
            { href: "/about", label: "About Us" },
            { href: "/contact", label: "Contact" },
            { href: "/privacy", label: "Privacy Policy" },
            { href: "/terms", label: "Terms of Service" },
            { href: "/cookies", label: "Cookie Policy" },
          ]} />
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} GlobalHire. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-slate-400">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/cookies" className="hover:text-white">Cookies</Link>
            <Link href="/guidelines" className="hover:text-white">Guidelines</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: Array<{ href: string; label: string }> }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white mb-3">{title}</h3>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-slate-400 hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ icon: Icon, href }: { icon: any; href: string }) {
  return (
    <a href={href} className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center">
      <Icon className="w-4 h-4" />
    </a>
  );
}

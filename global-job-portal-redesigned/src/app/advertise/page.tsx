"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { COUNTRIES, AD_ZONES } from "@/lib/constants";

export default function AdvertisePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ title: "", description: "", imageUrl: "", linkUrl: "", countryTarget: "Pakistan", zone: "homepage_banner", budget: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { alert("Login as advertiser"); return; }
    const res = await fetch("/api/ads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ advertiserId: user.id, ...form }) });
    const data = await res.json();
    if (res.ok) alert(`Ad submitted! Status: ${data.ad.status} — Pending admin approval. Country-targeting: ${form.countryTarget}`);
    else alert(data.error);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 lg:px-6 py-8 grid md:grid-cols-2 gap-8">
        <div>
          <h1 className="text-3xl font-bold">Advertise — Country-wise Targeting</h1>
          <p className="mt-2 text-sm text-slate-600">Advertiser signup → ID create → request → review/approval → live per country. Like Google Ads but for job portal zones.</p>
          <div className="mt-6 space-y-3">
            <div className="rounded-2xl bg-white border p-4"><div className="font-bold text-sm">Placement Zones</div><div className="mt-2 grid grid-cols-2 gap-2 text-xs">{AD_ZONES.map(z => <div key={z.value} className="rounded-xl bg-slate-50 p-3"><div className="font-bold">{z.label}</div><div className="text-slate-500">{z.value}</div></div>)}</div></div>
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4"><div className="font-bold text-xs">How targeting works</div><div className="text-[11px] mt-1">If you choose Pakistan, ad shows only to users who selected Pakistan or browsing Pakistan jobs. Same for UAE, USA etc. Admin approves each campaign.</div></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-6 space-y-4">
          <h2 className="font-bold">Create Ad Campaign</h2>
          <div><label className="text-xs font-semibold">Title</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm" placeholder="e.g. Free CV Review in Pakistan" /></div>
          <div><label className="text-xs font-semibold">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm" /></div>
          <div><label className="text-xs font-semibold">Image URL</label><input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." className="mt-1 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm" /></div>
          <div><label className="text-xs font-semibold">Link URL</label><input value={form.linkUrl} onChange={e => setForm({ ...form, linkUrl: e.target.value })} placeholder="https://your-site.com" className="mt-1 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold">Country Target</label><select value={form.countryTarget} onChange={e => setForm({ ...form, countryTarget: e.target.value })} className="mt-1 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm">{COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}<option value="">Global (All)</option></select></div>
            <div><label className="text-xs font-semibold">Zone</label><select value={form.zone} onChange={e => setForm({ ...form, zone: e.target.value })} className="mt-1 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm">{AD_ZONES.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}</select></div>
          </div>
          <div><label className="text-xs font-semibold">Budget ($)</label><input value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} type="number" className="mt-1 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm" /></div>
          <button type="submit" className="w-full rounded-full bg-slate-900 py-3 text-sm font-bold text-white">Submit for Approval</button>
          <div className="text-[11px] text-slate-500 text-center">Status → Pending Review until admin approves. Then impressions/clicks tracked.</div>
        </form>
      </div>
    </div>
  );
}

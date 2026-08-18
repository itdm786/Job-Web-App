export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr" },
  { code: "ur", name: "Urdu", nativeName: "اردو", dir: "rtl" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", dir: "ltr" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

// Simple translation dictionary. Keys are dot-separated paths.
const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    "site.name": "GlobalHire",
    "site.tagline": "Find Your Next Opportunity, Anywhere in the World",
    "hero.title": "Find Your Next Opportunity",
    "hero.subtitle":
      "Discover millions of jobs across 190+ countries. From government positions to remote roles at top companies.",
    "hero.search_placeholder": "Job title, skill, or keyword",
    "hero.location_placeholder": "Country or city",
    "hero.search": "Search Jobs",
    "hero.post_job": "Post a Job",
    "nav.jobs": "Jobs",
    "nav.companies": "Companies",
    "nav.government": "Government Jobs",
    "nav.remote": "Remote Jobs",
    "nav.blog": "Career Resources",
    "nav.employers": "For Employers",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    "nav.post_job": "Post a Job",
    "filters.title": "Filters",
    "filters.country": "Country",
    "filters.city": "City",
    "filters.category": "Category",
    "filters.sector": "Job Sector",
    "filters.type": "Job Type",
    "filters.work_mode": "Work Mode",
    "filters.experience": "Experience",
    "filters.salary": "Salary Range",
    "filters.posted": "Date Posted",
    "filters.clear": "Clear All",
    "filters.apply": "Apply Filters",
    "jobs.found": "{count} jobs found",
    "jobs.save": "Save Job",
    "jobs.saved": "Saved",
    "jobs.apply": "Apply Now",
    "jobs.view": "View Details",
    "jobs.badge.government": "Verified Government Job",
    "jobs.badge.verified": "Verified Employer",
    "jobs.badge.featured": "Featured",
    "common.loading": "Loading...",
    "common.error": "Something went wrong",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.submit": "Submit",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "popular.government": "Government Jobs",
    "popular.remote": "Remote Jobs",
    "popular.software": "Software Engineer",
    "popular.marketing": "Marketing",
    "popular.healthcare": "Healthcare",
    "popular.teaching": "Teaching",
    "popular.banking": "Banking",
    "popular.engineering": "Engineering",
  },
  ur: {
    "site.name": "گلوبل ہائر",
    "site.tagline": "دنیا میں کہیں بھی اپنا اگلا موقع تلاش کریں",
    "hero.title": "اپنا اگلا موقع تلاش کریں",
    "hero.subtitle":
      "190 سے زیادہ ممالک میں لاکھوں نوکریاں دریافت کریں۔ سرکاری عہدوں سے لے کر ٹاپ کمپنیوں میں ریموٹ کردار تک۔",
    "hero.search_placeholder": "عہدے کا نام، مہارت، یا کلیدی لفظ",
    "hero.location_placeholder": "ملک یا شہر",
    "hero.search": "نوکریاں تلاش کریں",
    "hero.post_job": "نوکری پوسٹ کریں",
    "nav.jobs": "نوکریاں",
    "nav.companies": "کمپنیاں",
    "nav.government": "سرکاری نوکریاں",
    "nav.remote": "ریموٹ نوکریاں",
    "nav.blog": "کیریئر وسائل",
    "nav.employers": "آجروں کے لیے",
    "nav.login": "لاگ ان",
    "nav.signup": "سائن اپ",
    "nav.post_job": "نوکری پوسٹ کریں",
    "filters.title": "فلٹرز",
    "filters.country": "ملک",
    "filters.city": "شہر",
    "filters.category": "زمرہ",
    "filters.sector": "نوکری کا شعبہ",
    "filters.type": "نوکری کی قسم",
    "filters.work_mode": "کام کا طریقہ",
    "filters.experience": "تجربہ",
    "filters.salary": "تنخواہ کی حد",
    "filters.posted": "پوسٹ کی تاریخ",
    "filters.clear": "سب صاف کریں",
    "filters.apply": "فلٹرز لاگو کریں",
    "common.loading": "لوڈ ہو رہا ہے...",
    "common.save": "محفوظ کریں",
    "common.cancel": "منسوخ",
    "common.submit": "جمع کرائیں",
  },
  hi: {
    "site.name": "ग्लोबलहायर",
    "site.tagline": "दुनिया में कहीं भी अपना अगला अवसर खोजें",
    "hero.title": "अपना अगला अवसर खोजें",
    "hero.subtitle":
      "190 से अधिक देशों में लाखों नौकरियाँ खोजें। सरकारी पदों से लेकर शीर्ष कंपनियों में रिमोट भूमिकाओं तक।",
    "hero.search_placeholder": "पद का नाम, कौशल, या कीवर्ड",
    "hero.location_placeholder": "देश या शहर",
    "hero.search": "नौकरियाँ खोजें",
    "hero.post_job": "नौकरी पोस्ट करें",
    "nav.jobs": "नौकरियाँ",
    "nav.companies": "कंपनियाँ",
    "nav.government": "सरकारी नौकरियाँ",
    "nav.remote": "रिमोट नौकरियाँ",
    "nav.blog": "करियर संसाधन",
    "nav.employers": "नियोक्ताओं के लिए",
    "nav.login": "लॉगिन",
    "nav.signup": "साइन अप",
    "nav.post_job": "नौकरी पोस्ट करें",
    "filters.title": "फ़िल्टर",
    "filters.country": "देश",
    "filters.city": "शहर",
    "filters.category": "श्रेणी",
    "common.save": "सहेजें",
    "common.cancel": "रद्द करें",
    "common.submit": "जमा करें",
  },
};

export function t(key: string, lang: LanguageCode = "en", vars?: Record<string, string | number>): string {
  const dict = translations[lang] || translations.en;
  let value = dict[key] || translations.en[key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return value;
}

export function getDir(lang: LanguageCode): "ltr" | "rtl" {
  const l = SUPPORTED_LANGUAGES.find((x) => x.code === lang);
  return (l?.dir as "ltr" | "rtl") || "ltr";
}

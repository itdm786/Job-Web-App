export const COUNTRIES = [
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
];

export const JOB_NATURES = [
  { value: "government", label: "Government", color: "emerald" },
  { value: "private", label: "Private", color: "blue" },
];

export const EMPLOYMENT_TYPES = [
  "full-time",
  "part-time",
  "contract",
  "remote",
  "internship",
];

export const CATEGORIES = [
  "Information Technology",
  "Healthcare",
  "Education",
  "Engineering",
  "Finance",
  "Government Administration",
  "Defense",
  "Sales & Marketing",
  "HR & Recruitment",
  "Construction",
  "Legal",
  "Customer Service",
];

export const DEPARTMENTS = [
  "Federal Government",
  "Provincial Government",
  "Municipal Corporation",
  "Ministry of Education",
  "Ministry of Health",
  "Ministry of Finance",
  "Railways",
  "Police Department",
  "Judiciary",
  "Armed Forces",
  "Public Works",
  "IT Department",
];

export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  Pakistan: ["Islamabad", "Lahore", "Karachi", "Peshawar", "Quetta", "Faisalabad", "Rawalpindi", "Multan"],
  "United States": ["New York", "San Francisco", "Washington DC", "Austin", "Seattle", "Chicago", "Los Angeles"],
  India: ["New Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune"],
  UAE: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman"],
  "United Kingdom": ["London", "Manchester", "Birmingham", "Edinburgh"],
  "Saudi Arabia": ["Riyadh", "Jeddah", "Dammam"],
  Canada: ["Toronto", "Vancouver", "Montreal"],
  Germany: ["Berlin", "Munich", "Hamburg"],
  Australia: ["Sydney", "Melbourne", "Brisbane"],
};

export const ALL_CITIES = Object.values(CITIES_BY_COUNTRY).flat();

export const SALARY_RANGES = [
  { label: "Any", min: 0, max: 9999999 },
  { label: "$0 - $1000", min: 0, max: 1000 },
  { label: "$1000 - $3000", min: 1000, max: 3000 },
  { label: "$3000 - $7000", min: 3000, max: 7000 },
  { label: "$7000+", min: 7000, max: 9999999 },
];

export const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ur", name: "اردو", flag: "🇵🇰" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

export const AD_ZONES = [
  { value: "homepage_banner", label: "Homepage Banner" },
  { value: "sidebar", label: "Sidebar" },
  { value: "in_between", label: "In-between Listings" },
  { value: "search_top", label: "Search Top" },
];

export const PERMISSIONS_LIST = [
  "manage_jobs",
  "manage_users",
  "manage_blogs",
  "manage_ads",
  "manage_roles",
  "view_analytics",
  "manage_settings",
  "approve_content",
  "publish_blogs",
];

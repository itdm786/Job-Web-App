import "dotenv/config";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { db } from "./index";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await db.execute(sql`
    TRUNCATE
      users, roles, permissions, role_permissions, user_roles,
      profiles, skills, user_skills, experiences, education,
      companies, company_users, company_verifications,
      government_organizations,
      countries, states, cities, areas, offices,
      categories, job_types,
      jobs, job_skills, job_applications, saved_jobs, saved_searches, job_alerts,
      advertisements,
      blog_categories, blog_tags, blogs, blog_post_tags,
      reports, notifications, messages,
      audit_logs, settings, translations
    CASCADE
  `);

  // Countries - comprehensive global coverage
  const countriesData = [
    // South Asia
    { name: "Pakistan", code: "PK", flag: "🇵🇰", currency: "PKR" },
    { name: "India", code: "IN", flag: "🇮🇳", currency: "INR" },
    { name: "Bangladesh", code: "BD", flag: "🇧🇩", currency: "BDT" },
    { name: "Sri Lanka", code: "LK", flag: "🇱🇰", currency: "LKR" },
    { name: "Nepal", code: "NP", flag: "🇳🇵", currency: "NPR" },
    { name: "Afghanistan", code: "AF", flag: "🇦🇫", currency: "AFN" },
    { name: "Bhutan", code: "BT", flag: "🇧🇹", currency: "BTN" },
    { name: "Maldives", code: "MV", flag: "🇲🇻", currency: "MVR" },

    // East Asia
    { name: "China", code: "CN", flag: "🇨🇳", currency: "CNY" },
    { name: "Japan", code: "JP", flag: "🇯🇵", currency: "JPY" },
    { name: "South Korea", code: "KR", flag: "🇰🇷", currency: "KRW" },
    { name: "Taiwan", code: "TW", flag: "🇹🇼", currency: "TWD" },
    { name: "Hong Kong", code: "HK", flag: "🇭🇰", currency: "HKD" },
    { name: "Mongolia", code: "MN", flag: "🇲🇳", currency: "MNT" },

    // Southeast Asia
    { name: "Singapore", code: "SG", flag: "🇸🇬", currency: "SGD" },
    { name: "Malaysia", code: "MY", flag: "🇲🇾", currency: "MYR" },
    { name: "Indonesia", code: "ID", flag: "🇮🇩", currency: "IDR" },
    { name: "Thailand", code: "TH", flag: "🇹🇭", currency: "THB" },
    { name: "Vietnam", code: "VN", flag: "🇻🇳", currency: "VND" },
    { name: "Philippines", code: "PH", flag: "🇵🇭", currency: "PHP" },
    { name: "Myanmar", code: "MM", flag: "🇲🇲", currency: "MMK" },
    { name: "Cambodia", code: "KH", flag: "🇰🇭", currency: "KHR" },
    { name: "Laos", code: "LA", flag: "🇱🇦", currency: "LAK" },
    { name: "Brunei", code: "BN", flag: "🇧🇳", currency: "BND" },

    // Central & West Asia
    { name: "Turkey", code: "TR", flag: "🇹🇷", currency: "TRY" },
    { name: "Kazakhstan", code: "KZ", flag: "🇰🇿", currency: "KZT" },
    { name: "Uzbekistan", code: "UZ", flag: "🇺🇿", currency: "UZS" },
    { name: "Azerbaijan", code: "AZ", flag: "🇦🇿", currency: "AZN" },
    { name: "Georgia", code: "GE", flag: "🇬🇪", currency: "GEL" },
    { name: "Armenia", code: "AM", flag: "🇦🇲", currency: "AMD" },

    // Gulf / Middle East
    { name: "United Arab Emirates", code: "AE", flag: "🇦🇪", currency: "AED" },
    { name: "Saudi Arabia", code: "SA", flag: "🇸🇦", currency: "SAR" },
    { name: "Qatar", code: "QA", flag: "🇶🇦", currency: "QAR" },
    { name: "Kuwait", code: "KW", flag: "🇰🇼", currency: "KWD" },
    { name: "Bahrain", code: "BH", flag: "🇧🇭", currency: "BHD" },
    { name: "Oman", code: "OM", flag: "🇴🇲", currency: "OMR" },
    { name: "Jordan", code: "JO", flag: "🇯🇴", currency: "JOD" },
    { name: "Lebanon", code: "LB", flag: "🇱🇧", currency: "LBP" },
    { name: "Iraq", code: "IQ", flag: "🇮🇶", currency: "IQD" },
    { name: "Egypt", code: "EG", flag: "🇪🇬", currency: "EGP" },

    // Europe - Western
    { name: "United Kingdom", code: "GB", flag: "🇬🇧", currency: "GBP" },
    { name: "Germany", code: "DE", flag: "🇩🇪", currency: "EUR" },
    { name: "France", code: "FR", flag: "🇫🇷", currency: "EUR" },
    { name: "Italy", code: "IT", flag: "🇮🇹", currency: "EUR" },
    { name: "Spain", code: "ES", flag: "🇪🇸", currency: "EUR" },
    { name: "Netherlands", code: "NL", flag: "🇳🇱", currency: "EUR" },
    { name: "Belgium", code: "BE", flag: "🇧🇪", currency: "EUR" },
    { name: "Switzerland", code: "CH", flag: "🇨🇭", currency: "CHF" },
    { name: "Austria", code: "AT", flag: "🇦🇹", currency: "EUR" },
    { name: "Portugal", code: "PT", flag: "🇵🇹", currency: "EUR" },
    { name: "Ireland", code: "IE", flag: "🇮🇪", currency: "EUR" },
    { name: "Luxembourg", code: "LU", flag: "🇱🇺", currency: "EUR" },

    // Europe - Nordic
    { name: "Sweden", code: "SE", flag: "🇸🇪", currency: "SEK" },
    { name: "Norway", code: "NO", flag: "🇳🇴", currency: "NOK" },
    { name: "Denmark", code: "DK", flag: "🇩🇰", currency: "DKK" },
    { name: "Finland", code: "FI", flag: "🇫🇮", currency: "EUR" },
    { name: "Iceland", code: "IS", flag: "🇮🇸", currency: "ISK" },

    // Europe - Eastern
    { name: "Poland", code: "PL", flag: "🇵🇱", currency: "PLN" },
    { name: "Czech Republic", code: "CZ", flag: "🇨🇿", currency: "CZK" },
    { name: "Hungary", code: "HU", flag: "🇭🇺", currency: "HUF" },
    { name: "Romania", code: "RO", flag: "🇷🇴", currency: "RON" },
    { name: "Bulgaria", code: "BG", flag: "🇧🇬", currency: "BGN" },
    { name: "Croatia", code: "HR", flag: "🇭🇷", currency: "EUR" },
    { name: "Slovakia", code: "SK", flag: "🇸🇰", currency: "EUR" },
    { name: "Slovenia", code: "SI", flag: "🇸🇮", currency: "EUR" },
    { name: "Serbia", code: "RS", flag: "🇷🇸", currency: "RSD" },
    { name: "Ukraine", code: "UA", flag: "🇺🇦", currency: "UAH" },
    { name: "Greece", code: "GR", flag: "🇬🇷", currency: "EUR" },
    { name: "Russia", code: "RU", flag: "🇷🇺", currency: "RUB" },

    // North America
    { name: "United States", code: "US", flag: "🇺🇸", currency: "USD" },
    { name: "Canada", code: "CA", flag: "🇨🇦", currency: "CAD" },
    { name: "Mexico", code: "MX", flag: "🇲🇽", currency: "MXN" },

    // Oceania
    { name: "Australia", code: "AU", flag: "🇦🇺", currency: "AUD" },
    { name: "New Zealand", code: "NZ", flag: "🇳🇿", currency: "NZD" },

    // Africa
    { name: "South Africa", code: "ZA", flag: "🇿🇦", currency: "ZAR" },
    { name: "Nigeria", code: "NG", flag: "🇳🇬", currency: "NGN" },
    { name: "Kenya", code: "KE", flag: "🇰🇪", currency: "KES" },
    { name: "Morocco", code: "MA", flag: "🇲🇦", currency: "MAD" },
  ];

  const countryIds: Record<string, string> = {};
  for (const c of countriesData) {
    const id = randomUUID();
    await db.insert(schema.countries).values({ id, ...c });
    countryIds[c.code] = id;
  }

  // States/Provinces/Regions for all countries
  const statesData = [
    // Pakistan
    { name: "Punjab", code: "PB", country: "PK" },
    { name: "Sindh", code: "SD", country: "PK" },
    { name: "Khyber Pakhtunkhwa", code: "KP", country: "PK" },
    { name: "Islamabad Capital Territory", code: "IS", country: "PK" },
    { name: "Balochistan", code: "BA", country: "PK" },
    // India
    { name: "Maharashtra", code: "MH", country: "IN" },
    { name: "Karnataka", code: "KA", country: "IN" },
    { name: "Delhi", code: "DL", country: "IN" },
    { name: "Tamil Nadu", code: "TN", country: "IN" },
    { name: "Telangana", code: "TG", country: "IN" },
    { name: "West Bengal", code: "WB", country: "IN" },
    // Bangladesh
    { name: "Dhaka Division", code: "DH", country: "BD" },
    { name: "Chittagong Division", code: "CT", country: "BD" },
    // Sri Lanka
    { name: "Western Province", code: "WP", country: "LK" },
    // Nepal
    { name: "Bagmati Province", code: "BP", country: "NP" },
    // China
    { name: "Beijing", code: "BJ", country: "CN" },
    { name: "Shanghai", code: "SH", country: "CN" },
    { name: "Guangdong", code: "GD", country: "CN" },
    { name: "Zhejiang", code: "ZJ", country: "CN" },
    // Japan
    { name: "Tokyo", code: "TK", country: "JP" },
    { name: "Osaka", code: "OS", country: "JP" },
    { name: "Kyoto", code: "KT", country: "JP" },
    // South Korea
    { name: "Seoul", code: "SL", country: "KR" },
    { name: "Busan", code: "BS", country: "KR" },
    // Singapore (city-state)
    { name: "Central Region", code: "CR", country: "SG" },
    // Malaysia
    { name: "Kuala Lumpur", code: "KL", country: "MY" },
    { name: "Selangor", code: "SL", country: "MY" },
    { name: "Penang", code: "PG", country: "MY" },
    // Indonesia
    { name: "Jakarta", code: "JK", country: "ID" },
    { name: "Bali", code: "BL", country: "ID" },
    // Thailand
    { name: "Bangkok", code: "BK", country: "TH" },
    { name: "Chiang Mai", code: "CM", country: "TH" },
    // Vietnam
    { name: "Hanoi", code: "HN", country: "VN" },
    { name: "Ho Chi Minh City", code: "HC", country: "VN" },
    // Philippines
    { name: "Metro Manila", code: "MM", country: "PH" },
    { name: "Cebu", code: "CB", country: "PH" },
    // Turkey
    { name: "Istanbul", code: "IS", country: "TR" },
    { name: "Ankara", code: "AN", country: "TR" },
    // Kazakhstan
    { name: "Almaty Region", code: "AL", country: "KZ" },
    { name: "Astana", code: "AS", country: "KZ" },
    // UAE
    { name: "Dubai", code: "DU", country: "AE" },
    { name: "Abu Dhabi", code: "AZ", country: "AE" },
    { name: "Sharjah", code: "SH", country: "AE" },
    // Saudi Arabia
    { name: "Riyadh Region", code: "RY", country: "SA" },
    { name: "Makkah Region", code: "MK", country: "SA" },
    { name: "Eastern Province", code: "EP", country: "SA" },
    // Qatar
    { name: "Doha Municipality", code: "DA", country: "QA" },
    // Kuwait
    { name: "Capital Governorate", code: "KW", country: "KW" },
    // Bahrain
    { name: "Capital Governorate", code: "BH", country: "BH" },
    // Oman
    { name: "Muscat Governorate", code: "MU", country: "OM" },
    // Jordan
    { name: "Amman Governorate", code: "AM", country: "JO" },
    // Egypt
    { name: "Cairo Governorate", code: "CA", country: "EG" },
    // UK
    { name: "England", code: "ENG", country: "GB" },
    { name: "Scotland", code: "SCT", country: "GB" },
    { name: "Wales", code: "WLS", country: "GB" },
    // Germany
    { name: "Berlin", code: "BE", country: "DE" },
    { name: "Bavaria", code: "BY", country: "DE" },
    { name: "North Rhine-Westphalia", code: "NW", country: "DE" },
    { name: "Hesse", code: "HE", country: "DE" },
    // France
    { name: "Île-de-France", code: "ID", country: "FR" },
    { name: "Provence-Alpes-Côte d'Azur", code: "PA", country: "FR" },
    { name: "Auvergne-Rhône-Alpes", code: "AR", country: "FR" },
    // Italy
    { name: "Lazio", code: "LZ", country: "IT" },
    { name: "Lombardy", code: "LM", country: "IT" },
    // Spain
    { name: "Community of Madrid", code: "MD", country: "ES" },
    { name: "Catalonia", code: "CT", country: "ES" },
    // Netherlands
    { name: "North Holland", code: "NH", country: "NL" },
    { name: "South Holland", code: "ZH", country: "NL" },
    // Switzerland
    { name: "Zurich", code: "ZH", country: "CH" },
    { name: "Geneva", code: "GE", country: "CH" },
    // Sweden
    { name: "Stockholm County", code: "ST", country: "SE" },
    // Norway
    { name: "Oslo", code: "OS", country: "NO" },
    // Denmark
    { name: "Capital Region", code: "CR", country: "DK" },
    // Finland
    { name: "Uusimaa", code: "UU", country: "FI" },
    // Poland
    { name: "Masovian", code: "MZ", country: "PL" },
    { name: "Lesser Poland", code: "MA", country: "PL" },
    // Czech Republic
    { name: "Prague", code: "PR", country: "CZ" },
    // Hungary
    { name: "Budapest", code: "BU", country: "HU" },
    // Romania
    { name: "Bucharest", code: "BU", country: "RO" },
    // Greece
    { name: "Attica", code: "AT", country: "GR" },
    // Ireland
    { name: "County Dublin", code: "DU", country: "IE" },
    // Portugal
    { name: "Lisbon", code: "LI", country: "PT" },
    // Belgium
    { name: "Brussels-Capital", code: "BR", country: "BE" },
    // Austria
    { name: "Vienna", code: "WI", country: "AT" },
    // USA
    { name: "California", code: "CA", country: "US" },
    { name: "New York", code: "NY", country: "US" },
    { name: "Texas", code: "TX", country: "US" },
    { name: "Washington", code: "WA", country: "US" },
    // Canada
    { name: "Ontario", code: "ON", country: "CA" },
    { name: "British Columbia", code: "BC", country: "CA" },
    { name: "Quebec", code: "QC", country: "CA" },
    // Australia
    { name: "New South Wales", code: "NSW", country: "AU" },
    { name: "Victoria", code: "VIC", country: "AU" },
    { name: "Queensland", code: "QLD", country: "AU" },
    // New Zealand
    { name: "Auckland", code: "AU", country: "NZ" },
    { name: "Wellington", code: "WE", country: "NZ" },
    // South Africa
    { name: "Gauteng", code: "GT", country: "ZA" },
    { name: "Western Cape", code: "WC", country: "ZA" },
    // Nigeria
    { name: "Lagos", code: "LA", country: "NG" },
    // Kenya
    { name: "Nairobi", code: "NR", country: "KE" },
    // Russia
    { name: "Moscow", code: "MO", country: "RU" },
    { name: "Saint Petersburg", code: "SP", country: "RU" },
  ];

  const stateIds: Record<string, string> = {};
  for (const s of statesData) {
    const id = randomUUID();
    await db.insert(schema.states).values({
      id,
      name: s.name,
      code: s.code,
      countryId: countryIds[s.country],
    });
    stateIds[`${s.country}_${s.name}`] = id;
  }

  // Cities across all regions
  const citiesData = [
    // Pakistan
    { name: "Islamabad", state: "PK_Islamabad Capital Territory" },
    { name: "Lahore", state: "PK_Punjab" },
    { name: "Karachi", state: "PK_Sindh" },
    { name: "Rawalpindi", state: "PK_Punjab" },
    { name: "Peshawar", state: "PK_Khyber Pakhtunkhwa" },
    { name: "Faisalabad", state: "PK_Punjab" },
    { name: "Multan", state: "PK_Punjab" },
    { name: "Quetta", state: "PK_Balochistan" },
    // India
    { name: "Mumbai", state: "IN_Maharashtra" },
    { name: "Pune", state: "IN_Maharashtra" },
    { name: "Bengaluru", state: "IN_Karnataka" },
    { name: "New Delhi", state: "IN_Delhi" },
    { name: "Chennai", state: "IN_Tamil Nadu" },
    { name: "Hyderabad", state: "IN_Telangana" },
    { name: "Kolkata", state: "IN_West Bengal" },
    // Bangladesh
    { name: "Dhaka", state: "BD_Dhaka Division" },
    { name: "Chittagong", state: "BD_Chittagong Division" },
    // Sri Lanka
    { name: "Colombo", state: "LK_Western Province" },
    // Nepal
    { name: "Kathmandu", state: "NP_Bagmati Province" },
    // China
    { name: "Beijing", state: "CN_Beijing" },
    { name: "Shanghai", state: "CN_Shanghai" },
    { name: "Shenzhen", state: "CN_Guangdong" },
    { name: "Hangzhou", state: "CN_Zhejiang" },
    // Japan
    { name: "Tokyo", state: "JP_Tokyo" },
    { name: "Osaka", state: "JP_Osaka" },
    { name: "Kyoto", state: "JP_Kyoto" },
    // South Korea
    { name: "Seoul", state: "KR_Seoul" },
    { name: "Busan", state: "KR_Busan" },
    // Singapore
    { name: "Singapore", state: "SG_Central Region" },
    // Malaysia
    { name: "Kuala Lumpur", state: "MY_Kuala Lumpur" },
    { name: "George Town", state: "MY_Penang" },
    { name: "Petaling Jaya", state: "MY_Selangor" },
    // Indonesia
    { name: "Jakarta", state: "ID_Jakarta" },
    { name: "Denpasar", state: "ID_Bali" },
    // Thailand
    { name: "Bangkok", state: "TH_Bangkok" },
    { name: "Chiang Mai", state: "TH_Chiang Mai" },
    // Vietnam
    { name: "Hanoi", state: "VN_Hanoi" },
    { name: "Ho Chi Minh City", state: "VN_Ho Chi Minh City" },
    // Philippines
    { name: "Manila", state: "PH_Metro Manila" },
    { name: "Cebu City", state: "PH_Cebu" },
    // Turkey
    { name: "Istanbul", state: "TR_Istanbul" },
    { name: "Ankara", state: "TR_Ankara" },
    // Kazakhstan
    { name: "Almaty", state: "KZ_Almaty Region" },
    { name: "Astana", state: "KZ_Astana" },
    // UAE
    { name: "Dubai", state: "AE_Dubai" },
    { name: "Abu Dhabi", state: "AE_Abu Dhabi" },
    { name: "Sharjah", state: "AE_Sharjah" },
    // Saudi Arabia
    { name: "Riyadh", state: "SA_Riyadh Region" },
    { name: "Jeddah", state: "SA_Makkah Region" },
    { name: "Dammam", state: "SA_Eastern Province" },
    // Qatar
    { name: "Doha", state: "QA_Doha Municipality" },
    // Kuwait
    { name: "Kuwait City", state: "KW_Capital Governorate" },
    // Bahrain
    { name: "Manama", state: "BH_Capital Governorate" },
    // Oman
    { name: "Muscat", state: "OM_Muscat Governorate" },
    // Jordan
    { name: "Amman", state: "JO_Amman Governorate" },
    // Egypt
    { name: "Cairo", state: "EG_Cairo Governorate" },
    // UK
    { name: "London", state: "GB_England" },
    { name: "Manchester", state: "GB_England" },
    { name: "Birmingham", state: "GB_England" },
    { name: "Edinburgh", state: "GB_Scotland" },
    { name: "Cardiff", state: "GB_Wales" },
    // Germany
    { name: "Berlin", state: "DE_Berlin" },
    { name: "Munich", state: "DE_Bavaria" },
    { name: "Frankfurt", state: "DE_Hesse" },
    { name: "Cologne", state: "DE_North Rhine-Westphalia" },
    // France
    { name: "Paris", state: "FR_Île-de-France" },
    { name: "Marseille", state: "FR_Provence-Alpes-Côte d'Azur" },
    { name: "Lyon", state: "FR_Auvergne-Rhône-Alpes" },
    // Italy
    { name: "Rome", state: "IT_Lazio" },
    { name: "Milan", state: "IT_Lombardy" },
    // Spain
    { name: "Madrid", state: "ES_Community of Madrid" },
    { name: "Barcelona", state: "ES_Catalonia" },
    // Netherlands
    { name: "Amsterdam", state: "NL_North Holland" },
    { name: "Rotterdam", state: "NL_South Holland" },
    // Switzerland
    { name: "Zurich", state: "CH_Zurich" },
    { name: "Geneva", state: "CH_Geneva" },
    // Sweden
    { name: "Stockholm", state: "SE_Stockholm County" },
    // Norway
    { name: "Oslo", state: "NO_Oslo" },
    // Denmark
    { name: "Copenhagen", state: "DK_Capital Region" },
    // Finland
    { name: "Helsinki", state: "FI_Uusimaa" },
    // Poland
    { name: "Warsaw", state: "PL_Masovian" },
    { name: "Krakow", state: "PL_Lesser Poland" },
    // Czech Republic
    { name: "Prague", state: "CZ_Prague" },
    // Hungary
    { name: "Budapest", state: "HU_Budapest" },
    // Romania
    { name: "Bucharest", state: "RO_Bucharest" },
    // Greece
    { name: "Athens", state: "GR_Attica" },
    // Ireland
    { name: "Dublin", state: "IE_County Dublin" },
    // Portugal
    { name: "Lisbon", state: "PT_Lisbon" },
    // Belgium
    { name: "Brussels", state: "BE_Brussels-Capital" },
    // Austria
    { name: "Vienna", state: "AT_Vienna" },
    // USA
    { name: "Los Angeles", state: "US_California" },
    { name: "San Francisco", state: "US_California" },
    { name: "New York", state: "US_New York" },
    { name: "Seattle", state: "US_Washington" },
    { name: "Austin", state: "US_Texas" },
    // Canada
    { name: "Toronto", state: "CA_Ontario" },
    { name: "Vancouver", state: "CA_British Columbia" },
    { name: "Montreal", state: "CA_Quebec" },
    // Australia
    { name: "Sydney", state: "AU_New South Wales" },
    { name: "Melbourne", state: "AU_Victoria" },
    { name: "Brisbane", state: "AU_Queensland" },
    // New Zealand
    { name: "Auckland", state: "NZ_Auckland" },
    { name: "Wellington", state: "NZ_Wellington" },
    // South Africa
    { name: "Johannesburg", state: "ZA_Gauteng" },
    { name: "Cape Town", state: "ZA_Western Cape" },
    // Nigeria
    { name: "Lagos", state: "NG_Lagos" },
    // Kenya
    { name: "Nairobi", state: "KE_Nairobi" },
    // Russia
    { name: "Moscow", state: "RU_Moscow" },
    { name: "Saint Petersburg", state: "RU_Saint Petersburg" },
  ];

  const cityIds: Record<string, string> = {};
  for (const c of citiesData) {
    const id = randomUUID();
    await db.insert(schema.cities).values({
      id,
      name: c.name,
      stateId: stateIds[c.state],
    });
    cityIds[c.name] = id;
  }

  // Categories
  const categoriesData = [
    { name: "Information Technology", slug: "information-technology", icon: "💻" },
    { name: "Software Development", slug: "software-development", icon: "👨‍💻" },
    { name: "Web Development", slug: "web-development", icon: "🌐" },
    { name: "Mobile Development", slug: "mobile-development", icon: "📱" },
    { name: "Data Science", slug: "data-science", icon: "📊" },
    { name: "Artificial Intelligence", slug: "artificial-intelligence", icon: "🤖" },
    { name: "Cybersecurity", slug: "cybersecurity", icon: "🔒" },
    { name: "Engineering", slug: "engineering", icon: "⚙️" },
    { name: "Healthcare", slug: "healthcare", icon: "🏥" },
    { name: "Medical", slug: "medical", icon: "👨‍⚕️" },
    { name: "Education", slug: "education", icon: "📚" },
    { name: "Teaching", slug: "teaching", icon: "👩‍🏫" },
    { name: "Banking", slug: "banking", icon: "🏦" },
    { name: "Finance", slug: "finance", icon: "💰" },
    { name: "Accounting", slug: "accounting", icon: "🧮" },
    { name: "Marketing", slug: "marketing", icon: "📢" },
    { name: "Digital Marketing", slug: "digital-marketing", icon: "📣" },
    { name: "Sales", slug: "sales", icon: "💼" },
    { name: "Human Resources", slug: "human-resources", icon: "👥" },
    { name: "Construction", slug: "construction", icon: "🏗️" },
    { name: "Architecture", slug: "architecture", icon: "🏛️" },
    { name: "Legal", slug: "legal", icon: "⚖️" },
    { name: "Government", slug: "government", icon: "🏛️" },
    { name: "Administration", slug: "administration", icon: "📋" },
    { name: "Customer Support", slug: "customer-support", icon: "🎧" },
    { name: "Hospitality", slug: "hospitality", icon: "🏨" },
    { name: "Design", slug: "design", icon: "🎨" },
    { name: "Media", slug: "media", icon: "📰" },
    { name: "Logistics", slug: "logistics", icon: "🚚" },
    { name: "Manufacturing", slug: "manufacturing", icon: "🏭" },
    { name: "Research", slug: "research", icon: "🔬" },
  ];

  const categoryIds: Record<string, string> = {};
  for (const cat of categoriesData) {
    const id = randomUUID();
    await db.insert(schema.categories).values({ id, ...cat });
    categoryIds[cat.slug] = id;
  }

  // Job Types
  const jobTypesData = [
    { name: "Full Time", slug: "full-time" },
    { name: "Part Time", slug: "part-time" },
    { name: "Contract", slug: "contract" },
    { name: "Temporary", slug: "temporary" },
    { name: "Internship", slug: "internship" },
    { name: "Freelance", slug: "freelance" },
    { name: "Volunteer", slug: "volunteer" },
  ];

  const jobTypeIds: Record<string, string> = {};
  for (const jt of jobTypesData) {
    const id = randomUUID();
    await db.insert(schema.jobTypes).values({ id, ...jt });
    jobTypeIds[jt.slug] = id;
  }

  // Skills
  const skillsData = [
    "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "Java", "C++",
    "Go", "Rust", "SQL", "PostgreSQL", "MongoDB", "Redis", "AWS", "Azure", "GCP",
    "Docker", "Kubernetes", "Git", "CI/CD", "REST APIs", "GraphQL", "HTML", "CSS",
    "Tailwind CSS", "Vue.js", "Angular", "Swift", "Kotlin", "Flutter", "React Native",
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Data Analysis",
    "Project Management", "Agile", "Scrum", "Communication", "Leadership", "Problem Solving",
  ];

  const skillIds: Record<string, string> = {};
  for (const s of skillsData) {
    const id = randomUUID();
    await db.insert(schema.skills).values({ id, name: s });
    skillIds[s] = id;
  }

  // Roles & Permissions
  const rolesData = [
    { name: "Super Admin", description: "Full platform access" },
    { name: "Admin", description: "Platform administration" },
    { name: "Manager", description: "Module management" },
    { name: "Editor", description: "Content management" },
    { name: "Publisher", description: "Approve and publish" },
    { name: "Moderator", description: "Content moderation" },
    { name: "Employer", description: "Post and manage jobs" },
    { name: "Job Seeker", description: "Search and apply for jobs" },
  ];

  const roleIds: Record<string, string> = {};
  for (const r of rolesData) {
    const id = randomUUID();
    await db.insert(schema.roles).values({ id, ...r });
    roleIds[r.name] = id;
  }

  const permissionsData = [
    "view_users", "create_users", "edit_users", "delete_users", "suspend_users",
    "manage_companies", "verify_companies",
    "create_jobs", "edit_jobs", "approve_jobs", "reject_jobs", "publish_jobs",
    "manage_advertisements", "approve_advertisements",
    "manage_categories", "manage_countries", "manage_locations",
    "manage_blogs", "publish_blogs",
    "manage_reports", "view_analytics", "manage_settings",
  ];

  const permissionIds: Record<string, string> = {};
  for (const p of permissionsData) {
    const id = randomUUID();
    await db.insert(schema.permissions).values({ id, name: p, description: p.replace(/_/g, " ") });
    permissionIds[p] = id;
  }

  // Super Admin gets all permissions
  for (const p of permissionsData) {
    await db.insert(schema.rolePermissions).values({
      roleId: roleIds["Super Admin"],
      permissionId: permissionIds[p],
    });
  }

  // Admin gets most permissions
  const adminPerms = permissionsData.filter((p) => p !== "manage_settings");
  for (const p of adminPerms) {
    await db.insert(schema.rolePermissions).values({
      roleId: roleIds["Admin"],
      permissionId: permissionIds[p],
    });
  }

  // Employer permissions
  for (const p of ["create_jobs", "edit_jobs"]) {
    await db.insert(schema.rolePermissions).values({
      roleId: roleIds["Employer"],
      permissionId: permissionIds[p],
    });
  }

  // Create Super Admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const adminUserId = randomUUID();
  await db.insert(schema.users).values({
    id: adminUserId,
    email: "admin@globalhire.com",
    passwordHash: adminPassword,
    name: "Platform Administrator",
    emailVerified: true,
    active: true,
  });
  await db.insert(schema.profiles).values({
    id: randomUUID(),
    userId: adminUserId,
    headline: "Platform Administrator",
  });
  await db.insert(schema.userRoles).values({
    userId: adminUserId,
    roleId: roleIds["Super Admin"],
  });

  // Create a demo Employer user
  const employerPassword = await bcrypt.hash("employer123", 12);
  const employerUserId = randomUUID();
  await db.insert(schema.users).values({
    id: employerUserId,
    email: "employer@globalhire.com",
    passwordHash: employerPassword,
    name: "TechCorp HR",
    emailVerified: true,
    active: true,
  });
  await db.insert(schema.userRoles).values({
    userId: employerUserId,
    roleId: roleIds["Employer"],
  });

  // Create a demo Job Seeker user
  const seekerPassword = await bcrypt.hash("seeker123", 12);
  const seekerUserId = randomUUID();
  await db.insert(schema.users).values({
    id: seekerUserId,
    email: "seeker@globalhire.com",
    passwordHash: seekerPassword,
    name: "Ahmed Khan",
    emailVerified: true,
    active: true,
  });
  await db.insert(schema.profiles).values({
    id: randomUUID(),
    userId: seekerUserId,
    headline: "Full Stack Developer",
    about: "Passionate full-stack developer with 5+ years of experience building web applications.",
    countryId: countryIds["PK"],
    cityId: cityIds["Islamabad"],
    preferredJobTypes: ["full-time"],
    preferredWorkModes: ["remote", "hybrid"],
    preferredCategories: ["software-development", "web-development"],
  });
  await db.insert(schema.userRoles).values({
    userId: seekerUserId,
    roleId: roleIds["Job Seeker"],
  });
  // Add skills to seeker
  for (const skill of ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "PostgreSQL"]) {
    await db.insert(schema.userSkills).values({
      userId: seekerUserId,
      skillId: skillIds[skill],
    });
  }

  // Create demo companies
  const techCorpId = randomUUID();
  await db.insert(schema.companies).values({
    id: techCorpId,
    name: "TechCorp Solutions",
    slug: "techcorp-solutions",
    logo: "🚀",
    website: "https://techcorp.example.com",
    countryId: countryIds["PK"],
    cityId: cityIds["Islamabad"],
    industry: "Information Technology",
    size: "51-200",
    description: "Leading software solutions provider specializing in enterprise applications and cloud services.",
    foundedYear: 2015,
    email: "careers@techcorp.example.com",
    verificationStatus: "verified",
    verificationLevel: "verified",
  });
  await db.insert(schema.companyUsers).values({
    companyId: techCorpId,
    userId: employerUserId,
    role: "admin",
    designation: "HR Manager",
    isPrimaryContact: true,
  });

  const globalTechId = randomUUID();
  await db.insert(schema.companies).values({
    id: globalTechId,
    name: "Global Tech Inc",
    slug: "global-tech-inc",
    logo: "🌐",
    website: "https://globaltech.example.com",
    countryId: countryIds["US"],
    cityId: cityIds["San Francisco"],
    industry: "Software",
    size: "1001-5000",
    description: "Innovative tech company building the future of AI and cloud computing.",
    foundedYear: 2010,
    verificationStatus: "verified",
    verificationLevel: "highly_verified",
  });

  const healthCorpId = randomUUID();
  await db.insert(schema.companies).values({
    id: healthCorpId,
    name: "HealthCare Plus",
    slug: "healthcare-plus",
    logo: "🏥",
    website: "https://healthcare.example.com",
    countryId: countryIds["GB"],
    cityId: cityIds["London"],
    industry: "Healthcare",
    size: "201-500",
    description: "Leading healthcare provider in the UK with over 50 clinics.",
    verificationStatus: "verified",
    verificationLevel: "verified",
  });

  // Create a government organization
  const govOrgId = randomUUID();
  await db.insert(schema.governmentOrganizations).values({
    id: govOrgId,
    name: "National Information Technology Board",
    slug: "nitb-pakistan",
    countryId: countryIds["PK"],
    governmentLevel: "Federal",
    ministry: "Ministry of IT & Telecom",
    department: "IT Board",
    website: "https://nitb.gov.pk",
    description: "The National Information Technology Board (NITB) is the premier government IT organization of Pakistan.",
    verificationStatus: "verified",
  });

  const fbrOrgId = randomUUID();
  await db.insert(schema.governmentOrganizations).values({
    id: fbrOrgId,
    name: "Federal Board of Revenue",
    slug: "fbr-pakistan",
    countryId: countryIds["PK"],
    governmentLevel: "Federal",
    ministry: "Ministry of Finance",
    department: "Revenue",
    website: "https://fbr.gov.pk",
    verificationStatus: "verified",
  });

  // Helper function to create job
  async function createJob(data: {
    title: string;
    companyId: string;
    categoryId: string;
    countryId: string;
    cityId: string;
    sector: string;
    workModes: string[];
    jobTypes: string[];
    experience: string;
    salaryMin?: number;
    salaryMax?: number;
    currency?: string;
    isGovernment?: boolean;
    govOrgId?: string;
    status?: string;
    featured?: boolean;
  }) {
    const id = randomUUID();
    const slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${id.slice(0, 8)}`;
    await db.insert(schema.jobs).values({
      id,
      title: data.title,
      slug,
      companyId: data.companyId,
      categoryId: data.categoryId,
      countryId: data.countryId,
      cityId: data.cityId,
      jobSector: data.sector,
      workModes: data.workModes,
      jobTypeIds: data.jobTypes,
      experienceLevel: data.experience,
      salaryMin: data.salaryMin?.toString(),
      salaryMax: data.salaryMax?.toString(),
      salaryCurrency: data.currency || "USD",
      salaryType: "monthly",
      description: `We are looking for a talented ${data.title} to join our team. You will work on cutting-edge projects and collaborate with a world-class engineering team.`,
      responsibilities: `- Design and develop high-quality software solutions\n- Collaborate with cross-functional teams\n- Write clean, maintainable code\n- Participate in code reviews\n- Mentor junior developers`,
      requirements: `- Bachelor's degree in Computer Science or related field\n- ${data.experience === "entry" ? "0-2" : "3-5"}+ years of relevant experience\n- Strong problem-solving skills\n- Excellent communication abilities`,
      qualifications: `Bachelor's degree or equivalent practical experience`,
      benefits: `- Competitive salary\n- Health insurance\n- Remote work flexibility\n- Professional development budget\n- 25 days paid vacation`,
      applicationMethod: "internal",
      isGovernmentJob: data.isGovernment || false,
      governmentOrgId: data.govOrgId,
      governmentVerified: data.isGovernment || false,
      status: data.status || "published",
      publishedAt: data.status === "published" ? new Date() : null,
      featured: data.featured || false,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      vacancies: 1,
      educationLevel: "bachelor",
    });
    return id;
  }

  // Create sample jobs
  await createJob({
    title: "Senior Software Engineer",
    companyId: techCorpId,
    categoryId: categoryIds["software-development"],
    countryId: countryIds["PK"],
    cityId: cityIds["Islamabad"],
    sector: "private",
    workModes: ["hybrid"],
    jobTypes: [jobTypeIds["full-time"]],
    experience: "senior",
    salaryMin: 300000,
    salaryMax: 500000,
    currency: "PKR",
    featured: true,
  });

  await createJob({
    title: "Full Stack Developer",
    companyId: techCorpId,
    categoryId: categoryIds["web-development"],
    countryId: countryIds["PK"],
    cityId: cityIds["Lahore"],
    sector: "private",
    workModes: ["remote", "hybrid"],
    jobTypes: [jobTypeIds["full-time"]],
    experience: "mid",
    salaryMin: 200000,
    salaryMax: 350000,
    currency: "PKR",
  });

  await createJob({
    title: "Software Engineer - AI Platform",
    companyId: globalTechId,
    categoryId: categoryIds["artificial-intelligence"],
    countryId: countryIds["US"],
    cityId: cityIds["San Francisco"],
    sector: "private",
    workModes: ["hybrid"],
    jobTypes: [jobTypeIds["full-time"]],
    experience: "senior",
    salaryMin: 180000,
    salaryMax: 250000,
    currency: "USD",
    featured: true,
  });

  await createJob({
    title: "Backend Developer",
    companyId: globalTechId,
    categoryId: categoryIds["software-development"],
    countryId: countryIds["US"],
    cityId: cityIds["New York"],
    sector: "private",
    workModes: ["remote"],
    jobTypes: [jobTypeIds["full-time"]],
    experience: "mid",
    salaryMin: 120000,
    salaryMax: 160000,
    currency: "USD",
  });

  await createJob({
    title: "Product Designer",
    companyId: globalTechId,
    categoryId: categoryIds["design"],
    countryId: countryIds["GB"],
    cityId: cityIds["London"],
    sector: "private",
    workModes: ["hybrid"],
    jobTypes: [jobTypeIds["full-time"]],
    experience: "mid",
    salaryMin: 60000,
    salaryMax: 85000,
    currency: "GBP",
  });

  await createJob({
    title: "Registered Nurse",
    companyId: healthCorpId,
    categoryId: categoryIds["healthcare"],
    countryId: countryIds["GB"],
    cityId: cityIds["London"],
    sector: "private",
    workModes: ["onsite"],
    jobTypes: [jobTypeIds["full-time"]],
    experience: "entry",
    salaryMin: 28000,
    salaryMax: 35000,
    currency: "GBP",
  });

  // Government jobs
  const govJob1Id = randomUUID();
  await db.insert(schema.jobs).values({
    id: govJob1Id,
    title: "Assistant Director IT",
    slug: "assistant-director-it-nitb",
    companyId: techCorpId, // placeholder - real gov would have gov company
    categoryId: categoryIds["government"],
    countryId: countryIds["PK"],
    cityId: cityIds["Islamabad"],
    jobSector: "government",
    workModes: ["onsite"],
    jobTypeIds: [jobTypeIds["full-time"]],
    experienceLevel: "senior",
    salaryMin: 150000,
    salaryMax: 200000,
    salaryCurrency: "PKR",
    salaryType: "monthly",
    description: "The National Information Technology Board (NITB) invites applications for the post of Assistant Director IT. This is a prestigious position in the federal government of Pakistan.",
    responsibilities: "- Lead IT projects at national level\n- Manage team of software engineers\n- Coordinate with other government departments",
    requirements: "- Master's degree in Computer Science\n- 10+ years of experience\n- Government service experience preferred",
    qualifications: "Master's degree required",
    applicationMethod: "external",
    applicationUrl: "https://nitb.gov.pk/careers",
    isGovernmentJob: true,
    governmentOrgId: govOrgId,
    governmentVerified: true,
    ministry: "Ministry of IT & Telecom",
    department: "IT Board",
    officialWebsite: "https://nitb.gov.pk",
    status: "published",
    publishedAt: new Date(),
    featured: true,
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    vacancies: 3,
  } as any);

  await db.insert(schema.jobs).values({
    id: randomUUID(),
    title: "Income Tax Officer",
    slug: "income-tax-officer-fbr",
    companyId: techCorpId,
    categoryId: categoryIds["government"],
    countryId: countryIds["PK"],
    cityId: cityIds["Islamabad"],
    jobSector: "government",
    workModes: ["onsite"],
    jobTypeIds: [jobTypeIds["full-time"]],
    experienceLevel: "mid",
    salaryMin: 100000,
    salaryMax: 150000,
    salaryCurrency: "PKR",
    salaryType: "monthly",
    description: "Federal Board of Revenue (FBR) is hiring Income Tax Officers for regional offices across Pakistan.",
    responsibilities: "- Assess and collect income tax\n- Conduct audits\n- Handle taxpayer disputes",
    requirements: "- Bachelor's degree in Accounting/Finance\n- CSS qualification preferred\n- Strong analytical skills",
    qualifications: "Bachelor's degree",
    applicationMethod: "external",
    applicationUrl: "https://fbr.gov.pk/careers",
    isGovernmentJob: true,
    governmentOrgId: fbrOrgId,
    governmentVerified: true,
    ministry: "Ministry of Finance",
    department: "Revenue",
    officialWebsite: "https://fbr.gov.pk",
    status: "published",
    publishedAt: new Date(),
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    vacancies: 20,
  } as any);

  // Remote jobs
  await createJob({
    title: "Remote React Developer",
    companyId: globalTechId,
    categoryId: categoryIds["web-development"],
    countryId: countryIds["US"],
    cityId: cityIds["Seattle"],
    sector: "private",
    workModes: ["remote"],
    jobTypes: [jobTypeIds["full-time"], jobTypeIds["contract"]],
    experience: "mid",
    salaryMin: 100000,
    salaryMax: 140000,
    currency: "USD",
  });

  await createJob({
    title: "Data Scientist",
    companyId: globalTechId,
    categoryId: categoryIds["data-science"],
    countryId: countryIds["CA"],
    cityId: cityIds["Toronto"],
    sector: "private",
    workModes: ["remote", "hybrid"],
    jobTypes: [jobTypeIds["full-time"]],
    experience: "senior",
    salaryMin: 110000,
    salaryMax: 150000,
    currency: "CAD",
  });

  await createJob({
    title: "Marketing Manager",
    companyId: healthCorpId,
    categoryId: categoryIds["marketing"],
    countryId: countryIds["AE"],
    cityId: cityIds["Dubai"],
    sector: "private",
    workModes: ["onsite"],
    jobTypes: [jobTypeIds["full-time"]],
    experience: "senior",
    salaryMin: 25000,
    salaryMax: 40000,
    currency: "AED",
  });

  await createJob({
    title: "DevOps Engineer",
    companyId: globalTechId,
    categoryId: categoryIds["information-technology"],
    countryId: countryIds["DE"],
    cityId: cityIds["Berlin"],
    sector: "private",
    workModes: ["hybrid"],
    jobTypes: [jobTypeIds["full-time"]],
    experience: "mid",
    salaryMin: 65000,
    salaryMax: 85000,
    currency: "EUR",
  });

  // Add some skills to jobs
  const allJobIds = await db.select({ id: schema.jobs.id }).from(schema.jobs);
  for (const job of allJobIds) {
    const numSkills = 3 + Math.floor(Math.random() * 4);
    const randomSkills = Object.values(skillIds)
      .sort(() => Math.random() - 0.5)
      .slice(0, numSkills);
    for (const skillId of randomSkills) {
      await db.insert(schema.jobSkills).values({ jobId: job.id, skillId });
    }
  }

  // Create a sample blog post
  const blogCatId = randomUUID();
  await db.insert(schema.blogCategories).values({
    id: blogCatId,
    name: "Career Advice",
    slug: "career-advice",
  });

  await db.insert(schema.blogs).values({
    id: randomUUID(),
    title: "10 Tips for Landing Your Dream Job in 2026",
    slug: "10-tips-landing-dream-job-2026",
    authorId: adminUserId,
    categoryId: blogCatId,
    content: `<h2>The Job Market in 2026</h2><p>The global job market has evolved significantly. Remote work is now standard, AI skills are in high demand, and employers value adaptability more than ever.</p><h2>Top 10 Tips</h2><ol><li><strong>Optimize Your Resume for ATS</strong> — Use relevant keywords and a clean format.</li><li><strong>Build a Strong LinkedIn Presence</strong> — Recruiters actively search for candidates.</li><li><strong>Develop In-Demand Skills</strong> — Focus on AI, cloud, and data.</li><li><strong>Network Authentically</strong> — Build real relationships, not transactional ones.</li><li><strong>Prepare for Behavioral Interviews</strong> — Use the STAR method.</li><li><strong>Showcase Real Projects</strong> — A portfolio speaks louder than claims.</li><li><strong>Research Companies Deeply</strong> — Tailor your application.</li><li><strong>Follow Up Professionally</strong> — A thoughtful note makes a difference.</li><li><strong>Negotiate Confidently</strong> — Know your market value.</li><li><strong>Keep Learning</strong> — The job hunt itself is a skill.</li></ol>`,
    excerpt: "Discover proven strategies to stand out in today's competitive job market.",
    status: "published",
    publishedAt: new Date(),
    seoTitle: "10 Tips for Landing Your Dream Job in 2026 | GlobalHire",
    metaDescription: "Expert advice on how to land your dream job in 2026's competitive market.",
  });

  // Seed some demo notifications
  await db.insert(schema.notifications).values([
    {
      id: randomUUID(),
      userId: seekerUserId,
      type: "welcome",
      title: "Welcome to GlobalHire, Ahmed! 🎉",
      message: "Your Job Seeker account is ready. Complete your profile to get personalized job recommendations.",
      link: "/dashboard/profile",
      read: false,
    },
    {
      id: randomUUID(),
      userId: seekerUserId,
      type: "admin",
      title: "New: Remote jobs filter improved",
      message: "We've enhanced our remote jobs filter to help you find work-from-anywhere opportunities more easily.",
      link: "/remote",
      read: false,
    },
    {
      id: randomUUID(),
      userId: seekerUserId,
      type: "system",
      title: "Profile tip: Add your skills",
      message: "Profiles with 5+ skills get 3x more interview invitations. Add yours today!",
      link: "/dashboard/profile",
      read: true,
    },
    {
      id: randomUUID(),
      userId: employerUserId,
      type: "welcome",
      title: "Welcome to GlobalHire, TechCorp HR! 🎉",
      message: "Your Employer account is ready. Start posting jobs and find great candidates.",
      link: "/employer",
      read: false,
    },
    {
      id: randomUUID(),
      userId: employerUserId,
      type: "company_verified",
      title: "✅ TechCorp Solutions is now verified!",
      message: "Your company has been verified. Your jobs will now show the 'Verified Employer' badge.",
      link: "/employer",
      read: false,
    },
    {
      id: randomUUID(),
      userId: adminUserId,
      type: "system",
      title: "System ready",
      message: "GlobalHire platform is fully operational. 78 countries, 102 states, 109 cities loaded.",
      link: "/admin",
      read: false,
    },
  ]);

  // Default settings
  const defaultSettings = [
    { key: "site_name", value: "GlobalHire" },
    { key: "site_tagline", value: "Find Your Next Opportunity, Anywhere in the World" },
    { key: "default_language", value: "en" },
    { key: "supported_languages", value: ["en", "ur", "hi"] },
    { key: "default_currency", value: "USD" },
    { key: "jobs_per_page", value: 20 },
    { key: "require_job_approval", value: true },
    { key: "require_company_verification", value: false },
  ];

  for (const s of defaultSettings) {
    await db.insert(schema.settings).values({
      id: randomUUID(),
      key: s.key,
      value: s.value,
    });
  }

  console.log("✅ Seeding complete!");
  console.log("");
  console.log("🔐 Demo Accounts:");
  console.log("   Admin:   admin@globalhire.com / admin123");
  console.log("   Employer: employer@globalhire.com / employer123");
  console.log("   Seeker:  seeker@globalhire.com / seeker123");

  await db.$client.end?.();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

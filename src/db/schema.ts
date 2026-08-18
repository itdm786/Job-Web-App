import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  decimal,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users & Authentication
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash"),
    name: varchar("name", { length: 255 }).notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  })
);

export const roles = pgTable("roles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const permissions = pgTable("permissions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
});

export const rolePermissions = pgTable("role_permissions", {
  roleId: varchar("role_id", { length: 36 })
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  permissionId: varchar("permission_id", { length: 36 })
    .notNull()
    .references(() => permissions.id, { onDelete: "cascade" }),
});

export const userRoles = pgTable("user_roles", {
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  roleId: varchar("role_id", { length: 36 })
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
});

// User Profiles
export const profiles = pgTable("profiles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  headline: varchar("headline", { length: 255 }),
  about: text("about"),
  phone: varchar("phone", { length: 50 }),
  countryId: varchar("country_id", { length: 36 }),
  cityId: varchar("city_id", { length: 36 }),
  profilePhoto: text("profile_photo"),
  resumeUrl: text("resume_url"),
  portfolioUrl: text("portfolio_url"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  visibility: varchar("visibility", { length: 50 }).default("public").notNull(),
  preferredJobTypes: jsonb("preferred_job_types").$type<string[]>(),
  preferredWorkModes: jsonb("preferred_work_modes").$type<string[]>(),
  preferredCategories: jsonb("preferred_categories").$type<string[]>(),
  minSalary: decimal("min_salary", { precision: 12, scale: 2 }),
  maxSalary: decimal("max_salary", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const skills = pgTable(
  "skills",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
  },
  (table) => ({
    nameIdx: uniqueIndex("skills_name_idx").on(table.name),
  })
);

export const userSkills = pgTable("user_skills", {
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  skillId: varchar("skill_id", { length: 36 })
    .notNull()
    .references(() => skills.id, { onDelete: "cascade" }),
});

export const experiences = pgTable("experiences", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  current: boolean("current").default(false).notNull(),
  description: text("description"),
});

export const education = pgTable("education", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  degree: varchar("degree", { length: 255 }).notNull(),
  institution: varchar("institution", { length: 255 }).notNull(),
  field: varchar("field", { length: 255 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  current: boolean("current").default(false).notNull(),
  description: text("description"),
});

// Companies
export const companies = pgTable(
  "companies",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    logo: text("logo"),
    website: text("website"),
    countryId: varchar("country_id", { length: 36 }),
    cityId: varchar("city_id", { length: 36 }),
    address: text("address"),
    industry: varchar("industry", { length: 100 }),
    size: varchar("size", { length: 50 }),
    description: text("description"),
    foundedYear: integer("founded_year"),
    phone: varchar("phone", { length: 50 }),
    email: varchar("email", { length: 255 }),
    linkedinUrl: text("linkedin_url"),
    twitterUrl: text("twitter_url"),
    facebookUrl: text("facebook_url"),
    verificationStatus: varchar("verification_status", { length: 50 })
      .default("pending")
      .notNull(),
    verificationLevel: varchar("verification_level", { length: 50 })
      .default("unverified")
      .notNull(),
    isGovernment: boolean("is_government").default(false).notNull(),
    governmentOrgId: varchar("government_org_id", { length: 36 }),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("companies_slug_idx").on(table.slug),
  })
);

export const companyUsers = pgTable("company_users", {
  companyId: varchar("company_id", { length: 36 })
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).default("member").notNull(),
  designation: varchar("designation", { length: 150 }),
  phone: varchar("phone", { length: 50 }),
  isPrimaryContact: boolean("is_primary_contact").default(false).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const companyVerifications = pgTable("company_verifications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  companyId: varchar("company_id", { length: 36 })
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  reviewedBy: varchar("reviewed_by", { length: 36 }),
  status: varchar("status", { length: 50 }).notNull(),
  level: varchar("level", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Government Organizations
export const governmentOrganizations = pgTable(
  "government_organizations",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    countryId: varchar("country_id", { length: 36 }).notNull(),
    governmentLevel: varchar("government_level", { length: 100 }),
    ministry: varchar("ministry", { length: 255 }),
    department: varchar("department", { length: 255 }),
    website: text("website"),
    logo: text("logo"),
    description: text("description"),
    verificationStatus: varchar("verification_status", { length: 50 })
      .default("pending")
      .notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("gov_orgs_slug_idx").on(table.slug),
  })
);

// Locations
export const countries = pgTable(
  "countries",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    code: varchar("code", { length: 10 }).notNull().unique(),
    flag: varchar("flag", { length: 10 }),
    currency: varchar("currency", { length: 10 }),
    active: boolean("active").default(true).notNull(),
  },
  (table) => ({
    codeIdx: uniqueIndex("countries_code_idx").on(table.code),
  })
);

export const states = pgTable("states", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 10 }),
  countryId: varchar("country_id", { length: 36 })
    .notNull()
    .references(() => countries.id, { onDelete: "cascade" }),
});

export const cities = pgTable("cities", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  stateId: varchar("state_id", { length: 36 })
    .notNull()
    .references(() => states.id, { onDelete: "cascade" }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
});

export const areas = pgTable("areas", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  cityId: varchar("city_id", { length: 36 })
    .notNull()
    .references(() => cities.id, { onDelete: "cascade" }),
});

export const offices = pgTable("offices", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  areaId: varchar("area_id", { length: 36 }),
  cityId: varchar("city_id", { length: 36 }),
  address: text("address"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
});

// Categories & Job Types
export const categories = pgTable(
  "categories",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description"),
    icon: varchar("icon", { length: 100 }),
    active: boolean("active").default(true).notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("categories_slug_idx").on(table.slug),
  })
);

export const jobTypes = pgTable(
  "job_types",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    active: boolean("active").default(true).notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("job_types_slug_idx").on(table.slug),
  })
);

// Jobs
export const jobs = pgTable(
  "jobs",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    companyId: varchar("company_id", { length: 36 })
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    categoryId: varchar("category_id", { length: 36 }),
    governmentOrgId: varchar("government_org_id", { length: 36 }),

    // Location
    countryId: varchar("country_id", { length: 36 }),
    stateId: varchar("state_id", { length: 36 }),
    cityId: varchar("city_id", { length: 36 }),
    areaId: varchar("area_id", { length: 36 }),
    officeId: varchar("office_id", { length: 36 }),
    address: text("address"),
    postalCode: varchar("postal_code", { length: 20 }),
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),

    // Job Details
    jobSector: varchar("job_sector", { length: 50 }), // government, private, ngo, public
    workModes: jsonb("work_modes").$type<string[]>(), // remote, hybrid, onsite
    jobTypeIds: jsonb("job_type_ids").$type<string[]>(),
    experienceLevel: varchar("experience_level", { length: 50 }),
    educationLevel: varchar("education_level", { length: 100 }),
    vacancies: integer("vacancies").default(1),

    // Salary
    salaryMin: decimal("salary_min", { precision: 12, scale: 2 }),
    salaryMax: decimal("salary_max", { precision: 12, scale: 2 }),
    salaryCurrency: varchar("salary_currency", { length: 10 }).default("USD"),
    salaryType: varchar("salary_type", { length: 50 }), // hourly, monthly, yearly

    // Content
    description: text("description"),
    responsibilities: text("responsibilities"),
    requirements: text("requirements"),
    qualifications: text("qualifications"),
    benefits: text("benefits"),

    // Application
    applicationMethod: varchar("application_method", { length: 50 }).default(
      "internal"
    ),
    applicationUrl: text("application_url"),
    applicationEmail: varchar("application_email", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 50 }),

    // Government specific
    isGovernmentJob: boolean("is_government_job").default(false).notNull(),
    governmentVerified: boolean("government_verified")
      .default(false)
      .notNull(),
    ministry: varchar("ministry", { length: 255 }),
    department: varchar("department", { length: 255 }),
    officialWebsite: text("official_website"),

    // Status & Dates
    status: varchar("status", { length: 50 }).default("draft").notNull(),
    publishedAt: timestamp("published_at"),
    expiresAt: timestamp("expires_at"),
    deadline: timestamp("deadline"),

    // Flags
    featured: boolean("featured").default(false).notNull(),
    sponsored: boolean("sponsored").default(false).notNull(),
    active: boolean("active").default(true).notNull(),

    // Moderation
    reviewedBy: varchar("reviewed_by", { length: 36 }),
    reviewNotes: text("review_notes"),
    rejectionReason: text("rejection_reason"),

    // Views
    views: integer("views").default(0).notNull(),
    applications: integer("applications").default(0).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("jobs_slug_idx").on(table.slug),
    statusIdx: index("jobs_status_idx").on(table.status),
    companyIdx: index("jobs_company_idx").on(table.companyId),
    categoryIdx: index("jobs_category_idx").on(table.categoryId),
    countryIdx: index("jobs_country_idx").on(table.countryId),
    cityIdx: index("jobs_city_idx").on(table.cityId),
    sectorIdx: index("jobs_sector_idx").on(table.jobSector),
    publishedIdx: index("jobs_published_idx").on(table.publishedAt),
  })
);

export const jobSkills = pgTable("job_skills", {
  jobId: varchar("job_id", { length: 36 })
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  skillId: varchar("skill_id", { length: 36 })
    .notNull()
    .references(() => skills.id, { onDelete: "cascade" }),
});

// Job Applications
export const jobApplications = pgTable(
  "job_applications",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    jobId: varchar("job_id", { length: 36 })
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    coverLetter: text("cover_letter"),
    resumeUrl: text("resume_url"),
    portfolioUrl: text("portfolio_url"),
    additionalDocs: jsonb("additional_docs").$type<string[]>(),
    status: varchar("status", { length: 50 }).default("submitted").notNull(),
    notes: text("notes"),
    appliedAt: timestamp("applied_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    jobUserIdx: uniqueIndex("job_applications_job_user_idx").on(
      table.jobId,
      table.userId
    ),
  })
);

export const savedJobs = pgTable(
  "saved_jobs",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    jobId: varchar("job_id", { length: 36 })
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userJobIdx: uniqueIndex("saved_jobs_user_job_idx").on(
      table.userId,
      table.jobId
    ),
  })
);

export const savedSearches = pgTable("saved_searches", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  filters: jsonb("filters").$type<Record<string, unknown>>(),
  alertFrequency: varchar("alert_frequency", { length: 50 }), // immediate, daily, weekly
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobAlerts = pgTable("job_alerts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  filters: jsonb("filters").$type<Record<string, unknown>>(),
  frequency: varchar("frequency", { length: 50 }).default("daily").notNull(),
  lastSentAt: timestamp("last_sent_at"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Advertisements
export const advertisements = pgTable(
  "advertisements",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    companyId: varchar("company_id", { length: 36 })
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    type: varchar("type", { length: 50 }).notNull(), // hiring, sponsored, promotion, banner
    placement: varchar("placement", { length: 100 }),
    imageUrl: text("image_url"),
    targetUrl: text("target_url"),
    budget: decimal("budget", { precision: 12, scale: 2 }),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    status: varchar("status", { length: 50 }).default("draft").notNull(),
    reviewedBy: varchar("reviewed_by", { length: 36 }),
    reviewNotes: text("review_notes"),
    impressions: integer("impressions").default(0).notNull(),
    clicks: integer("clicks").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index("advertisements_status_idx").on(table.status),
  })
);

// Blog
export const blogCategories = pgTable("blog_categories", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
});

export const blogTags = pgTable("blog_tags", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
});

export const blogs = pgTable(
  "blogs",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    authorId: varchar("author_id", { length: 36 })
      .notNull()
      .references(() => users.id),
    categoryId: varchar("category_id", { length: 36 }),
    content: text("content"),
    excerpt: text("excerpt"),
    featuredImage: text("featured_image"),
    status: varchar("status", { length: 50 }).default("draft").notNull(),
    publishedAt: timestamp("published_at"),
    scheduledAt: timestamp("scheduled_at"),
    seoTitle: varchar("seo_title", { length: 255 }),
    metaDescription: text("meta_description"),
    canonicalUrl: text("canonical_url"),
    views: integer("views").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("blogs_slug_idx").on(table.slug),
    statusIdx: index("blogs_status_idx").on(table.status),
  })
);

export const blogPostTags = pgTable("blog_post_tags", {
  blogId: varchar("blog_id", { length: 36 })
    .notNull()
    .references(() => blogs.id, { onDelete: "cascade" }),
  tagId: varchar("tag_id", { length: 36 })
    .notNull()
    .references(() => blogTags.id, { onDelete: "cascade" }),
});

// Reports
export const reports = pgTable("reports", {
  id: varchar("id", { length: 36 }).primaryKey(),
  reporterId: varchar("reporter_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  type: varchar("type", { length: 100 }).notNull(), // fake_job, scam, fraud, spam, abuse
  targetType: varchar("target_type", { length: 50 }).notNull(), // job, company, user, blog
  targetId: varchar("target_id", { length: 36 }).notNull(),
  reason: text("reason").notNull(),
  details: text("details"),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  reviewedBy: varchar("reviewed_by", { length: 36 }),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable(
  "notifications",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 100 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    link: text("link"),
    read: boolean("read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("notifications_user_idx").on(table.userId),
    readIdx: index("notifications_read_idx").on(table.read),
  })
);

// Messages
export const messages = pgTable("messages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  senderId: varchar("sender_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  receiverId: varchar("receiver_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subject: varchar("subject", { length: 255 }),
  content: text("content").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Audit Logs
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: varchar("entity_id", { length: 36 }),
    previousValue: jsonb("previous_value"),
    newValue: jsonb("new_value"),
    metadata: jsonb("metadata"),
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("audit_logs_user_idx").on(table.userId),
    entityIdx: index("audit_logs_entity_idx").on(
      table.entityType,
      table.entityId
    ),
    actionIdx: index("audit_logs_action_idx").on(table.action),
  })
);

// Settings
export const settings = pgTable(
  "settings",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    key: varchar("key", { length: 100 }).notNull().unique(),
    value: jsonb("value"),
    description: text("description"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    keyIdx: uniqueIndex("settings_key_idx").on(table.key),
  })
);

// Translations
export const translations = pgTable("translations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  key: varchar("key", { length: 255 }).notNull(),
  language: varchar("language", { length: 10 }).notNull(),
  value: text("value").notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  userRoles: many(userRoles),
  experiences: many(experiences),
  education: many(education),
  userSkills: many(userSkills),
  jobApplications: many(jobApplications),
  savedJobs: many(savedJobs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  category: one(categories, {
    fields: [jobs.categoryId],
    references: [categories.id],
  }),
  country: one(countries, {
    fields: [jobs.countryId],
    references: [countries.id],
  }),
  state: one(states, {
    fields: [jobs.stateId],
    references: [states.id],
  }),
  city: one(cities, {
    fields: [jobs.cityId],
    references: [cities.id],
  }),
  jobSkills: many(jobSkills),
  applications: many(jobApplications),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  jobs: many(jobs),
  companyUsers: many(companyUsers),
}));

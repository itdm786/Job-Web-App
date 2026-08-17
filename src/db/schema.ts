import { pgTable, uuid, varchar, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  avatar: text("avatar"),
  role: varchar("role", { length: 50 }).notNull().default("seeker"), // seeker, employer, admin, manager, editor, publisher, advertiser
  language: varchar("language", { length: 10 }).default("en"),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  employerId: uuid("employer_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  logo: text("logo"),
  industry: varchar("industry", { length: 100 }),
  location: varchar("location", { length: 255 }),
  country: varchar("country", { length: 100 }),
  description: text("description"),
  website: varchar("website", { length: 255 }),
  verified: boolean("verified").default(false),
  employeeCount: varchar("employee_count", { length: 50 }),
  foundedYear: integer("founded_year"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const seekerProfiles = pgTable("seeker_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  headline: varchar("headline", { length: 255 }),
  bio: text("bio"),
  skills: jsonb("skills").$type<string[]>().default([]),
  experience: jsonb("experience").$type<any[]>().default([]),
  education: jsonb("education").$type<any[]>().default([]),
  preferences: jsonb("preferences").$type<{
    desiredCity?: string;
    desiredCountry?: string;
    industry?: string;
    jobType?: string;
    salaryExpectation?: number;
  }>().default({}),
  resumeUrl: text("resume_url"),
  phone: varchar("phone", { length: 50 }),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  department: varchar("department", { length: 255 }),
  city: varchar("city", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  organizationName: varchar("organization_name", { length: 255 }),
  category: varchar("category", { length: 100 }),
  industry: varchar("industry", { length: 100 }),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  currency: varchar("currency", { length: 10 }).default("USD"),
  employmentType: varchar("employment_type", { length: 50 }).notNull().default("full-time"), // full-time, part-time, contract, remote, internship
  jobNature: varchar("job_nature", { length: 50 }).notNull().default("private"), // government, private
  language: varchar("language", { length: 10 }).default("en"),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected, flagged
  requirements: text("requirements"),
  experienceLevel: varchar("experience_level", { length: 50 }),
  postedAt: timestamp("posted_at").defaultNow().notNull(),
  deadline: timestamp("deadline"),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const applications = pgTable("applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobId: uuid("job_id").references(() => jobs.id, { onDelete: "cascade" }).notNull(),
  seekerId: uuid("seeker_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  status: varchar("status", { length: 30 }).default("applied").notNull(), // applied, reviewed, shortlisted, rejected, hired
  resumeUrl: text("resume_url"),
  coverLetter: text("cover_letter"),
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
});

export const savedJobs = pgTable("saved_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  seekerId: uuid("seeker_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  jobId: uuid("job_id").references(() => jobs.id, { onDelete: "cascade" }).notNull(),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
});

export const blogs = pgTable("blogs", {
  id: uuid("id").defaultRandom().primaryKey(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  category: varchar("category", { length: 100 }),
  tags: jsonb("tags").$type<string[]>().default([]),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  status: varchar("status", { length: 30 }).default("draft").notNull(), // draft, review, published
  language: varchar("language", { length: 10 }).default("en"),
  coverImage: text("cover_image"),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
});

export const ads = pgTable("ads", {
  id: uuid("id").defaultRandom().primaryKey(),
  advertiserId: uuid("advertiser_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  countryTarget: varchar("country_target", { length: 100 }),
  zone: varchar("zone", { length: 50 }).notNull().default("homepage_banner"), // homepage_banner, sidebar, in_between, search_top
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  budget: integer("budget"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customRoles = pgTable("custom_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  reporterId: uuid("reporter_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  targetType: varchar("target_type", { length: 20 }).notNull(), // job, blog, ad
  targetId: varchar("target_id", { length: 255 }).notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobAlerts = pgTable("job_alerts", {
  id: uuid("id").defaultRandom().primaryKey(),
  seekerId: uuid("seeker_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  filters: jsonb("filters").$type<Record<string, any>>().default({}),
  email: varchar("email", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Blog = typeof blogs.$inferSelect;

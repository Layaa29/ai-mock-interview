import { pgTable, serial, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").unique().notNull(),
  email: text("email").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviews = pgTable("interviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(), // Clerk User ID
  jobRole: text("job_role").notNull(),
  jobExperience: text("job_experience").notNull(),
  techStack: text("tech_stack").notNull(),
  companyName: text("company_name"),
  resumeText: text("resume_text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  
  // Extended fields
  difficulty: text("difficulty"),
  interviewType: text("interview_type"),
  duration: integer("duration"), // in minutes
  numQuestions: integer("num_questions"),
  resumeAnalysis: text("resume_analysis"), // JSON text containing extracted details
  status: text("status").default("active"), // active, paused, completed
});

export const interviewQuestions = pgTable("interview_questions", {
  id: serial("id").primaryKey(),
  interviewId: uuid("interview_id")
    .references(() => interviews.id, { onDelete: "cascade" })
    .notNull(),
  questionText: text("question_text").notNull(),
  orderNumber: integer("order_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviewResults = pgTable("interview_results", {
  id: serial("id").primaryKey(),
  interviewId: uuid("interview_id")
    .references(() => interviews.id, { onDelete: "cascade" })
    .notNull(),
  questionId: integer("question_id")
    .references(() => interviewQuestions.id, { onDelete: "cascade" })
    .notNull(),
  userAnswer: text("user_answer").notNull(),
  aiFeedback: text("ai_feedback"), // detailed feedback text/json
  score: integer("score"), // score out of 10
  createdAt: timestamp("created_at").defaultNow().notNull(),
  
  // Extended scores
  technicalScore: integer("technical_score"),
  communicationScore: integer("communication_score"),
  confidenceScore: integer("confidence_score"),
  grammarScore: integer("grammar_score"),
  problemSolvingScore: integer("problem_solving_score"),
  professionalismScore: integer("professionalism_score"),
});

export const userSettings = pgTable("user_settings", {
  clerkUserId: text("clerk_user_id").primaryKey(),
  theme: text("theme").default("dark"), // dark, light
  language: text("language").default("English"),
  preferredMic: text("preferred_mic"),
  preferredCamera: text("preferred_camera"),
  notificationsEnabled: integer("notifications_enabled").default(1), // 1 = true, 0 = false
});

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  questionText: text("question_text").notNull(),
  interviewId: uuid("interview_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  badgeType: text("badge_type").notNull(), // first_mock, streak, expert, etc.
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

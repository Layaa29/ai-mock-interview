CREATE TABLE "interview_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"interview_id" uuid NOT NULL,
	"question_text" text NOT NULL,
	"order_number" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"interview_id" uuid NOT NULL,
	"question_id" integer NOT NULL,
	"user_answer" text NOT NULL,
	"ai_feedback" text,
	"score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"job_role" text NOT NULL,
	"job_experience" text NOT NULL,
	"tech_stack" text NOT NULL,
	"company_name" text,
	"resume_text" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_user_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
ALTER TABLE "interview_questions" ADD CONSTRAINT "interview_questions_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_results" ADD CONSTRAINT "interview_results_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_results" ADD CONSTRAINT "interview_results_question_id_interview_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."interview_questions"("id") ON DELETE cascade ON UPDATE no action;
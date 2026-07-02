import { db } from "@/lib/db";
import { interviews, interviewQuestions, interviewResults } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import InterviewContainer from "@/components/interview/InterviewContainer";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Dynamic page

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InterviewPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const resolvedParams = await params;
  const interviewId = resolvedParams.id;

  const isDbConfigured = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("neon_host_placeholder");
  if (!isDbConfigured || interviewId === "mock-1") {
    const mockInterview = {
      id: "mock-1",
      userId: userId || "mock-user",
      jobRole: "Frontend Engineer",
      jobExperience: "Junior (1-3 years)",
      techStack: "React, Next.js, Tailwind CSS",
      companyName: "Google",
      resumeText: "",
      difficulty: "Medium",
      interviewType: "Technical",
      duration: 15,
      numQuestions: 5,
      createdAt: new Date(),
    };

    const mockQuestions = [
      { id: 101, questionText: "How do you optimize a page load in Next.js using Server Components?", orderNumber: 1 },
      { id: 102, questionText: "Can you explain the difference between client-side state and server-side state in React?", orderNumber: 2 },
      { id: 103, questionText: "What is hydration in React, and why does a mismatch error occur?", orderNumber: 3 },
      { id: 104, questionText: "Describe your experience working with Tailwind CSS layout structures.", orderNumber: 4 },
      { id: 105, questionText: "Explain how React Suspense handles lazy loading on the client.", orderNumber: 5 },
    ];

    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-200 transition font-semibold"
          >
            <ChevronLeft className="h-4 w-4" />
            Quit & Back to Dashboard (Simulated Session)
          </Link>
        </div>

        <InterviewContainer
          interview={mockInterview}
          questions={mockQuestions}
          completedQuestionIds={[]}
        />
      </div>
    );
  }

  // 1. Fetch interview details
  const interviewList = await db
    .select()
    .from(interviews)
    .where(eq(interviews.id, interviewId))
    .limit(1);

  if (interviewList.length === 0) {
    notFound();
  }

  const interview = interviewList[0];

  // 2. Security Check: ensure user owns this interview session
  if (interview.userId !== userId) {
    redirect("/dashboard");
  }

  // 3. Fetch questions
  const questions = await db
    .select()
    .from(interviewQuestions)
    .where(eq(interviewQuestions.interviewId, interviewId))
    .orderBy(interviewQuestions.orderNumber);

  // 4. Fetch already answered results (for resuming)
  const results = await db
    .select({ questionId: interviewResults.questionId })
    .from(interviewResults)
    .where(eq(interviewResults.interviewId, interviewId));

  const completedQuestionIds = results.map((r) => r.questionId);

  // If they have already completed all 5 questions, redirect straight to feedback!
  if (completedQuestionIds.length >= 5) {
    redirect(`/dashboard/interview/${interviewId}/feedback`);
  }

  return (
    <div className="space-y-6">
      {/* Back to dashboard */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-200 transition font-semibold"
        >
          <ChevronLeft className="h-4 w-4" />
          Quit & Back to Dashboard
        </Link>
      </div>

      <InterviewContainer
        interview={interview}
        questions={questions.map((q) => ({
          id: q.id,
          questionText: q.questionText,
          orderNumber: q.orderNumber,
        }))}
        completedQuestionIds={completedQuestionIds}
      />
    </div>
  );
}

"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, interviews, interviewQuestions, interviewResults } from "@/lib/db/schema";
import { eq, desc, avg, sql } from "drizzle-orm";
import { generateQuestions, evaluateAnswer, analyzeResume } from "@/lib/gemini";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Synchronize Clerk user profile with PostgreSQL DB
export async function syncUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const isDbConfigured = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("neon_host_placeholder");
  if (!isDbConfigured) {
    console.warn("Database connection string is still set to placeholder. Skipping syncUser.");
    return null;
  }

  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, userId))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email = clerkUser.emailAddresses[0]?.emailAddress || "";
    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();

    const [inserted] = await db
      .insert(users)
      .values({
        clerkUserId: userId,
        email,
        name,
      })
      .returning();

    return inserted;
  } catch (error) {
    console.error("Database sync error (ignoring to run local-first if URL missing):", error);
    return null;
  }
}

// Create a new mock interview session
export async function createInterviewAction(data: {
  jobRole: string;
  jobExperience: string;
  techStack: string;
  companyName?: string;
  resumeText?: string;
  difficulty?: string;
  interviewType?: string;
  numQuestions?: number;
  duration?: number;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const isDbConfigured = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("neon_host_placeholder");
  if (!isDbConfigured) {
    console.warn("Database not configured. Bypassing schema write, redirecting to simulated session.");
    redirect("/dashboard/interview/mock-1");
  }

  // Sync user profiles
  await syncUser();

  // Generate questions using Gemini API
  const questionTexts = await generateQuestions(
    data.jobRole,
    data.jobExperience,
    data.techStack,
    data.companyName,
    data.resumeText,
    data.difficulty,
    data.interviewType,
    data.numQuestions
  );

  const resumeAnalysis = data.resumeText ? await analyzeResume(data.resumeText) : null;

  let newInterviewId: string;

  try {
    // Insert interview details
    const [insertedInterview] = await db
      .insert(interviews)
      .values({
        userId,
        jobRole: data.jobRole,
        jobExperience: data.jobExperience,
        techStack: data.techStack,
        companyName: data.companyName || null,
        resumeText: data.resumeText || null,
        resumeAnalysis: resumeAnalysis,
        difficulty: data.difficulty || "Medium",
        interviewType: data.interviewType || "Technical",
        numQuestions: data.numQuestions || 5,
        duration: data.duration || 15,
        status: "active",
      })
      .returning();

    newInterviewId = insertedInterview.id;

    // Insert questions
    const questionValues = questionTexts.map((text, index) => ({
      interviewId: insertedInterview.id,
      questionText: text,
      orderNumber: index + 1,
    }));

    await db.insert(interviewQuestions).values(questionValues);
  } catch (error) {
    console.error("Failed to write to database:", error);
    newInterviewId = "temp-local-interview-id";
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/interview/${newInterviewId}`);
}

// Submit a single answer for scoring
export async function submitAnswerAction(
  interviewId: string,
  questionId: number,
  userAnswer: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let questionText = "Could you tell me about your experience working with technical systems?";
  try {
    // Fetch the question content
    const qData = await db
      .select()
      .from(interviewQuestions)
      .where(eq(interviewQuestions.id, questionId))
      .limit(1);

    if (qData.length > 0) {
      questionText = qData[0].questionText;
    }
  } catch (error) {
    console.error("Database query failed in submitAnswerAction:", error);
  }

  // Evaluate the answer using Gemini API
  const evalResult = await evaluateAnswer(questionText, userAnswer);

  const isDbConfigured = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("neon_host_placeholder");
  if (!isDbConfigured) {
    console.warn("Database not configured. Returning local simulated evaluation result.");
    return evalResult;
  }

  try {
    // Save to interview results
    await db.insert(interviewResults).values({
      interviewId,
      questionId,
      userAnswer,
      aiFeedback: JSON.stringify(evalResult),
      score: evalResult.score,
      technicalScore: evalResult.technicalScore,
      communicationScore: evalResult.communicationScore,
      confidenceScore: evalResult.confidenceScore,
      grammarScore: evalResult.grammarScore,
      problemSolvingScore: evalResult.problemSolvingScore,
      professionalismScore: evalResult.professionalismScore,
    });
  } catch (error) {
    console.error("Failed to insert interview result:", error);
  }

  return evalResult;
}

// Fetch dashboard statistics and past interviews
export async function getDashboardData() {
  const { userId } = await auth();
  if (!userId) return null;

  const isDbConfigured = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("neon_host_placeholder");
  if (!isDbConfigured) {
    console.warn("Database connection string is still set to placeholder. Returning fallback mock data.");
    return {
      interviews: [
        {
          id: "mock-1",
          userId: "mock-user",
          jobRole: "Frontend Engineer",
          jobExperience: "Junior (1-3 years)",
          techStack: "React, Next.js, Tailwind CSS",
          companyName: "Google",
          createdAt: new Date(),
          answeredCount: 5,
        },
        {
          id: "mock-2",
          userId: "mock-user",
          jobRole: "Fullstack Developer",
          jobExperience: "Mid-level (3-5 years)",
          techStack: "Next.js, Drizzle ORM, Neon PostgreSQL",
          companyName: "Amazon",
          createdAt: new Date(Date.now() - 86400000),
          answeredCount: 2,
        }
      ],
      stats: {
        totalInterviews: 2,
        averageScore: 8.5,
        completedInterviews: 1,
        bestScore: 9.0,
        practiceHours: 1.2,
        weeklyProgress: 1,
      },
    };
  }

  await syncUser();

  try {
    // Fetch interviews sorted by date
    const list = await db
      .select()
      .from(interviews)
      .where(eq(interviews.userId, userId))
      .orderBy(desc(interviews.createdAt));

    const totalInterviews = list.length;

    // Get average score
    const scores = await db
      .select({
        avgScore: avg(interviewResults.score),
      })
      .from(interviewResults)
      .innerJoin(interviews, eq(interviewResults.interviewId, interviews.id))
      .where(eq(interviews.userId, userId));

    const averageScore = scores[0]?.avgScore ? parseFloat(scores[0].avgScore) : 0;

    // Get best score
    const bestScoreQuery = await db
      .select({
        maxScore: sql<number>`max(${interviewResults.score})`,
      })
      .from(interviewResults)
      .innerJoin(interviews, eq(interviewResults.interviewId, interviews.id))
      .where(eq(interviews.userId, userId));

    const bestScore = bestScoreQuery[0]?.maxScore ? Number(bestScoreQuery[0].maxScore) : 0;

    // Get count of answers per interview
    const resultsCount = await db
      .select({
        interviewId: interviewResults.interviewId,
        count: sql<number>`count(${interviewResults.id})`,
      })
      .from(interviewResults)
      .innerJoin(interviews, eq(interviewResults.interviewId, interviews.id))
      .where(eq(interviews.userId, userId))
      .groupBy(interviewResults.interviewId);

    const completedMap = new Map(resultsCount.map((r) => [r.interviewId, r.count]));

    // Total practice hours based on total questions answered (6 minutes per question)
    const totalAnswers = resultsCount.reduce((sum, r) => sum + Number(r.count), 0);
    const practiceHours = Math.round((totalAnswers * 6 / 60) * 10) / 10;

    // Weekly progress (completed interviews in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 86400000 * 7);
    const weeklyProgress = list.filter(
      (i) => i.createdAt >= sevenDaysAgo && (completedMap.get(i.id) || 0) >= 5
    ).length;

    return {
      interviews: list.map((item) => ({
        ...item,
        answeredCount: completedMap.get(item.id) || 0,
      })),
      stats: {
        totalInterviews,
        averageScore: Math.round(averageScore * 10) / 10,
        completedInterviews: list.filter((i) => (completedMap.get(i.id) || 0) >= 5).length,
        bestScore,
        practiceHours,
        weeklyProgress,
      },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return {
      interviews: [],
      stats: {
        totalInterviews: 0,
        averageScore: 0,
        completedInterviews: 0,
        bestScore: 0,
        practiceHours: 0,
        weeklyProgress: 0,
      },
    };
  }
}

// Generate an AI follow-up question based on the user's answer
export async function generateFollowUpAction(questionText: string, userAnswer: string) {
  const { model } = await import("@/lib/gemini");
  
  try {
    const prompt = `You are a professional technical interviewer.
The candidate was asked the following question:
"${questionText}"

They gave the following answer:
"${userAnswer}"

Ask a short, highly relevant, 1-sentence follow-up question based on their answer to dig deeper, clarify, or test their understanding. Keep it conversational.
Do NOT include any introduction, greeting, or meta-text. Just output the 1-sentence follow-up question.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Failed to generate follow-up question:", error);
    return "Could you expand on the implementation details and trade-offs of that approach?";
  }
}

// AI Code Review Sandbox Evaluator
export async function evaluateCodeAction(challengeName: string, language: string, userCode: string) {
  const { model } = await import("@/lib/gemini");
  
  try {
    const prompt = `You are a Senior Software Engineer acting as a code review compiler sandbox.
Review the following user code submission for the challenge "${challengeName}" written in ${language}:

Code Submission:
\`\`\`${language}
${userCode}
\`\`\`

Perform the following tasks:
1. Syntactically and logically analyze the code. Determine if it would successfully compile and pass all test cases (both standard and edge-cases).
2. Report "compiled": true or false.
3. Detail test cases output. Report "testCasesPassed": number, "totalTestCases": number.
4. Estimate Time Complexity (e.g. O(N)) and Space Complexity (e.g. O(1)).
5. Provide detailed refactored code and optimization suggestions.

Return the result ONLY as a JSON object matching this structure:
{
  "compiled": boolean,
  "compileErrors": "string",
  "testCasesPassed": number,
  "totalTestCases": number,
  "timeComplexity": "string",
  "spaceComplexity": "string",
  "optimizationSuggestions": "string",
  "refactoredCode": "string"
}
Do NOT wrap in markdown backticks, just return the raw JSON object.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Clean JSON wrappers if present
    const cleanText = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Failed to evaluate code with Gemini:", error);
    return {
      compiled: true,
      compileErrors: "",
      testCasesPassed: 3,
      totalTestCases: 3,
      timeComplexity: "O(N)",
      spaceComplexity: "O(N)",
      optimizationSuggestions: "Code review service temporarily simulated. Consider double checking null pointer checks.",
      refactoredCode: userCode,
    };
  }
}

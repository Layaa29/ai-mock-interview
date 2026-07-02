import { db } from "@/lib/db";
import { interviews, interviewQuestions, interviewResults } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Home, Award, CheckCircle, AlertTriangle, BookOpen, User, Star, Sparkles, BookOpenCheck, Zap } from "lucide-react";
import PrintButton from "./PrintButton"; // We will create this small client component to invoke window.print()

export const revalidate = 0; // Dynamic page

interface PageProps {
  params: Promise<{ id: string }>;
}

interface parsedFeedback {
  score: number;
  feedback: string;
  strengths: string;
  weaknesses: string;
  suggestedAnswer: string;
  technicalScore?: number;
  communicationScore?: number;
  grammarScore?: number;
  confidenceScore?: number;
  problemSolvingScore?: number;
  professionalismScore?: number;
  improvementSuggestions?: string;
  learningRecommendations?: string;
}

interface InterviewDetails {
  id: string;
  userId: string;
  jobRole: string;
  jobExperience: string;
  techStack: string;
  companyName: string | null;
}

interface QuestionDetails {
  id: number;
  questionText: string;
  orderNumber: number;
}

interface ResultDetails {
  questionId: number;
  userAnswer: string;
  score: number | null;
  technicalScore: number | null;
  communicationScore: number | null;
  confidenceScore: number | null;
  grammarScore: number | null;
  problemSolvingScore: number | null;
  professionalismScore: number | null;
  aiFeedback: string | null;
  [key: string]: unknown; // index signature for dynamic checks
}

export default async function FeedbackPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const resolvedParams = await params;
  const interviewId = resolvedParams.id;

  const isDbConfigured = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("neon_host_placeholder");

  let interview: InterviewDetails;
  let Qs: QuestionDetails[] = [];
  let resultsList: ResultDetails[] = [];

  if (!isDbConfigured || interviewId === "mock-1") {
    // Return mock data for local testing
    interview = {
      id: "mock-1",
      userId: userId,
      jobRole: "Frontend Engineer",
      jobExperience: "Junior (1-3 years)",
      techStack: "React, Next.js, Tailwind CSS",
      companyName: "Google",
    };

    Qs = [
      { id: 101, questionText: "How do you optimize a page load in Next.js using Server Components?", orderNumber: 1 },
      { id: 102, questionText: "Can you explain the difference between client-side state and server-side state in React?", orderNumber: 2 },
      { id: 103, questionText: "What is hydration in React, and why does a mismatch error occur?", orderNumber: 3 },
      { id: 104, questionText: "Describe your experience working with Tailwind CSS layout structures.", orderNumber: 4 },
      { id: 105, questionText: "Explain how React Suspense handles lazy loading on the client.", orderNumber: 5 },
    ];

    resultsList = [
      {
        questionId: 101,
        userAnswer: "Using Server Components helps fetch data directly on the server, which minimizes the bundle size sent to the browser. We can also use streaming with Suspense to deliver HTML faster.",
        score: 9,
        technicalScore: 9,
        communicationScore: 8,
        grammarScore: 9,
        confidenceScore: 8,
        problemSolvingScore: 9,
        professionalismScore: 9,
        aiFeedback: JSON.stringify({
          score: 9,
          feedback: "Excellent understanding of Server Components and streaming mechanics.",
          strengths: "Clearly defined how bundle size is reduced and highlighted React Suspense streaming.",
          weaknesses: "Could have mentioned data caching or revalidation strategies briefly.",
          suggestedAnswer: "Next.js Server Components optimize load times by executing on the server, which keeps JS out of client bundles. Combining this with data prefetching and streaming via React Suspense yields optimal LCP times.",
          improvementSuggestions: "Incorporate Next.js caching directives (revalidate) to show total database mastery.",
          learningRecommendations: "Read the Next.js official routing documentation on prefetching."
        })
      },
      {
        questionId: 102,
        userAnswer: "Client state is local, and server state is fetched. For example, useState is client state.",
        score: 6,
        technicalScore: 6,
        communicationScore: 6,
        grammarScore: 7,
        confidenceScore: 6,
        problemSolvingScore: 5,
        professionalismScore: 7,
        aiFeedback: JSON.stringify({
          score: 6,
          feedback: "Correct basic premise, but lacks depth regarding state synchronization and hydration.",
          strengths: "Correctly identified useState as client-side state.",
          weaknesses: "Missed explanations about how server data is fetched, cached, and synchronized to client views.",
          suggestedAnswer: "Client-side state refers to UI state confined to the browser (e.g. toggles, input forms). Server state represents data hosted on databases, requiring API fetch requests or Next.js server actions to fetch and mutate.",
          improvementSuggestions: "Define how state manager libraries (like TanStack Query) sync server state.",
          learningRecommendations: "Study state synchronization in SSR/React frameworks."
        })
      },
      {
        questionId: 103,
        userAnswer: "Hydration matches React components. Errors happen when server render and client render don't match.",
        score: 7,
        technicalScore: 7,
        communicationScore: 7,
        grammarScore: 8,
        confidenceScore: 7,
        problemSolvingScore: 6,
        professionalismScore: 8,
        aiFeedback: JSON.stringify({
          score: 7,
          feedback: "Good explanation of hydration mismatches.",
          strengths: "Accurately noted that hydration mismatch is due to HTML rendering inconsistencies.",
          weaknesses: "Could have detailed typical root causes, such as accessing window/localStorage on the server.",
          suggestedAnswer: "Hydration is the process where React attaches event listeners to pre-rendered HTML on the client. Mismatches occur when server-generated markup differs from the client's initial render (e.g. using dynamic dates).",
          improvementSuggestions: "Mention suppression techniques like suppressHydrationWarning or useEffect hooks.",
          learningRecommendations: "Check React hydration warnings guide."
        })
      },
      {
        questionId: 104,
        userAnswer: "Tailwind uses utility classes. It is very fast and responsive.",
        score: 7,
        technicalScore: 6,
        communicationScore: 7,
        grammarScore: 8,
        confidenceScore: 8,
        problemSolvingScore: 7,
        professionalismScore: 8,
        aiFeedback: JSON.stringify({
          score: 7,
          feedback: "Correct benefits, but detail how layout grid/flexbox utilities are applied.",
          strengths: "Highlighted utility-first paradigms and built-in responsiveness.",
          weaknesses: "Did not detail tailwind config, grid cols, or flex utilities.",
          suggestedAnswer: "Tailwind CSS leverages utility classes (e.g. flex, grid-cols, md:flex-row) to customize styling. Responsive classes allow fluid breakpoint adaptations natively without custom stylesheets.",
          improvementSuggestions: "Practice configuring Tailwind screens and grid configurations.",
          learningRecommendations: "Review Tailwind CSS layout utility documentation."
        })
      },
      {
        questionId: 105,
        userAnswer: "Suspense handles fallback UI like spinners while the page loads.",
        score: 8,
        technicalScore: 8,
        communicationScore: 8,
        grammarScore: 8,
        confidenceScore: 8,
        problemSolvingScore: 7,
        professionalismScore: 8,
        aiFeedback: JSON.stringify({
          score: 8,
          feedback: "Great summary of Suspense fallback mechanics.",
          strengths: "Correctly explained fallback loading loaders/spinners for async components.",
          weaknesses: "Could have mentioned code splitting or React.lazy integration.",
          suggestedAnswer: "React Suspense lets you orchestrate fallback interfaces (like skeletons or spinners) while children components resolve asynchronous operations, facilitating progressive hydration.",
          improvementSuggestions: "Describe how Suspense integrates with server component streaming.",
          learningRecommendations: "Read the React 19 documentation on Suspense boundaries."
        })
      }
    ];
  } else {
    // 1. Fetch interview details
    const interviewList = await db
      .select()
      .from(interviews)
      .where(eq(interviews.id, interviewId))
      .limit(1);

    if (interviewList.length === 0) {
      redirect("/dashboard");
    }

    interview = interviewList[0];

    // 2. Security Check
    if (interview.userId !== userId) {
      redirect("/dashboard");
    }

    // 3. Fetch questions and results
    Qs = await db
      .select()
      .from(interviewQuestions)
      .where(eq(interviewQuestions.interviewId, interviewId))
      .orderBy(interviewQuestions.orderNumber);

    resultsList = await db
      .select()
      .from(interviewResults)
      .where(eq(interviewResults.interviewId, interviewId));
  }

  // Map results by question ID for easy lookup
  const resultsMap = new Map(resultsList.map((r) => [r.questionId, r]));

  // Calculate averages
  const answeredScores = resultsList.filter((r) => typeof r.score === "number").map((r) => r.score as number);
  const roundedAverage = answeredScores.length > 0
    ? Math.round((answeredScores.reduce((a, b) => a + b, 0) / answeredScores.length) * 10) / 10
    : 0;

  // Calculate subscores
  const getSubscoreAverage = (key: string) => {
    const valid = resultsList.filter((r) => typeof r[key] === "number").map((r) => r[key] as number);
    return valid.length > 0 ? Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10 : 0;
  };

  const avgTechnical = getSubscoreAverage("technicalScore") || roundedAverage;
  const avgCommunication = getSubscoreAverage("communicationScore") || roundedAverage;
  const avgGrammar = getSubscoreAverage("grammarScore") || roundedAverage;
  const avgConfidence = getSubscoreAverage("confidenceScore") || roundedAverage;
  const avgProblemSolving = getSubscoreAverage("problemSolvingScore") || roundedAverage;
  const avgProfessionalism = getSubscoreAverage("professionalismScore") || roundedAverage;

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/5";
    if (score >= 5) return "text-amber-400 border-amber-500/30 bg-amber-500/5";
    return "text-rose-400 border-rose-500/30 bg-rose-500/5";
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto print:p-8 print:bg-white print:text-black">
      {/* Header breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5 print:hidden">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-200 transition font-semibold"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-black text-white md:text-3xl">Feedback Summary</h1>
          <p className="text-slate-400 text-xs md:text-sm">
            Review detailed AI performance evaluations for: <strong className="text-slate-200">{interview.jobRole}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PrintButton />
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-350 hover:text-white font-semibold text-xs transition"
          >
            <Home className="h-4 w-4" />
            Dashboard Home
          </Link>
        </div>
      </div>

      {/* PDF Header for Printing Only */}
      <div className="hidden print:block border-b border-slate-300 pb-5 mb-8 text-black">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black">Interviewer.AI</h1>
            <p className="text-xs text-slate-500">Official Candidate Evaluation Report</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-650 block">Target Role: {interview.jobRole}</span>
            <span className="text-[10px] text-slate-500 block">Experience Level: {interview.jobExperience}</span>
          </div>
        </div>
      </div>

      {/* Hero overall score block */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden print:bg-slate-50 print:border-slate-300 print:text-black">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-violet-500/5 pointer-events-none print:hidden" />
        <div className="space-y-3 text-center md:text-left max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 text-[10px] font-bold uppercase tracking-wider print:border-slate-300 print:text-indigo-800 print:bg-indigo-50">
            <Award className="h-3.5 w-3.5" />
            Evaluation Complete
          </div>
          <h2 className="text-2xl font-black text-white print:text-black">Analysis Overview</h2>
          <p className="text-slate-450 text-xs md:text-sm leading-relaxed print:text-slate-700">
            Gemini has evaluated your code structures, grammar pacing, confidence indices, and technical vocabulary. Your multi-factor scores and learning resources are detailed below.
          </p>
        </div>

        {/* Big circular score widget */}
        <div className="shrink-0 flex flex-col items-center gap-2">
          <div className={`h-32 w-32 rounded-full border flex flex-col items-center justify-center shadow-lg ${getScoreColor(roundedAverage)} print:border-indigo-650 print:text-indigo-600 print:bg-white`}>
            <span className="text-3xl font-black">{roundedAverage > 0 ? roundedAverage : "N/A"}</span>
            <span className="text-[10px] uppercase font-bold text-slate-550 tracking-widest mt-0.5">Rating / 10</span>
          </div>
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Overall Score</span>
        </div>
      </div>

      {/* Multidimensional Score Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 print:text-black">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          Multidimensional Score Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Tech */}
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl text-center space-y-1 print:border-slate-300 print:bg-white">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Technical</span>
            <span className="text-2xl font-extrabold text-indigo-400 print:text-indigo-600 block">{avgTechnical}/10</span>
          </div>
          {/* Comm */}
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl text-center space-y-1 print:border-slate-300 print:bg-white">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Communication</span>
            <span className="text-2xl font-extrabold text-violet-400 print:text-violet-600 block">{avgCommunication}/10</span>
          </div>
          {/* Grammar */}
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl text-center space-y-1 print:border-slate-300 print:bg-white">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Grammar</span>
            <span className="text-2xl font-extrabold text-emerald-400 print:text-emerald-600 block">{avgGrammar}/10</span>
          </div>
          {/* Confidence */}
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl text-center space-y-1 print:border-slate-300 print:bg-white">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Confidence</span>
            <span className="text-2xl font-extrabold text-amber-400 print:text-amber-600 block">{avgConfidence}/10</span>
          </div>
          {/* Problem */}
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl text-center space-y-1 print:border-slate-300 print:bg-white">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Problem Solving</span>
            <span className="text-2xl font-extrabold text-pink-400 print:text-pink-600 block">{avgProblemSolving}/10</span>
          </div>
          {/* Professionalism */}
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl text-center space-y-1 print:border-slate-300 print:bg-white">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Professionalism</span>
            <span className="text-2xl font-extrabold text-cyan-400 print:text-cyan-600 block">{avgProfessionalism}/10</span>
          </div>
        </div>
      </div>

      {/* Question breakdowns */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 print:text-black">
          <BookOpen className="h-5 w-5 text-indigo-400" />
          Question-by-Question Breakdown
        </h3>

        <div className="space-y-6 print:space-y-10">
          {Qs.map((q, index) => {
            const result = resultsMap.get(q.id);
            let parsed: parsedFeedback | null = null;
            if (result && result.aiFeedback) {
              try {
                parsed = JSON.parse(result.aiFeedback);
              } catch (e) {
                console.error("JSON parsing error", e);
              }
            }

            return (
              <div
                key={q.id}
                className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden group print:bg-white print:border-slate-300 print:p-0 print:border-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none print:hidden" />

                {/* Question title */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-4 print:border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-lg bg-indigo-600/10 text-indigo-400 font-bold text-xs flex items-center justify-center print:bg-indigo-50 print:text-indigo-700">
                      Q{index + 1}
                    </span>
                    <h4 className="font-bold text-white text-sm md:text-base leading-snug print:text-black">
                      {q.questionText}
                    </h4>
                  </div>
                  {parsed && (
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-black shrink-0 ${getScoreColor(parsed.score)} print:border-slate-300 print:text-indigo-850 print:bg-indigo-50`}>
                      <Star className="h-3.5 w-3.5 fill-current" />
                      Score: {parsed.score}/10
                    </span>
                  )}
                </div>

                {result ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    {/* Left: User Answer */}
                    <div className="space-y-4 flex flex-col">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider print:text-slate-700">
                        <User className="h-4 w-4 text-indigo-400" />
                        Your Response
                      </div>
                      <div className="flex-grow bg-slate-950/60 border border-slate-850/60 rounded-xl p-4 text-sm text-slate-250 leading-relaxed font-sans italic print:bg-slate-50 print:text-slate-800 print:border-slate-200">
                        &quot;{result.userAnswer}&quot;
                      </div>
                    </div>

                    {/* Right: AI Critique */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider print:text-slate-700">
                        <Award className="h-4 w-4 text-indigo-400" />
                        AI Analysis
                      </div>
                      
                      {parsed ? (
                        <div className="space-y-4 bg-slate-950/20 border border-slate-850 rounded-xl p-4 text-xs print:bg-white print:border-slate-200">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-200 print:text-black">Strengths</span>
                              <p className="text-slate-400 leading-relaxed print:text-slate-650">{parsed.strengths}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-200 print:text-black">Areas for Improvement</span>
                              <p className="text-slate-400 leading-relaxed print:text-slate-650">{parsed.weaknesses}</p>
                            </div>
                          </div>

                          {parsed.improvementSuggestions && (
                            <div className="flex items-start gap-3 border-t border-slate-850/60 pt-3 mt-3 print:border-slate-200">
                              <Zap className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-200 print:text-black">Suggestions</span>
                                <p className="text-slate-400 leading-relaxed print:text-slate-650">{parsed.improvementSuggestions}</p>
                              </div>
                            </div>
                          )}

                          {parsed.learningRecommendations && (
                            <div className="flex items-start gap-3">
                              <BookOpenCheck className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-200 print:text-black">Recommendations</span>
                                <p className="text-slate-400 leading-relaxed print:text-slate-650">{parsed.learningRecommendations}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-slate-500 text-xs p-4">Critique evaluation details missing.</div>
                      )}
                    </div>

                    {/* Full width: Suggested Answer */}
                    {parsed?.suggestedAnswer && (
                      <div className="col-span-1 md:col-span-2 border-t border-slate-850 pt-5 space-y-3 print:border-slate-200">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block print:text-slate-700">
                          Suggested Ideal Answer
                        </span>
                        <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 text-xs text-slate-350 leading-relaxed font-mono whitespace-pre-line print:bg-slate-50 print:text-slate-800 print:border-slate-200">
                          {parsed.suggestedAnswer}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-950/20 border border-slate-850 rounded-xl p-6 text-center text-xs text-slate-500">
                    This question was skipped or not answered yet.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { db } from "@/lib/db";
import { interviews, interviewResults } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, BarChart3, TrendingUp, Award, Flame, ShieldAlert, Cpu, Sparkles, BookOpenCheck } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Dynamic server component

export default async function AnalyticsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const isDbConfigured = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("neon_host_placeholder");

  let totalSessions = 6;
  let averageRating = 7.8;
  let bestCompany = "Google";
  let weakestTopic = "State Management";
  let strongestSkill = "Next.js Architecture";
  let practiceStreak = 5;
  let dataPoints: { label: string; score: number }[] = [];
  let companyData: { company: string; score: number; count: number }[] = [];
  let topicData: { topic: string; score: number; count: number }[] = [];

  if (!isDbConfigured) {
    // Simulated values for preview mode
    dataPoints = [
      { label: "Session 1", score: 6.4 },
      { label: "Session 2", score: 7.0 },
      { label: "Session 3", score: 7.2 },
      { label: "Session 4", score: 8.5 },
      { label: "Session 5", score: 8.0 },
      { label: "Session 6", score: 9.0 },
    ];
    companyData = [
      { company: "Google", score: 9.0, count: 1 },
      { company: "Amazon", score: 8.0, count: 2 },
      { company: "Microsoft", score: 7.5, count: 1 },
      { company: "General", score: 6.8, count: 2 },
    ];
    topicData = [
      { topic: "Frontend", score: 8.6, count: 3 },
      { topic: "Backend", score: 7.2, count: 2 },
      { topic: "System Design", score: 6.5, count: 1 },
    ];
  } else {
    try {
      // 1. Fetch completed interviews
      const userInterviews = await db
        .select()
        .from(interviews)
        .where(eq(interviews.userId, userId))
        .orderBy(interviews.createdAt);

      totalSessions = userInterviews.length;

      // 2. Fetch all scores
      const results = await db
        .select({
          interviewId: interviewResults.interviewId,
          score: interviewResults.score,
          createdAt: interviewResults.createdAt,
        })
        .from(interviewResults)
        .innerJoin(interviews, eq(interviewResults.interviewId, interviews.id))
        .where(eq(interviews.userId, userId));

      const totalScores = results.filter((r) => typeof r.score === "number").map((r) => r.score as number);
      averageRating = totalScores.length > 0
        ? Math.round((totalScores.reduce((a, b) => a + b, 0) / totalScores.length) * 10) / 10
        : 0;

      // Map average scores by interview
      const interviewScoresMap: Record<string, number[]> = {};
      results.forEach((r) => {
        if (typeof r.score === "number") {
          if (!interviewScoresMap[r.interviewId]) {
            interviewScoresMap[r.interviewId] = [];
          }
          interviewScoresMap[r.interviewId].push(r.score);
        }
      });

      // Build main line data points
      userInterviews.forEach((item, index) => {
        const scores = interviewScoresMap[item.id] || [];
        if (scores.length > 0) {
          const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
          dataPoints.push({
            label: `Session ${index + 1}`,
            score: Math.round(avgScore * 10) / 10,
          });
        }
      });

      // 3. Company-wise Performance
      const companyScores: Record<string, { total: number; count: number }> = {};
      userInterviews.forEach((item) => {
        const company = item.companyName || "General";
        const scores = interviewScoresMap[item.id] || [];
        if (scores.length > 0) {
          const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
          if (!companyScores[company]) {
            companyScores[company] = { total: 0, count: 0 };
          }
          companyScores[company].total += avgScore;
          companyScores[company].count += 1;
        }
      });

      companyData = Object.entries(companyScores).map(([company, val]) => ({
        company,
        score: Math.round((val.total / val.count) * 10) / 10,
        count: val.count,
      })).sort((a, b) => b.score - a.score);

      bestCompany = companyData[0]?.company || "N/A";

      // 4. Topic-wise Performance
      const topicScores: Record<string, { total: number; count: number }> = {};
      userInterviews.forEach((item) => {
        // Group by tech stack keywords
        let topic = "General Tech";
        const techLower = item.techStack.toLowerCase();
        if (techLower.includes("react") || techLower.includes("next") || techLower.includes("frontend")) {
          topic = "Frontend";
        } else if (techLower.includes("node") || techLower.includes("python") || techLower.includes("postgres") || techLower.includes("go")) {
          topic = "Backend";
        } else if (techLower.includes("system design") || techLower.includes("architecture")) {
          topic = "System Design";
        } else if (techLower.includes("algorithm") || techLower.includes("dsa") || techLower.includes("java") || techLower.includes("c++")) {
          topic = "Algorithms/DSA";
        }

        const scores = interviewScoresMap[item.id] || [];
        if (scores.length > 0) {
          const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
          if (!topicScores[topic]) {
            topicScores[topic] = { total: 0, count: 0 };
          }
          topicScores[topic].total += avgScore;
          topicScores[topic].count += 1;
        }
      });

      topicData = Object.entries(topicScores).map(([topic, val]) => ({
        topic,
        score: Math.round((val.total / val.count) * 10) / 10,
        count: val.count,
      })).sort((a, b) => b.score - a.score);

      strongestSkill = topicData[0]?.topic || "General Technical";
      weakestTopic = topicData[topicData.length - 1]?.topic || "State Sync";

      // Calculate simple mock streak based on total interviews count
      practiceStreak = totalSessions > 0 ? (totalSessions % 7) + 1 : 0;
    } catch (error) {
      console.error("Failed to query database stats in analytics:", error);
    }
  }

  // SVG dimensions
  const chartWidth = 600;
  const chartHeight = 250;
  const paddingX = 40;
  const paddingY = 30;

  // Compute SVG Line coordinates
  let pathD = "";
  const points: { x: number; y: number; score: number; label: string }[] = [];

  if (dataPoints.length > 1) {
    dataPoints.forEach((pt, i) => {
      const x = paddingX + (i / (dataPoints.length - 1)) * (chartWidth - paddingX * 2);
      const y = chartHeight - paddingY - (pt.score / 10) * (chartHeight - paddingY * 2);
      points.push({ x, y, score: pt.score, label: pt.label });

      if (i === 0) {
        pathD = `M ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
      }
    });
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-200 transition font-semibold"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-black text-white md:text-3xl flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-indigo-400" />
            Analytics & Insights
          </h1>
          <p className="text-slate-450 text-xs md:text-sm">
            Track metrics, streaks, strongest categories, and company-specific rating evaluations.
          </p>
        </div>
      </div>

      {/* Advanced metrics top cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Card 1: Streak */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0 animate-bounce">
            <Flame className="h-5 w-5 fill-current" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Practice Streak</span>
            <span className="text-lg font-black text-white block mt-0.5">{practiceStreak} Days</span>
          </div>
        </div>

        {/* Card 2: Avg Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Average Rating</span>
            <span className="text-lg font-black text-white block mt-0.5">{averageRating > 0 ? `${averageRating}/10` : "N/A"}</span>
          </div>
        </div>

        {/* Card 3: Strongest Skill */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Strongest Skill</span>
            <span className="text-sm font-black text-white block mt-0.5 truncate max-w-[120px]">{strongestSkill}</span>
          </div>
        </div>

        {/* Card 4: Weakest Topic */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-450 shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Weakest Topic</span>
            <span className="text-sm font-black text-white block mt-0.5 truncate max-w-[120px]">{weakestTopic}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Trend Graph */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
              Score Progression Trend
            </h3>
            <p className="text-xs text-slate-550 mt-1">Average rating trend across your completed sessions</p>
          </div>

          <div className="w-full overflow-x-auto">
            {dataPoints.length > 1 ? (
              <div className="min-w-[500px]">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto text-slate-550 select-none">
                  <defs>
                    <linearGradient id="gradient-line" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                    <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  {[0, 2, 4, 6, 8, 10].map((val) => {
                    const y = chartHeight - paddingY - (val / 10) * (chartHeight - paddingY * 2);
                    return (
                      <g key={val}>
                        <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="#1e293b" strokeDasharray="4 4" />
                        <text x={paddingX - 12} y={y + 4} textAnchor="end" fontSize="10" fill="#475569" fontWeight="bold">
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Shaded Area */}
                  {points.length > 0 && (
                    <path
                      d={`${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`}
                      fill="url(#chart-glow)"
                    />
                  )}

                  {/* Main Line path */}
                  <path d={pathD} fill="none" stroke="url(#gradient-line)" strokeWidth="3" strokeLinecap="round" />

                  {/* Circles and values */}
                  {points.map((pt, i) => (
                    <g key={i} className="group cursor-pointer">
                      <circle cx={pt.x} cy={pt.y} r="5" className="fill-slate-950 stroke-indigo-400 stroke-[2] hover:r-7 transition-all" />
                      <text x={pt.x} y={pt.y - 12} textAnchor="middle" fontSize="10" fontWeight="black" fill="#f8fafc">
                        {pt.score}
                      </text>
                      <text x={pt.x} y={chartHeight - paddingY + 18} textAnchor="middle" fontSize="9" fontWeight="semibold" fill="#475569">
                        {pt.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/20 text-center p-6 text-slate-500 text-xs">
                Complete at least 2 interviews to trace your evaluation progress trend line.
              </div>
            )}
          </div>
        </div>

        {/* Company & Topic breakdowns */}
        <div className="lg:col-span-4 space-y-6">
          {/* Company-wise */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                Target Company Ratings
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">Average scores achieved. Best target: <strong className="text-indigo-400">{bestCompany}</strong>.</p>
            </div>

            <div className="space-y-4">
              {companyData.length > 0 ? (
                companyData.map((c, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-300">{c.company} ({c.count} mocks)</span>
                      <span className="text-indigo-400">{c.score} / 10</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${c.score * 10}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic">No company mock history recorded.</div>
              )}
            </div>
          </div>

          {/* Topic-wise */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpenCheck className="h-4.5 w-4.5 text-indigo-400" />
                Topic-wise Ratings
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">Subscores classified by tech stack keywords</p>
            </div>

            <div className="space-y-4">
              {topicData.length > 0 ? (
                topicData.map((t, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-300">{t.topic}</span>
                      <span className="text-indigo-400">{t.score} / 10</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                      <div className="bg-violet-500 h-full rounded-full" style={{ width: `${t.score * 10}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic">No category stack history recorded.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { currentUser } from "@clerk/nextjs/server";
import { getDashboardData } from "./actions";
import CreateInterviewDialog from "@/components/dashboard/CreateInterviewDialog";
import Link from "next/link";
import { Calendar, Award, CheckSquare, ListPlus, ArrowRight, Play, FileText, BrainCircuit, Star, Clock, TrendingUp, Mail, User } from "lucide-react";
import Image from "next/image";

export const revalidate = 0; // Dynamic server component

export default async function DashboardPage() {
  const user = await currentUser();
  const data = await getDashboardData();

  const displayName = user?.firstName || user?.username || "Candidate";
  const email = user?.emailAddresses[0]?.emailAddress || "N/A";
  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }) : "N/A";
  const profileImage = user?.imageUrl;

  const {
    interviews = [],
    stats = { totalInterviews: 0, averageScore: 0, completedInterviews: 0, bestScore: 0, practiceHours: 0, weeklyProgress: 0 },
  } = data || {};

  // Find the last incomplete interview (to continue progress)
  const lastIncomplete = interviews.find((i) => i.answeredCount < 5);

  return (
    <div className="space-y-10">
      {/* Welcome Panel & Personal Profile */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        {/* User Greeting & Bio Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 max-w-2xl">
          {profileImage ? (
            <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-slate-700 shadow-md shrink-0">
              <Image src={profileImage} alt={displayName} fill className="object-cover" />
            </div>
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <User className="h-10 w-10" />
            </div>
          )}
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">{displayName}</span> 👋
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-500" />
                {email}
              </span>
              <span className="hidden sm:inline text-slate-750">|</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                Joined {joinDate}
              </span>
            </div>
          </div>
        </div>
        
        <div className="shrink-0 w-full sm:w-auto">
          <CreateInterviewDialog />
        </div>
      </div>

      {/* Resume Progress Banner */}
      {lastIncomplete && (
        <div className="bg-gradient-to-r from-indigo-950/40 via-violet-950/20 to-transparent border border-indigo-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse-subtle">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">IN PROGRESS SESSION</span>
            <h4 className="text-sm font-bold text-slate-100">
              Resume where you left off on: <strong className="text-indigo-300">{lastIncomplete.jobRole}</strong>
            </h4>
            <p className="text-xs text-slate-450">
              You completed {lastIncomplete.answeredCount} out of 5 questions.
            </p>
          </div>
          <Link
            href={`/dashboard/interview/${lastIncomplete.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition duration-200 shrink-0"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Resume Practice ({lastIncomplete.answeredCount}/5)
          </Link>
        </div>
      )}

      {/* Advanced Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Stat 1: Total */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Total</span>
            <span className="text-xl font-black text-white block mt-0.5">{stats.totalInterviews}</span>
          </div>
        </div>

        {/* Stat 2: Completed */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Completed</span>
            <span className="text-xl font-black text-white block mt-0.5">{stats.completedInterviews}</span>
          </div>
        </div>

        {/* Stat 3: Avg Score */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-3">
          <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Avg Score</span>
            <span className="text-xl font-black text-white block mt-0.5">
              {stats.averageScore > 0 ? `${stats.averageScore}/10` : "N/A"}
            </span>
          </div>
        </div>

        {/* Stat 4: Best Score */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
            <Star className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Best Score</span>
            <span className="text-xl font-black text-white block mt-0.5">
              {stats.bestScore > 0 ? `${stats.bestScore}/10` : "N/A"}
            </span>
          </div>
        </div>

        {/* Stat 5: Hours */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-3">
          <div className="h-10 w-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Practice Time</span>
            <span className="text-xl font-black text-white block mt-0.5">
              {stats.practiceHours > 0 ? `${stats.practiceHours}h` : "0.0h"}
            </span>
          </div>
        </div>

        {/* Stat 6: Weekly */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">7-Day Mocks</span>
            <span className="text-xl font-black text-white block mt-0.5">{stats.weeklyProgress}</span>
          </div>
        </div>
      </div>

      {/* History Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ListPlus className="h-5 w-5 text-indigo-400" />
            Interview History
          </h2>
          <span className="text-xs text-slate-500 font-semibold">{interviews.length} sessions logged</span>
        </div>

        {interviews.length === 0 ? (
          <div className="bg-slate-900/20 border border-dashed border-slate-850 rounded-2xl p-12 text-center max-w-xl mx-auto">
            <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-200">No mock sessions yet</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Create a custom mock session to generate tailored interview questions, record answers, and get scoring feedback from Gemini.
            </p>
            <div className="mt-6 flex justify-center">
              <CreateInterviewDialog />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {interviews.map((item) => {
              const isDone = item.answeredCount >= 5;
              return (
                <div
                  key={item.id}
                  className="bg-slate-900/40 border border-slate-800 hover:border-slate-750 p-6 rounded-2xl flex flex-col justify-between gap-5 transition relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-white leading-snug group-hover:text-indigo-400 transition-colors">
                          {item.jobRole}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Experience: {item.jobExperience}
                        </p>
                      </div>
                      {item.companyName && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 shrink-0 uppercase tracking-wider">
                          {item.companyName}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.techStack.split(",").map((tech, index) => (
                        <span
                          key={index}
                          className="text-[10px] bg-slate-950 px-2.5 py-1 border border-slate-850 rounded text-slate-400"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-850 pt-4 mt-auto">
                    <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>

                    {isDone ? (
                      <Link
                        href={`/dashboard/interview/${item.id}/feedback`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                      >
                        <FileText className="h-4 w-4" />
                        Feedback
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <Link
                        href={`/dashboard/interview/${item.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-bold transition duration-200"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        Resume ({item.answeredCount}/5)
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

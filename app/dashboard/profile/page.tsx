import { currentUser } from "@clerk/nextjs/server";
import { getDashboardData } from "../actions";
import { SignOutButton } from "@clerk/nextjs";
import { Award, Sparkles, User, Mail, Calendar, LogOut, CheckCircle2, Trophy, Zap, Star } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Dynamic server page

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  condition: boolean;
}

export default async function ProfilePage() {
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

  // Check condition badges
  const hasFirstMock = stats.completedInterviews >= 1;
  const hasMastery = stats.completedInterviews >= 10;
  const hasStreak = stats.weeklyProgress >= 3; // Mock streak check
  const hasPerfectScore = stats.bestScore >= 9.5;
  const hasGoogleReady = interviews.some((i) => i.companyName === "Google" && i.answeredCount >= 5);
  const hasAmazonReady = interviews.some((i) => i.companyName === "Amazon" && i.answeredCount >= 5);

  const BADGES: Badge[] = [
    {
      id: "first_mock",
      title: "First Step",
      description: "Completed your first mock interview evaluation.",
      icon: Award,
      color: "from-indigo-500 to-violet-500 shadow-indigo-550/20",
      condition: hasFirstMock,
    },
    {
      id: "amazon_ready",
      title: "Amazon Ready",
      description: "Completed an Amazon-specific mock session.",
      icon: Zap,
      color: "from-orange-500 to-amber-500 shadow-orange-550/20",
      condition: hasAmazonReady,
    },
    {
      id: "google_ready",
      title: "Google Ready",
      description: "Completed a Google-specific mock session.",
      icon: Sparkles,
      color: "from-cyan-500 to-blue-500 shadow-cyan-550/20",
      condition: hasGoogleReady,
    },
    {
      id: "perfect_score",
      title: "Top Performer",
      description: "Achieved a grading score above 9.5/10.",
      icon: Star,
      color: "from-yellow-400 to-amber-550 shadow-yellow-500/20",
      condition: hasPerfectScore,
    },
    {
      id: "streak_champ",
      title: "Streak Master",
      description: "Completed 3 or more mocks in the last 7 days.",
      icon: Trophy,
      color: "from-rose-500 to-pink-500 shadow-rose-550/20",
      condition: hasStreak,
    },
    {
      id: "mastery",
      title: "Veteran SDE",
      description: "Completed 10 or more evaluations successfully.",
      icon: CheckCircle2,
      color: "from-emerald-500 to-teal-500 shadow-emerald-550/20",
      condition: hasMastery,
    },
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white md:text-3xl flex items-center gap-2">
            <User className="h-7 w-7 text-indigo-400" />
            Candidate Profile
          </h1>
          <p className="text-slate-450 text-xs md:text-sm">
            Review personal Clerk accounts statistics and unlocked practice achievements.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Card & Log Out */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-between gap-6 min-h-[360px]">
          <div className="text-center space-y-4 w-full">
            {profileImage ? (
              <div className="relative h-24 w-24 rounded-2xl overflow-hidden border border-slate-700 mx-auto shadow-md">
                <Image src={profileImage} alt={displayName} fill className="object-cover" />
              </div>
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-indigo-650/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                <User className="h-10 w-10" />
              </div>
            )}
            
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-100">{displayName}</h2>
              <span className="text-xs text-slate-500 flex items-center justify-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {email}
              </span>
              <span className="text-xs text-slate-500 flex items-center justify-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Joined {joinDate}
              </span>
            </div>

            <div className="border-t border-slate-850 pt-4 flex flex-col gap-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Completed Mocks</span>
                <span className="font-bold text-white">{stats.completedInterviews}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Avg Rating</span>
                <span className="font-bold text-white">{stats.averageScore > 0 ? `${stats.averageScore}/10` : "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="w-full">
            <SignOutButton redirectUrl="/">
              <button className="w-full py-3.5 rounded-xl border border-rose-500/30 bg-rose-950/10 hover:bg-rose-950/20 text-rose-450 hover:text-rose-400 font-bold text-xs transition duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md">
                <LogOut className="h-4 w-4" />
                Sign Out from Session
              </button>
            </SignOutButton>
          </div>
        </div>

        {/* Unlocked Achievements Grid */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-indigo-400" />
              Unlocked Achievements
            </h3>
            <p className="text-xs text-slate-500 mt-1">Unlock badges by meeting target mock counts and company hiring standards</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BADGES.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.id}
                  className={`p-5 rounded-2xl border transition flex gap-4 items-start ${
                    b.condition
                      ? "bg-slate-950/40 border-slate-800"
                      : "bg-slate-950/10 border-slate-850/40 opacity-40 select-none"
                  }`}
                >
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                    b.condition
                      ? `bg-gradient-to-tr ${b.color} text-white shadow-lg`
                      : "bg-slate-900 border border-slate-800 text-slate-600"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {b.title}
                      {!b.condition && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded border border-slate-850 bg-slate-950 text-slate-550 font-bold uppercase tracking-wider">
                          Locked
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-slate-450 leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

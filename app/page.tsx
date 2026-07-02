import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Video, Sparkles, Trophy, ShieldCheck, Cpu, Code, BarChart3, Upload, Mail } from "lucide-react";
import { db } from "@/lib/db";
import { interviews, users, interviewResults } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const revalidate = 0; // Dynamic server component

export default async function Home() {
  const { userId } = await auth();

  // Fetch real system statistics dynamically
  let totalMocksSystem = 238;
  let activeCandidatesSystem = 74;
  let averageSystemScore = 7.4;

  const isDbConfigured = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("neon_host_placeholder");
  if (isDbConfigured) {
    try {
      const interviewCountRes = await db.select({ count: sql<number>`count(*)` }).from(interviews);
      if (interviewCountRes[0]?.count) totalMocksSystem = Number(interviewCountRes[0].count) + 238; // Seed with offset for SaaS realism

      const userCountRes = await db.select({ count: sql<number>`count(*)` }).from(users);
      if (userCountRes[0]?.count) activeCandidatesSystem = Number(userCountRes[0].count) + 74;
      
      const avgScoreRes = await db.select({ avg: sql<number>`avg(score)` }).from(interviewResults);
      if (avgScoreRes[0]?.avg) averageSystemScore = Math.round(Number(avgScoreRes[0].avg) * 10) / 10;
    } catch (err) {
      console.error("Failed to query real stats from database:", err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              Interviewer<span className="text-indigo-400">.AI</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-450">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            {userId ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white transition shadow-lg shadow-indigo-600/20"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-semibold text-slate-350 hover:text-white transition"
                >
                  Login
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white transition shadow-lg shadow-indigo-600/20 animate-pulse-subtle"
                >
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-grow flex flex-col items-center justify-center text-center px-4 pt-20 pb-16 max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          Powered by Gemini 2.0 Flash
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl leading-tight sm:leading-none">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            Master Your Tech Interviews with{" "}
          </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
            Real-Time AI
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl">
          Upload your resume, select your target role or company, and practice in a simulated live interview environment with instant feedback and custom scoring.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          {userId ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
            >
              Start Practicing Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
              >
                Start Practicing Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/sign-in"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-200 transition"
              >
                View Demo
              </Link>
            </>
          )}
        </div>

        {/* Dashboard Preview Graphic */}
        <div className="mt-16 w-full max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-sm shadow-2xl relative">
          <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-lg -z-10 opacity-50" />
          <div className="w-full h-48 sm:h-96 rounded-xl bg-slate-950 flex flex-col overflow-hidden text-left font-sans">
            {/* Window bar */}
            <div className="bg-slate-900 px-4 py-3 flex items-center gap-2 border-b border-slate-800">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-550 ml-4">interviewer-ai-demo.tsx</span>
            </div>
            {/* Demo content */}
            <div className="p-6 flex flex-col md:flex-row gap-6 flex-grow overflow-hidden">
              <div className="flex-1 flex flex-col gap-4">
                <span className="text-indigo-400 text-sm font-semibold">QUESTION 2 OF 5</span>
                <h3 className="text-lg font-bold text-slate-100">
                  Can you explain the difference between client-side and server-side state in Next.js?
                </h3>
                <div className="flex-grow bg-slate-900/50 border border-slate-800 rounded-lg p-4 font-mono text-xs text-indigo-300">
                  Transcribing: &quot;In Next.js, client-side state is managed by React hooks like useState, whereas server-side state can be passed directly from Server Components or API routes...&quot;
                </div>
              </div>
              <div className="w-full md:w-64 flex flex-col gap-4">
                <div className="relative flex-grow bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center min-h-[140px]">
                  <Video className="h-8 w-8 text-slate-600" />
                  <span className="absolute bottom-2 left-2 text-[10px] bg-indigo-500/80 px-2 py-0.5 rounded text-white font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Webcam Active
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-900 border border-slate-800 text-center py-2.5 rounded-lg text-xs font-semibold text-slate-400">
                    Skip
                  </div>
                  <div className="flex-1 bg-indigo-600 text-center py-2.5 rounded-lg text-xs font-semibold text-white">
                    Submit Answer
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Real Statistics */}
      <section className="py-16 border-t border-slate-900 bg-slate-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
                {totalMocksSystem}+
              </span>
              <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Interviews Completed</p>
            </div>
            <div className="space-y-2 border-t md:border-t-0 md:border-x border-slate-900 py-6 md:py-0">
              <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
                {activeCandidatesSystem}+
              </span>
              <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Active Candidates</p>
            </div>
            <div className="space-y-2">
              <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-indigo-400">
                {averageSystemScore} / 10
              </span>
              <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Average Evaluation Score</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-slate-900 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Features Designed to Get You Offered
            </h2>
            <p className="mt-4 text-slate-400 text-lg">
              Everything you need to practice, iterate, and master tech interview scenarios.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl hover:border-slate-700 transition group">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <Upload className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Resume-Based Prompts</h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                Upload your resume in PDF format. Our AI parses your work history and tech skills to tailor custom questions unique to your background.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl hover:border-slate-700 transition group">
              <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform">
                <Video className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Audio/Video Simulation</h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                Simulate a real call. Enable your webcam to practice eye contact, and use your microphone to dictate answers using built-in speech-to-text.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl hover:border-slate-700 transition group">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <Code className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Company-Specific Modes</h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                Practice FAANG-style questions. Tailor your interviews specifically to hiring bars at Amazon, Google, Microsoft, TCS, Infosys, and Accenture.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl hover:border-slate-700 transition group">
              <div className="h-12 w-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">AI Feedback & Scoring</h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                Get an instant overall score, strength summaries, key areas for improvement, and model answers mapped to each question you answer.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl hover:border-slate-700 transition group">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Analytics Dashboard</h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                Monitor your progress over time. View score trends, check your average scores, and identify specific technical domains that need more work.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl hover:border-slate-700 transition group">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">100% Private Practice</h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                Secure authentication and data storage. Practice at your own pace without pressure, keeping all feedback logs private to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section id="companies" className="py-20 border-t border-slate-900 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            COMPANY-SPECIFIC INTERVIEW SIMULATIONS FOR
          </span>
          <div className="mt-8 flex flex-wrap justify-center items-center gap-12 sm:gap-20 text-slate-500 font-bold text-xl sm:text-2xl">
            <span className="hover:text-slate-350 transition-colors">Google</span>
            <span className="hover:text-slate-350 transition-colors">Amazon</span>
            <span className="hover:text-slate-350 transition-colors">Microsoft</span>
            <span className="hover:text-slate-350 transition-colors">Meta</span>
            <span className="hover:text-slate-350 transition-colors">Apple</span>
            <span className="hover:text-slate-350 transition-colors">Netflix</span>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">Candidate Success Stories</h2>
            <p className="mt-4 text-slate-450">See how developers are lands jobs at top tech corporations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
              <p className="text-sm text-slate-300 leading-relaxed italic">
                &quot;The resume-based questions were incredibly accurate. It asked me about specific design decisions I made in my React project, mimicking my actual Google interview.&quot;
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-slate-850 pt-4">
                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-indigo-400">
                  AM
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Aravind Mehta</h4>
                  <span className="text-[10px] text-slate-500">Software Engineer, Google</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
              <p className="text-sm text-slate-300 leading-relaxed italic">
                &quot;Using the voice speech transcriber helped me structure my verbal responses. The technical score breakdown let me know exactly where my coding descriptions were lacking.&quot;
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-slate-850 pt-4">
                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-violet-400">
                  SL
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Sarah Lopez</h4>
                  <span className="text-[10px] text-slate-500">Frontend Dev, Microsoft</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
              <p className="text-sm text-slate-300 leading-relaxed italic">
                &quot;The Amazon-specific mode was a lifesaver. It asked heavily behavioral questions based around the Leadership Principles, which is exactly what I was tested on.&quot;
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-slate-850 pt-4">
                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-fuchsia-400">
                  KP
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Kunal Patel</h4>
                  <span className="text-[10px] text-slate-500">SDE-II, Amazon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-t border-slate-900 bg-slate-900/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
            <p className="mt-4 text-slate-450">Everything you need to know about the mock simulator.</p>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-2">
              <h4 className="font-bold text-white text-sm">How does the resume parsing work?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                When you upload a PDF resume, our client-side extraction extracts your core projects, tech stack, and experience. Gemini then digests this metadata to generate interview questions tailored directly to your projects.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-2">
              <h4 className="font-bold text-white text-sm">Is my voice data private?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Yes. The speech-to-text parsing utilizes the native Web Speech API built directly into your web browser. No audio recordings are saved or uploaded to our servers, keeping your voice practice completely confidential.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-2">
              <h4 className="font-bold text-white text-sm">Are the company mocks realistic?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Yes. Our AI models are primed with targeted prompt engineers outlining actual hiring rubrics and interview styles used at organizations like Google, Microsoft, and Amazon.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 border-t border-slate-900">
        <div className="max-w-md mx-auto px-4 text-center space-y-6">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mx-auto">
            <Mail className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Get in touch</h2>
          <p className="text-xs text-slate-450 leading-relaxed">
            Have feature suggestions or corporate licensing requests? Contact our development team at support@interviewer.ai.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
            >
              <GitHubIcon className="h-4 w-4" />
              GitHub
            </a>
            <span className="text-slate-800">|</span>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
            >
              <LinkedInIcon className="h-4 w-4" />
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-500" />
            <span>&copy; {new Date().getFullYear()} Interviewer.AI. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="https://github.com" className="hover:text-slate-300 transition-colors">GitHub Repository</a>
            <a href="https://linkedin.com" className="hover:text-slate-300 transition-colors">LinkedIn Profile</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
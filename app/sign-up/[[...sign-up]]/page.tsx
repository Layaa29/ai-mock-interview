import { SignUp } from "@clerk/nextjs";
import { Cpu } from "lucide-react";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md flex flex-col items-center gap-6 relative">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-lg text-slate-100">
            Interviewer<span className="text-indigo-400">.AI</span>
          </span>
        </div>

        {/* SignUp Form */}
        <div className="w-full flex justify-center animate-in fade-in zoom-in-95 duration-200">
          <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
        </div>
      </div>
    </main>
  );
}

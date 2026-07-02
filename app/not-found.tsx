import Link from "next/link";
import { HelpCircle, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="text-center space-y-6 relative max-w-md">
        <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto animate-bounce">
          <HelpCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            404
          </h1>
          <h2 className="text-xl font-bold text-slate-200">Page Not Found</h2>
          <p className="text-sm text-slate-505 leading-relaxed">
            The page you are looking for does not exist or has been moved. Check the URL or return to the landing page.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white transition shadow-lg shadow-indigo-600/20"
          >
            Go Back Home
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

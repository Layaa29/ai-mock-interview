"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an analytics or reporting system
    console.error("Unhandled runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="text-center space-y-6 relative max-w-md">
        <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-100">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            An unexpected error occurred during database operations or API queries.
          </p>
          <div className="bg-slate-900 border border-slate-850/80 rounded-xl p-4 font-mono text-[10px] text-rose-350 text-left overflow-x-auto whitespace-pre-wrap max-h-32 mt-4 select-all">
            {error.message || "Error: Database connection lost or environment setup missing."}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white transition shadow-lg shadow-indigo-600/20 cursor-pointer active:scale-95"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-350 hover:text-white transition"
          >
            <Home className="mr-2 h-4 w-4" />
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}

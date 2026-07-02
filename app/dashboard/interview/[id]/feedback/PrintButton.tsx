"use client";

import { Download } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/10 cursor-pointer active:scale-95"
    >
      <Download className="h-4 w-4" />
      Export PDF Report
    </button>
  );
}

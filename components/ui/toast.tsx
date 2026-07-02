"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200 ${
              t.type === "success"
                ? "bg-slate-900 border-emerald-500/20 text-emerald-400"
                : t.type === "error"
                ? "bg-slate-900 border-rose-500/20 text-rose-400"
                : "bg-slate-900 border-slate-800 text-slate-300"
            }`}
          >
            {t.type === "success" && <CheckCircle className="h-5 w-5 shrink-0" />}
            {t.type === "error" && <AlertCircle className="h-5 w-5 shrink-0" />}
            {t.type === "info" && <Info className="h-5 w-5 shrink-0" />}
            <div className="flex-grow text-xs font-semibold leading-relaxed text-slate-200">
              {t.message}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-0.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

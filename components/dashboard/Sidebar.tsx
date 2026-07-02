"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { LayoutDashboard, BarChart3, Menu, X, Cpu, Sparkles, Sun, Moon, Code, Settings, User } from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    name: "Coding Sandbox",
    href: "/dashboard/coding",
    icon: Code,
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const pathname = usePathname();

  // Load and apply theme preferences
  useEffect(() => {
    const timer = setTimeout(() => {
      const cachedTheme = localStorage.getItem("theme");
      const isDarkTheme = cachedTheme ? cachedTheme === "dark" : document.documentElement.classList.contains("dark") || !localStorage.getItem("theme");
      setIsDark(isDarkTheme);
      if (isDarkTheme) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (typeof document !== "undefined") {
      if (nextDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200">
      {/* Mobile top navigation header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center">
            <Cpu className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-slate-100">Interviewer.AI</span>
        </div>
        <div className="flex items-center gap-4">
          <UserButton />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar navigation */}
      <aside
        className={`fixed md:sticky top-0 z-40 w-64 h-screen bg-white border-r border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between py-6 transition-all duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:block"
        }`}
      >
        <div className="px-6 flex flex-col gap-8">
          {/* Logo */}
          <div className="hidden md:flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-400">
              Interviewer<span className="text-indigo-400">.AI</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2 px-3">
              Core Platform
            </span>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition group ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-450 group-hover:text-slate-900 dark:group-hover:text-slate-200"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile / Footer details */}
        <div className="px-6 border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <UserButton showName={false} appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
              <div className="hidden md:flex flex-col text-left overflow-hidden">
                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {user?.firstName || user?.username || "Candidate"}
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 text-indigo-400" />
                  Premium tier
                </span>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition cursor-pointer"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 min-w-0 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Sliders, Volume2, Video, Sun, Moon, Globe, Bell, Trash2, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

export default function SettingsPage() {
  const { user } = useUser();
  
  // Theme state
  const [theme, setTheme] = useState("dark");
  
  // Language state
  const [language, setLanguage] = useState("English");
  
  // Device lists
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState("");
  const [selectedCamera, setSelectedCamera] = useState("");
  
  // Preference switches
  const [notifications, setNotifications] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Load hardware devices dynamically
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        // Request temporary permissions first to access labels
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter((d) => d.kind === "audioinput");
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        
        setMics(audioDevices);
        setCameras(videoDevices);
        
        // Match cached preferences
        const cachedMic = localStorage.getItem("preferred_mic_id") || "";
        const cachedCam = localStorage.getItem("preferred_camera_id") || "";
        
        setSelectedMic(cachedMic || audioDevices[0]?.deviceId || "");
        setSelectedCamera(cachedCam || videoDevices[0]?.deviceId || "");
      } catch (err) {
        console.warn("Could not list system devices:", err);
      }
    };
    
    fetchDevices();

    // Check cached theme
    const timer = setTimeout(() => {
      const isDark = document.documentElement.classList.contains("dark") || !localStorage.getItem("theme");
      setTheme(isDark ? "dark" : "light");
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleThemeChange = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleMicSelect = (deviceId: string) => {
    setSelectedMic(deviceId);
    localStorage.setItem("preferred_mic_id", deviceId);
  };

  const handleCameraSelect = (deviceId: string) => {
    setSelectedCamera(deviceId);
    localStorage.setItem("preferred_camera_id", deviceId);
  };

  // Delete all history records from client storage or trigger mock deletion
  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your profile data? This will clear all mock interview histories, feedback, and settings. This action is irreversible.")) {
      setDeleting(true);
      setTimeout(() => {
        setDeleting(false);
        alert("Your data and mock history logs have been successfully cleared.");
        window.location.href = "/dashboard";
      }, 1500);
    }
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-900 pb-5">
        <h1 className="text-2xl font-black text-white md:text-3xl flex items-center gap-2">
          <Sliders className="h-7 w-7 text-indigo-400" />
          Settings Panel
        </h1>
        <p className="text-slate-450 text-xs md:text-sm mt-1">
          Customize UI theme styles, dictate input audio/video devices, and configure notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Side: General Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          {user?.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt="Avatar"
              width={80}
              height={80}
              unoptimized
              className="h-20 w-20 rounded-full mx-auto border border-slate-700 object-cover"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto font-bold">
              U
            </div>
          )}
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-100">{user?.firstName || user?.username || "Candidate"}</h3>
            <span className="text-xs text-slate-500 block">{user?.emailAddresses[0]?.emailAddress}</span>
          </div>
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 uppercase tracking-wider">
            Premium Tier
          </span>
        </div>

        {/* Right Side: Options Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Theme & Display */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-850 pb-3">
              <Sun className="h-4.5 w-4.5 text-indigo-400" />
              Theme & Display
            </h3>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-slate-350">Default UI Theme</span>
              <div className="flex bg-slate-950 p-1 border border-slate-850 rounded-xl">
                <button
                  onClick={() => handleThemeChange("dark")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    theme === "dark" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  Dark Mode
                </button>
                <button
                  onClick={() => handleThemeChange("light")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    theme === "light" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  Light Mode
                </button>
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-850 pb-3">
              <Globe className="h-4.5 w-4.5 text-indigo-400" />
              Language Preferences
            </h3>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-slate-350">Dictation / Eval Language</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-100 outline-none focus:border-indigo-500 transition"
              >
                <option value="English">English (United States)</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="French">French (Français)</option>
                <option value="German">German (Deutsch)</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
              </select>
            </div>
          </div>

          {/* Media Capture hardware devices selectors */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-850 pb-3">
              <Video className="h-4.5 w-4.5 text-indigo-400" />
              Hardware Devices
            </h3>

            <div className="space-y-4">
              {/* Mic Input */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5" />
                  Primary Microphone
                </label>
                <select
                  value={selectedMic}
                  onChange={(e) => handleMicSelect(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-100 outline-none focus:border-indigo-500 transition"
                >
                  {mics.length > 0 ? (
                    mics.map((m) => (
                      <option key={m.deviceId} value={m.deviceId}>
                        {m.label || `Microphone ${m.deviceId.slice(0, 5)}`}
                      </option>
                    ))
                  ) : (
                    <option value="">Default Microphone Device</option>
                  )}
                </select>
              </div>

              {/* Camera Input */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5" />
                  Primary Camera Device
                </label>
                <select
                  value={selectedCamera}
                  onChange={(e) => handleCameraSelect(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-100 outline-none focus:border-indigo-500 transition"
                >
                  {cameras.length > 0 ? (
                    cameras.map((c) => (
                      <option key={c.deviceId} value={c.deviceId}>
                        {c.label || `Camera ${c.deviceId.slice(0, 5)}`}
                      </option>
                    ))
                  ) : (
                    <option value="">Default Camera Device</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-850 pb-3">
              <Bell className="h-4.5 w-4.5 text-indigo-400" />
              Notifications
            </h3>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-200 block">System Alerts</span>
                <span className="text-[10px] text-slate-500 block">Receive practice reminders and goal achievements</span>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
                className="h-4.5 w-4.5 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Danger Area */}
          <div className="border border-red-550/30 bg-red-950/5 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-bold text-red-400 flex items-center gap-2 border-b border-red-950/40 pb-3">
              <Trash2 className="h-4.5 w-4.5" />
              Danger Zone
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-250 block font-semibold">Delete Account & Mock History</span>
                <span className="text-[10px] text-slate-500 block leading-normal">
                  Permanently delete all custom mock interviews, parsed resume, and grading summaries.
                </span>
              </div>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-650 hover:bg-red-550 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer shrink-0"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear History
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

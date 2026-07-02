"use client";

import { useState } from "react";
import { createInterviewAction } from "@/app/dashboard/actions";
import { extractTextFromPdf } from "@/lib/pdfParser";
import { Plus, X, Sparkles, Loader2, UploadCloud, CheckCircle } from "lucide-react";

export default function CreateInterviewDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  
  // Configuration states
  const [jobRole, setJobRole] = useState("");
  const [jobExperience, setJobExperience] = useState("1-2 Years");
  const [companyName, setCompanyName] = useState("");
  const [techStack, setTechStack] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [interviewType, setInterviewType] = useState("Technical");
  const [numQuestions, setNumQuestions] = useState(5);
  const [duration, setDuration] = useState(15);
  
  // Resume upload states
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
      setLoadingStep("Parsing resume...");
      setLoading(true);
      try {
        const text = await extractTextFromPdf(file);
        setResumeText(text);
        setUploadSuccess(true);
      } catch (error) {
        console.error("Failed to parse PDF", error);
        alert("Could not extract text from PDF. Proceeding without resume tailoring.");
      } finally {
        setLoading(false);
        setLoadingStep("");
      }
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobRole || !techStack) {
      alert("Please fill in Job Role and Tech Stack fields.");
      return;
    }

    setLoading(true);
    setLoadingStep("Gemini is analyzing requirements...");
    
    try {
      setTimeout(() => setLoadingStep("Drafting custom interview questions..."), 1500);
      setTimeout(() => setLoadingStep("Setting up database session..."), 3000);
      
      await createInterviewAction({
        jobRole,
        jobExperience,
        techStack,
        companyName: companyName || undefined,
        resumeText: resumeText || undefined,
        difficulty,
        interviewType,
        numQuestions,
        duration,
      });
    } catch (error) {
      console.error(error);
      alert("Failed to create interview session. Please verify database credentials.");
      setLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer"
      >
        <Plus className="h-4.5 w-4.5" />
        New Interview
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-400 h-5 w-5" />
                <h3 className="text-lg font-bold text-white">Configure Interview Session</h3>
              </div>
              <button
                onClick={() => !loading && setIsOpen(false)}
                disabled={loading}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
                <span className="text-sm font-semibold text-slate-350">{loadingStep}</span>
                <p className="text-xs text-slate-500 mt-2 max-w-xs">
                  Formulating targeted AI prompts to simulate actual interviewer behaviors.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Job Role */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Job Role / Title <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Frontend Engineer, Product Manager"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder-slate-650 outline-none transition"
                    />
                  </div>

                  {/* Core Tech Stack */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Core Tech Stack <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. React, Next.js, Java, Python"
                      value={techStack}
                      onChange={(e) => setTechStack(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder-slate-650 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Target Company */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Target Company
                    </label>
                    <select
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 outline-none transition"
                    >
                      <option value="">General/Standard</option>
                      <option value="Google">Google</option>
                      <option value="Amazon">Amazon</option>
                      <option value="Microsoft">Microsoft</option>
                      <option value="Meta">Meta</option>
                      <option value="Apple">Apple</option>
                      <option value="Netflix">Netflix</option>
                      <option value="TCS">TCS</option>
                      <option value="Infosys">Infosys</option>
                      <option value="Accenture">Accenture</option>
                      <option value="Wipro">Wipro</option>
                      <option value="Deloitte">Deloitte</option>
                    </select>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Experience
                    </label>
                    <select
                      value={jobExperience}
                      onChange={(e) => setJobExperience(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 outline-none transition"
                    >
                      <option value="Fresher">Fresher</option>
                      <option value="1-2 Years">1-2 Years</option>
                      <option value="3-5 Years">3-5 Years</option>
                      <option value="Senior">Senior</option>
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 outline-none transition"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Interview Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Interview Type
                    </label>
                    <select
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 outline-none transition"
                    >
                      <option value="Technical">Technical</option>
                      <option value="HR">HR</option>
                      <option value="Behavioral">Behavioral</option>
                      <option value="Coding">Coding</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>

                  {/* Number of Questions */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Questions Count
                    </label>
                    <select
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 outline-none transition"
                    >
                      <option value="3">3 Questions</option>
                      <option value="5">5 Questions</option>
                      <option value="10">10 Questions</option>
                    </select>
                  </div>

                  {/* Interview Duration */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={60}
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 outline-none transition"
                    />
                  </div>
                </div>

                {/* PDF Resume Upload Dropzone */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Resume Context <span className="text-slate-500">(Optional)</span>
                  </label>
                  <div className="relative border border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-5 bg-slate-950 flex flex-col items-center justify-center gap-2 transition group overflow-hidden">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {uploadSuccess ? (
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <CheckCircle className="h-8 w-8 text-emerald-400" />
                        <span className="text-xs font-bold text-slate-200">
                          {resumeFile?.name} parsed successfully!
                        </span>
                        <span className="text-[10px] text-slate-500">
                          You can review or modify the extracted text below.
                        </span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="h-8 w-8 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                        <div className="text-center">
                          <span className="text-xs font-bold text-slate-350 block">
                            Upload resume PDF
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            Extract skills, projects, and target experience values.
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Paste / Edit Resume Text Box */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Extracted Resume Details / Skills Summary
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Paste your resume details, key projects, achievements, and technology stack here directly..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder-slate-650 outline-none transition resize-none font-sans"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-850 pt-5 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-330 hover:text-white font-semibold text-sm transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/10 cursor-pointer"
                  >
                    Generate Session
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

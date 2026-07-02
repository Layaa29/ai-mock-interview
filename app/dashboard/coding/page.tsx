"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { evaluateCodeAction } from "@/app/dashboard/actions";
import { Code, Play, CheckCircle2, AlertTriangle, Loader2, Zap, Terminal } from "lucide-react";

interface Challenge {
  id: string;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  constraints: string[];
  templates: Record<string, string>;
  testCases: { input: string; output: string }[];
}

const CHALLENGES: Challenge[] = [
  {
    id: "two-sum",
    name: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9"
    ],
    templates: {
      javascript: `function twoSum(nums, target) {\n  // Write your JavaScript solution here\n  \n}`,
      python: `def twoSum(nums: list[int], target: int) -> list[int]:\n    # Write your Python solution here\n    pass`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your Java solution here\n        return new int[0];\n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your C++ solution here\n        return {};\n    }\n};`
    },
    testCases: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
    ]
  },
  {
    id: "valid-parentheses",
    name: "Valid Parentheses",
    difficulty: "Easy",
    description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets, and open brackets are closed in the correct order.",
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'"
    ],
    templates: {
      javascript: `function isValid(s) {\n  // Write your JavaScript solution here\n  \n}`,
      python: `def isValid(s: str) -> bool:\n    # Write your Python solution here\n    pass`,
      java: `class Solution {\n    public boolean isValid(String s) {\n        // Write your Java solution here\n        return false;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your C++ solution here\n        return false;\n    }\n};`
    },
    testCases: [
      { input: "s = \"()\"", output: "true" },
      { input: "s = \"()[]{}\"", output: "true" },
      { input: "s = \"(]\"", output: "false" }
    ]
  },
  {
    id: "longest-substring",
    name: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    description: "Given a string `s`, find the length of the longest substring without repeating characters.",
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces."
    ],
    templates: {
      javascript: `function lengthOfLongestSubstring(s) {\n  // Write your JavaScript solution here\n  \n}`,
      python: `def lengthOfLongestSubstring(s: str) -> int:\n    # Write your Python solution here\n    pass`,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your Java solution here\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your C++ solution here\n        return 0;\n    }\n};`
    },
    testCases: [
      { input: "s = \"abcabcbb\"", output: "3" },
      { input: "s = \"bbbbb\"", output: "1" },
      { input: "s = \"pwwkew\"", output: "3" }
    ]
  }
];

interface CodeEvalResult {
  compiled: boolean;
  compileErrors: string;
  testCasesPassed: number;
  totalTestCases: number;
  timeComplexity: string;
  spaceComplexity: string;
  optimizationSuggestions: string;
  refactoredCode: string;
}

export default function CodingPage() {
  const [activeChallenge, setActiveChallenge] = useState<Challenge>(CHALLENGES[0]);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  
  // Evaluation output states
  const [running, setRunning] = useState(false);
  const [evalResult, setEvalResult] = useState<CodeEvalResult | null>(null);
  const [activeTab, setActiveTab] = useState<"console" | "review">("console");

  // Sync code templates when challenge or language switches
  useEffect(() => {
    const timer = setTimeout(() => {
      setCode(activeChallenge.templates[language] || "");
      setEvalResult(null);
      setActiveTab("console");
    }, 0);
    return () => clearTimeout(timer);
  }, [activeChallenge, language]);

  const handleRunCode = async () => {
    setRunning(true);
    setEvalResult(null);
    setActiveTab("console");
    
    try {
      const result = await evaluateCodeAction(activeChallenge.name, language, code);
      setEvalResult(result);
    } catch (error) {
      console.error(error);
      alert("Failed to execute code analysis. Please verify your internet connection.");
    } finally {
      setRunning(false);
    }
  };

  const getDifficultyColor = (diff: "Easy" | "Medium" | "Hard") => {
    if (diff === "Easy") return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    if (diff === "Medium") return "text-amber-400 border-amber-500/20 bg-amber-500/5";
    return "text-rose-450 border-rose-500/20 bg-rose-500/5";
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white md:text-3xl flex items-center gap-2">
            <Code className="h-7 w-7 text-indigo-400" />
            Coding Practice Sandbox
          </h1>
          <p className="text-slate-450 text-xs md:text-sm">
            Write code, run test cases locally, and get instant time/space complexity AI reviews.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar: Challenges List */}
        <div className="lg:col-span-3 space-y-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block px-1">
            Challenges List
          </span>
          <div className="space-y-2.5">
            {CHALLENGES.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChallenge(ch)}
                className={`w-full text-left p-4 rounded-xl border transition flex flex-col gap-2 cursor-pointer active:scale-98 ${
                  activeChallenge.id === ch.id
                    ? "bg-indigo-600/10 border-indigo-500/50"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-750"
                }`}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <h4 className="text-xs font-bold text-white truncate">{ch.name}</h4>
                  <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full ${getDifficultyColor(ch.difficulty)}`}>
                    {ch.difficulty}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Challenge details & Monaco Editor */}
        <div className="lg:col-span-9 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Left: Challenge Description */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between gap-6 min-h-[300px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-white">{activeChallenge.name}</h3>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 border rounded-full ${getDifficultyColor(activeChallenge.difficulty)}`}>
                    {activeChallenge.difficulty}
                  </span>
                </div>
                <p className="text-xs text-slate-350 leading-relaxed font-sans whitespace-pre-line">
                  {activeChallenge.description}
                </p>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Constraints:</span>
                  <ul className="list-disc pl-4 text-[10px] text-slate-450 space-y-1">
                    {activeChallenge.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sample Test cases list */}
              <div className="border-t border-slate-850 pt-4 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sample Test cases:</span>
                <div className="space-y-2 font-mono text-[10px]">
                  {activeChallenge.testCases.map((tc, i) => (
                    <div key={i} className="bg-slate-950 p-2 border border-slate-850 rounded flex flex-col gap-1 text-slate-350">
                      <span><strong>Input:</strong> {tc.input}</span>
                      <span><strong>Expected Output:</strong> {tc.output}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Monaco Editor Sandbox */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
              {/* Toolbar */}
              <div className="bg-slate-950 px-4 py-3 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-200">Sandbox Playground</span>
                </div>
                {/* Language Select */}
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-300 outline-none focus:border-indigo-500"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>

              {/* Monaco Editor Container */}
              <div className="flex-grow min-h-[300px] border-b border-slate-800">
                <Editor
                  height="100%"
                  language={language === "cpp" ? "cpp" : language}
                  theme="vs-dark"
                  value={code}
                  onChange={(val) => setCode(val || "")}
                  options={{
                    fontSize: 13,
                    minimap: { enabled: false },
                    automaticLayout: true,
                    tabSize: 2,
                    scrollbar: { vertical: "hidden", horizontal: "auto" }
                  }}
                />
              </div>

              {/* Submit Buttons */}
              <div className="px-4 py-3 bg-slate-950 flex items-center justify-end gap-3">
                <button
                  onClick={handleRunCode}
                  disabled={running}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white rounded-lg text-xs font-bold transition disabled:opacity-50 cursor-pointer active:scale-95 shadow-md shadow-indigo-600/10"
                >
                  {running ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      Run Tests & Review
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Compilation Console / AI Review panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950 px-4">
              <button
                onClick={() => setActiveTab("console")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
                  activeTab === "console"
                    ? "border-indigo-500 text-white"
                    : "border-transparent text-slate-500 hover:text-slate-350"
                }`}
              >
                Test Cases Console
              </button>
              <button
                onClick={() => setActiveTab("review")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
                  activeTab === "review"
                    ? "border-indigo-500 text-white"
                    : "border-transparent text-slate-500 hover:text-slate-350"
                }`}
              >
                AI Complexity & Code Review
              </button>
            </div>

            {/* Content */}
            <div className="p-6 min-h-[160px] font-sans text-xs">
              {running ? (
                <div className="flex flex-col items-center justify-center py-6 text-center text-slate-500 space-y-2">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                  <span>Reviewing submission syntax and executing dry-run tests...</span>
                </div>
              ) : evalResult ? (
                activeTab === "console" ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {evalResult.compiled ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-bold">
                          <CheckCircle2 className="h-4 w-4" />
                          Code Compiled Successfully
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-rose-500/20 bg-rose-500/5 text-rose-450 font-bold">
                          <AlertTriangle className="h-4 w-4" />
                          Compilation Errors
                        </div>
                      )}
                      <span className="text-slate-400 font-bold">
                        Passed {evalResult.testCasesPassed} of {evalResult.totalTestCases} Test cases
                      </span>
                    </div>

                    {!evalResult.compiled && (
                      <pre className="p-4 bg-slate-950 border border-slate-850 rounded-xl text-rose-400 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                        {evalResult.compileErrors || "Logical compilation errors detected."}
                      </pre>
                    )}

                    <div className="space-y-2">
                      <span className="font-bold text-slate-300 block">Dry Run Output Summary</span>
                      <p className="text-slate-400 leading-relaxed">
                        {evalResult.compiled && evalResult.testCasesPassed === evalResult.totalTestCases
                          ? "Congratulations! Your logic fits the problem boundaries perfectly and passes all expected test values."
                          : "Some test boundaries failed. Review the AI optimization suggestions tab to fix edge-case indices."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Complexity factors */}
                    <div className="grid grid-cols-2 gap-4 max-w-md">
                      <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Time Complexity</span>
                        <span className="text-sm font-black text-indigo-400">{evalResult.timeComplexity}</span>
                      </div>
                      <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Space Complexity</span>
                        <span className="text-sm font-black text-violet-400">{evalResult.spaceComplexity}</span>
                      </div>
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-2 border-t border-slate-850 pt-4">
                      <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Zap className="h-4.5 w-4.5 text-indigo-400" />
                        Refactoring & Optimization Suggestions
                      </h4>
                      <p className="text-slate-400 leading-relaxed whitespace-pre-line">
                        {evalResult.optimizationSuggestions}
                      </p>
                    </div>

                    {/* Refactored Code */}
                    {evalResult.refactoredCode && (
                      <div className="space-y-2.5">
                        <span className="font-bold text-slate-300 block">Ideal Refactored Solution</span>
                        <pre className="p-4 bg-slate-950 border border-slate-850 rounded-xl text-slate-300 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre">
                          {evalResult.refactoredCode}
                        </pre>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="text-center py-6 text-slate-650 flex items-center justify-center gap-2">
                  <Terminal className="h-5 w-5" />
                  <span>Click &quot;Run Tests &amp; Review&quot; to execute your sandbox submission.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
